# Twilight DeFi

A calm, cinematic wallet dashboard for Arbitrum. Send, receive, stake and track real assets in an
interface built for legibility instead of spectacle.

Submission for the **Arbitrum Open House Online Buildathon** (HackQuest). Deployed on **Arbitrum
Sepolia** (chain `421614`).

---

## The problem

Most DeFi front-ends look and behave the same way: neon accents, animated charts nobody reads,
percentage figures with no provenance, and a dozen tokens competing for attention. The effect is
that the two things a user actually needs — *what do I hold* and *what just happened to it* — are
the hardest things on the page to find.

That is not a cosmetic complaint. An interface that signals "casino" trains people to click
quickly, and an interface that presents unverifiable numbers with the same confidence as verified
ones teaches people not to distinguish between them.

## The approach

Twilight DeFi is a trust-first interface. Three rules, applied without exception:

**1. Only real chain data.** Every figure in the UI is a live read from Arbitrum Sepolia — native
balance, token balances, staked principal, accrued rewards, transaction history, and the pool's
APR. There is no fixture path, no seeded demo state, no placeholder that fills in when a read is
slow. While a value is loading it renders as a skeleton; if it fails it renders an error with the
RPC message; if the chain genuinely has nothing, the panel says *"No transactions yet — send your
first payment."*

**2. Nothing is stated that cannot be derived.** The dashboard shows no fiat total, because TWLT is
a testnet asset with no market and any aggregate would be a number we invented. The staking APR is
computed from the pool's live `rewardRate` and `totalStaked`, and it is hidden entirely — not
replaced with a rounder, friendlier number — when the pool has no stake or no active reward period.

**3. Grayscale discipline.** The palette is strictly monochrome apart from one warm-white glow used
for the moon and the balance halo. Direction is carried by arrow glyphs and type weight, never by
green/red. Removing colour as a signalling channel forces the hierarchy to be carried by typography
and spacing, which is what makes the numbers legible in the first place.

The visual language — twilight sky, bare branches at the corners, a diffuse moon — is the argument
made in another register: this is infrastructure for holding money, and it should feel like dusk,
not like a trading floor.

### What is genuinely novel here

Not the token mechanics. `TwilightToken` is a standard OpenZeppelin ERC-20 and `TwilightStaking` is
a clean reimplementation of the Synthetix accumulator pattern — both deliberately boring, because
staking maths is the wrong place to be creative.

The novel part is the product angle: **treating calm and verifiability as the feature**, and
enforcing it structurally rather than by intention. The "no invented numbers" rule is not a promise
in a README; it is why there is no fiat total, why the APR can render as `—`, and why the empty
state is a first-class design element rather than an afterthought.

---

## Architecture

```
 Browser
   │
   ├── Next.js 15 (App Router) ── React 19 ── Tailwind v4
   │      landing  /       →  full-bleed twilight scene, one CTA
   │      dashboard /app   →  balances · history · assets · staking · send/receive · faucet
   │
   ├── wagmi v2 + viem v2 + RainbowKit v2   (grayscale-themed wallet modal)
   │      reads  → useReadContracts / useBalance      (8–12s refetch)
   │      logs   → eth_getLogs with adaptive range splitting
   │      writes → useWriteContract + useWaitForTransactionReceipt
   │
   └── RPC: fallback(  NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL
                     → sepolia-rollup.arbitrum.io/rpc
                     → arbitrum-sepolia.drpc.org )
                                │
                          Arbitrum Sepolia (421614)
                                │
              ┌─────────────────┴──────────────────┐
        TwilightToken (TWLT)              TwilightStaking
        ERC-20 + rate-limited faucet      Synthetix-style accrual
        MAX_SUPPLY cap                    stake / withdraw / claimRewards / exit
        FaucetClaimed event               Staked / Withdrawn / RewardPaid events
```

### Single source of truth for addresses

Addresses are never typed twice:

```
forge script Deploy            →  contracts/deployments/421614.json
node script/sync-deployment.mjs →  frontend/deployments/arbitrumSepolia.json  (addresses + ABIs)
npm run gen:contracts           →  frontend/lib/generated/contracts.ts        (`as const`, typed)
```

The last step exists so wagmi/viem can infer function names and return types at compile time. Every
file downstream imports from `lib/contracts.ts`, which reads only that generated module.

### Transaction history without an indexer

Token and staking activity is read straight from event logs — `Transfer` (both directions),
`FaucetClaimed`, `Staked`, `Withdrawn`, `RewardPaid` — filtered by indexed topic on the connected
address, so no dependency on a third-party API.

Public RPCs cap `eth_getLogs` block spans, and the cap differs per provider and is not advertised.
Rather than hard-coding a chunk size, `getLogsResilient` requests the full range and halves it on
failure until the provider accepts it, under a fixed request budget: one round trip when the
endpoint is generous, a handful when it is not.

**One Arbitrum-specific trap worth naming**, since it silently ruins this pattern: Solidity's
`block.number` on Arbitrum returns an estimate of the *L1* block, not the L2 block. Recording it in
the deploy script gave a `fromBlock` roughly **283 million blocks** behind the L2 head — the queries
still returned correct results, so nothing looked broken, but each page load took **~4 minutes**
while the RPC scanned the entire chain. The deployment block is therefore read from the broadcast
receipts, which carry the true L2 number. Same query, same results, **3.4 seconds**.

Plain ETH transfers emit no logs and therefore cannot be read this way. If
`NEXT_PUBLIC_ARBISCAN_API_KEY` is set, the app also lists them via the Arbiscan account API; if it
is not, the panel's subtitle says the history covers token and staking activity. It never quietly
omits a category and lets you assume otherwise.

---

## Contracts

### `TwilightToken.sol` (TWLT)

Standard OpenZeppelin `ERC20` + `Ownable`, 18 decimals. Additions:

| Member | Behaviour |
| --- | --- |
| `faucet()` | Mints 100 TWLT to `msg.sender`, at most once per 24h per address. Permissionless, so judges self-serve. |
| `nextFaucetClaim(address)` | Timestamp the address may next claim — the UI's cooldown comes from here, not a local timer. |
| `mint(address,uint256)` | Owner-only, used to top up the reward pool. |
| `MAX_SUPPLY` | Hard cap of 100,000,000 TWLT, enforced in the constructor, `faucet()` and `mint()`. |

The cooldown check is `last != 0 && block.timestamp < last + FAUCET_COOLDOWN` rather than a bare
subtraction, so the first claim is never gated on chains whose timestamp is below the cooldown.

### `TwilightStaking.sol`

Single-sided TWLT staking with linear accrual — a clean reimplementation of the Synthetix
`StakingRewards` accumulator, not a copy-paste. A global `rewardPerTokenStored` advances with time
and each account snapshots its debt in `userRewardPerTokenPaid`, so accrual is O(1) per user
regardless of how many stakers exist.

External surface: `stake`, `withdraw`, `claimRewards`, `exit`, `notifyRewardAmount` (owner),
`recoverERC20` (owner), plus `earned`, `rewardPerToken`, `remainingRewards`, `rewardPoolBalance`.
Every external function carries NatSpec; every state change emits an event.

Design decisions worth pointing at:

- **Same-token pool safety.** The staking token *is* the reward token, which is the classic way
  these pools go insolvent. `totalStaked` is tracked separately from the raw balance and rewards
  are only ever paid from `balanceOf(this) - totalStaked`, so principal can never be paid out as
  someone else's reward.
- **Solvency by construction, not by check.** `notifyRewardAmount` pulls the reward in atomically,
  and `rewardRate * duration <= reward + leftover` because integer division truncates down. A
  runtime balance assertion here would be dead code that can never revert; the invariant is
  documented and covered by a test instead. What *is* checked is `rewardRate == 0`, a real footgun
  where a period silently emits nothing.
- **Reentrancy.** `stake`, `withdraw`, `claimRewards` and `notifyRewardAmount` are `nonReentrant`.
  The tests prove it against a malicious ERC-20 that re-enters on transfer, rather than asserting
  the modifier exists.
- **`claimRewards` is a no-op when nothing has accrued** — no revert, no event — so the UI can call
  it without pre-flight checks.

### Tests

```bash
cd contracts && forge test -vv
```

38 tests, all passing. Coverage includes:

- faucet mint amount, per-address rate limiting, the exact cooldown boundary, first-claim-at-genesis
- `MAX_SUPPLY` enforcement in constructor, `faucet` and `mint`; owner-only `mint`
- stake/withdraw balance and event correctness, zero-amount and over-withdraw reverts
- reward accrual over `vm.warp`: single staker, pro-rata split across stakers and time, accrual
  stopping at `periodFinish`, accrual pausing while the pool is empty
- withdrawing leaves rewards claimable; `exit()` does both; claim zeroes accrual without touching
  principal
- leftover roll-over into a new period at 1.5× the old rate
- **reentrancy guards exercised for real** on both `withdraw` and `claimRewards`, via a token whose
  `_update` calls back into the pool
- solvency invariant across a 7-day walk, plus a fuzz test that total accrual never exceeds what the
  period actually emitted

---

## Deployed addresses (Arbitrum Sepolia)

<!-- DEPLOYMENT -->
Both contracts are deployed and **source-verified** — click through and read the code on Arbiscan.

| Contract | Address | Arbiscan |
| --- | --- | --- |
| `TwilightToken` (TWLT) | `0x6ab1B7ec49c0AcA914311754e304e46b2739950D` | [verified source](https://sepolia.arbiscan.io/address/0x6ab1B7ec49c0AcA914311754e304e46b2739950D#code) |
| `TwilightStaking` | `0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca` | [verified source](https://sepolia.arbiscan.io/address/0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca#code) |

- Deployer / owner: [`0x6b320D758485B9b8cB62010cf8D5AF94849e896B`](https://sepolia.arbiscan.io/address/0x6b320D758485B9b8cB62010cf8D5AF94849e896B)
- Deployment block (L2): `294287900`
- Initial supply: 10,000,000 TWLT
- Reward period: **1,000,000 TWLT over 365 days** — `rewardRate` = `31709791983764586` wei/s
  (0.0317 TWLT/s), live from deployment

The pool is funded and already accruing, so the dashboard shows real movement immediately rather
than a cold-start zero state.
<!-- /DEPLOYMENT -->

---

## Running locally

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node 20+

### Clone

`forge-std` and `openzeppelin-contracts` are git submodules, so clone recursively:

```bash
git clone --recursive https://github.com/shinothelegend/Twilight.git
```

Already cloned without it? `git submodule update --init --recursive`.

### Contracts

```bash
cd contracts
forge test -vv
```

### Deploy to Arbitrum Sepolia

Get testnet ETH first — [arbitrum.faucet.dev](https://arbitrum.faucet.dev/),
[faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia) or
[l2faucet.com/arbitrum](https://www.l2faucet.com/arbitrum). If you only have Ethereum Sepolia ETH,
bridge it at [bridge.arbitrum.io](https://bridge.arbitrum.io/).

```bash
cd contracts
cp .env.example .env    # fill in PRIVATE_KEY (throwaway testnet key only)
set -a && source .env && set +a
forge script script/Deploy.s.sol:Deploy --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" --broadcast
node script/sync-deployment.mjs
```

The script deploys TWLT, deploys the staking pool, and opens a 365-day reward period funded with
1,000,000 TWLT — so the dashboard shows live accrual from the first block.

Verify on Arbiscan:

```bash
cd contracts
forge verify-contract <TOKEN_ADDRESS> src/TwilightToken.sol:TwilightToken \
  --chain arbitrum-sepolia --watch \
  --constructor-args $(cast abi-encode "constructor(address,uint256)" <DEPLOYER> 10000000000000000000000000)

forge verify-contract <STAKING_ADDRESS> src/TwilightStaking.sol:TwilightStaking \
  --chain arbitrum-sepolia --watch \
  --constructor-args $(cast abi-encode "constructor(address,address)" <DEPLOYER> <TOKEN_ADDRESS>)
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # every entry is optional
npm run dev                  # http://localhost:3000
```

`npm run dev` and `npm run build` both regenerate `lib/generated/contracts.ts` from the deployment
JSON first, so the frontend can never drift from the deployed addresses.

---

## How to test it as a judge

1. Get Arbitrum Sepolia ETH from one of the faucets above.
2. Open the app and **Connect wallet** (MetaMask, Rabby, Brave or Coinbase Wallet — no
   WalletConnect project id needed).
3. **Faucet → Claim 100 TWLT.** The cooldown afterwards is read from the contract, per address.
4. **Staking → Approve TWLT → Stake.** Watch *Rewards earned* tick up every few seconds; it is a
   live `earned()` read, not an interpolated counter.
5. **Claim rewards**, then **Withdraw**. Every action appears in *Recent transactions* within a
   block or two, each row linking to Arbiscan.
6. **Send & receive → Send** some TWLT to a second address and watch it leave one history and
   appear in the other.

To confirm nothing is faked: connect a brand-new address. Every panel shows an honest empty state,
and the pool statistics still read live from the contract.

---

## Performance and accessibility

- Eight looping CSS animations make up the scene: sky drift, two mist banks at different speeds,
  the moon's halo and its own shine, star drift, star twinkle, and the shooting stars. Every one
  animates `transform`, `opacity` or `filter` **only** — never a layout property — so each is
  composited on the GPU and none can trigger reflow.
- Motion is applied at the **layer** level wherever possible. The star field drifts as one
  transformed container rather than 64 independently animated nodes; only the twinkle is per-star.
- Shooting stars are visible for ~4% of their cycle and idle for the rest, so three of them share
  the sky without it ever feeling busy.
- Star and shooting-star positions come from a fixed-seed LCG computed once at module scope, so
  server and client markup match exactly and there is no hydration churn.
- All decoration is `aria-hidden`, `pointer-events-none`, and in a fixed layer behind content, so
  balances paint immediately regardless of animation state.
- The star field is 64 dots, not thousands. No WebGL, no canvas, no particle library. The moon is
  layered CSS radial gradients, not an image.
- `prefers-reduced-motion: reduce` freezes every loop and removes the shooting stars entirely.
- Branch art is inline SVG strokes (~20 paths), not images or video.

## Project layout

```
twilight-defi/
├── contracts/
│   ├── src/{TwilightToken,TwilightStaking}.sol
│   ├── test/{TwilightToken,TwilightStaking}.t.sol
│   ├── script/Deploy.s.sol, script/sync-deployment.mjs
│   └── foundry.toml
├── frontend/
│   ├── app/{layout,page,providers}.tsx, app/app/page.tsx
│   ├── components/landing/{TwilightHero,TwilightScene,BranchSilhouette,MoonDisc}.tsx
│   ├── components/dashboard/{TopNav,BalanceCard,TransactionList,AssetList,StakingPanel,TransferPanel,FaucetCard}.tsx
│   ├── components/ui/{primitives,TxStatus}.tsx
│   ├── lib/{contracts,wagmiConfig,format}.ts
│   ├── lib/hooks/{useRealBalances,useRealTransactions,useStaking}.ts
│   └── deployments/arbitrumSepolia.json   ← generated, never hand-edited
└── README.md
```

## Licence

MIT.
