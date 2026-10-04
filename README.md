# Twilight

A calmer, fully verifiable on-chain workspace for decentralized finance.

## 🚀 LIVE DEMO
[Please clone the repository and run `npm run dev` to test the full live application against Arbitrum Sepolia]

## 📺 VIDEO
*(No video provided for this submission - prioritizing the live, working product)*

## 🌐 NETWORK
**Arbitrum Sepolia (Chain ID: 421614)**

## 📜 CONTRACTS
- **TwilightToken (TWLT)**: [0x6ab1B7ec49c0AcA914311754e304e46b2739950D](https://sepolia.arbiscan.io/address/0x6ab1B7ec49c0AcA914311754e304e46b2739950D#code)
- **TwilightStaking**: [0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca](https://sepolia.arbiscan.io/address/0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca#code)

---

## THE PROBLEM
Crypto dashboards often overload users with noisy signals, unexplained values, and unclear transaction states. The UI often feels like a chaotic casino floor rather than a secure financial workspace.

## THE SOLUTION
Twilight makes on-chain finance understandable and transparent:
- Every important number has a proven origin (provenance hints included).
- Every action has a clear, deterministic state.
- Staking is physically solvent by design.
- The interface guides rather than overwhelms with its calm "Daybreak" and "Twilight" modes.

## WHY ARBITRUM
Arbitrum provides the fast, low-cost infrastructure trusted by institutions. Its EVM equivalence means our OpenZeppelin-based contracts work flawlessly without modifications, while offering the high throughput required for a snappy decentralized application.

## WHAT IS ACTUALLY ON-CHAIN
Everything.
- Balances are read directly from contract state.
- APR is dynamically calculated based on the live reward rate.
- Staked principal and pending rewards are fetched live.
- The Faucet cooldown is enforced strictly by the contract, not the client.
- The transaction history is parsed straight from event logs.

## ARCHITECTURE
- **Smart Contracts**: Solidity, built and tested with Foundry. Strict mathematical boundaries on staking and supplies.
- **Frontend**: Next.js 15, React, wagmi, viem, and RainbowKit.
- **Visuals**: Tailwind CSS v4 custom variables for deep semantic theming, `framer-motion` for subtle physics-based interactions, and CSS 3D transforms for a zero-WebGL depth diorama.

## SECURITY
A full security audit was performed (see `SECURITY.md`). Reentrancy guards are actively deployed, reward accounting is segregated, and client inputs are strictly validated.

## TESTING
The application has been tested using Foundry for contracts and robust deterministic browser QA.
```bash
cd contracts
forge test -vv
```

## HOW TO TEST AS A JUDGE
1. **Clone the repository**: `git clone https://github.com/shinothelegend/Twilight-v2.git`
2. **Start the dev server**: `cd frontend && npm install && npm run dev`
3. **Connect a Wallet**: Use any Arbitrum Sepolia compatible wallet.
4. **Use the Faucet**: Mint 100 TWLT directly from the contract.
5. **Stake**: Approve and deposit your TWLT into the Staking pool.
6. **Toggle Theme**: Experience the cinematic cutscene between Daybreak and Twilight modes.
7. **Verify**: Notice the "WHY THIS NUMBER" hints on dashboard values to understand where data is sourced.

## ROADMAP
- **Paxos USDG Integration**: Once stable verification and environment support allows, USDG will be evaluated for stable-value settlement to separate experimental assets from pure stable-value workflows.
- **Enhanced Charting**: Historical event logs will be graphed to visually represent staking yield over time.
