#!/usr/bin/env node
/**
 * Merges the deploy script's address record with the compiled ABIs into a single file the
 * frontend imports: frontend/deployments/arbitrumSepolia.json.
 *
 * This is the only place contract addresses cross the contracts/frontend boundary — nothing is
 * hand-copied, so there is exactly one source of truth.
 *
 * Usage: node script/sync-deployment.mjs [chainId]   (default 421614 = Arbitrum Sepolia)
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const contractsDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(contractsDir, "..");
const chainId = process.argv[2] ?? "421614";

const recordPath = resolve(contractsDir, "deployments", `${chainId}.json`);
if (!existsSync(recordPath)) {
  console.error(`No deployment record at ${recordPath}. Run the deploy script first.`);
  process.exit(1);
}

const abiOf = (name) => {
  const artifact = resolve(contractsDir, "out", `${name}.sol`, `${name}.json`);
  if (!existsSync(artifact)) {
    console.error(`Missing artifact ${artifact}. Run \`forge build\` first.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(artifact, "utf8")).abi;
};

const record = JSON.parse(readFileSync(recordPath, "utf8"));

/**
 * The L2 block the contracts were created in, taken from the broadcast receipts.
 *
 * This cannot come from Solidity: Arbitrum's `block.number` returns an estimate of the *L1*
 * block, which is roughly 283 million blocks behind the L2 head. Using it as the `fromBlock` of
 * an `eth_getLogs` call makes the RPC scan the whole chain — measured at ~4 minutes per page load
 * against the public endpoint. The receipts carry the true L2 block, so the frontend starts its
 * queries exactly where the contracts began.
 */
function deploymentBlock() {
  const broadcast = resolve(
    contractsDir,
    "broadcast",
    "Deploy.s.sol",
    String(chainId),
    "run-latest.json",
  );
  if (!existsSync(broadcast)) {
    console.error(`No broadcast file at ${broadcast}. Deploy with --broadcast first.`);
    process.exit(1);
  }
  const receipts = JSON.parse(readFileSync(broadcast, "utf8")).receipts ?? [];
  const blocks = receipts
    .map((receipt) => Number(BigInt(receipt.blockNumber)))
    .filter((block) => Number.isFinite(block) && block > 0);
  if (blocks.length === 0) {
    console.error("Broadcast file has no receipts with a block number.");
    process.exit(1);
  }
  return Math.min(...blocks);
}

const out = {
  chainId: Number(record.chainId),
  network: "arbitrumSepolia",
  explorer: "https://sepolia.arbiscan.io",
  deployer: record.deployer,
  // L2 block the contracts were created in — event log queries start here, not at genesis.
  startBlock: deploymentBlock(),
  deployedAt: Number(record.deployedAt),
  contracts: {
    TwilightToken: {address: record.twilightToken, abi: abiOf("TwilightToken")},
    TwilightStaking: {address: record.twilightStaking, abi: abiOf("TwilightStaking")},
  },
};

const target = resolve(repoRoot, "frontend", "deployments", "arbitrumSepolia.json");
mkdirSync(dirname(target), {recursive: true});
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${target}`);
console.log(`  TwilightToken   ${out.contracts.TwilightToken.address}`);
console.log(`  TwilightStaking ${out.contracts.TwilightStaking.address}`);
