"use client";

import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import type {Address, PublicClient} from "viem";
import {parseAbiItem} from "viem";
import {useAccount, usePublicClient} from "wagmi";

import {contractsDeployed, startBlock, twilightStaking, twilightToken} from "@/lib/contracts";

export type ActivityKind =
  | "send"
  | "receive"
  | "faucet"
  | "stake"
  | "unstake"
  | "reward"
  | "native-send"
  | "native-receive";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Raw token amount; pair with `symbol` for display. */
  amount: bigint;
  symbol: string;
  decimals: number;
  counterparty?: Address;
  hash: string;
  blockNumber: bigint;
  /** Unix seconds. Undefined only if the block header could not be read. */
  timestamp?: number;
};

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);
const faucetEvent = parseAbiItem("event FaucetClaimed(address indexed account, uint256 amount)");
const stakedEvent = parseAbiItem("event Staked(address indexed account, uint256 amount)");
const withdrawnEvent = parseAbiItem("event Withdrawn(address indexed account, uint256 amount)");
const rewardEvent = parseAbiItem("event RewardPaid(address indexed account, uint256 amount)");

/** Hard ceiling on log requests per refresh, so a wide range can never hammer a public RPC. */
const MAX_LOG_REQUESTS = 60;

/**
 * `eth_getLogs` with automatic range splitting.
 *
 * Public Arbitrum Sepolia endpoints cap the block span (and the response size) of a single
 * request, but the cap is not advertised and differs per provider. Rather than hard-coding a
 * chunk size, this asks for the whole range and halves it on failure until the provider accepts
 * it — one request when the RPC is generous, a handful when it is not.
 */
async function getLogsResilient(
  client: PublicClient,
  params: Record<string, unknown>,
  fromBlock: bigint,
  toBlock: bigint,
  budget: {remaining: number},
): Promise<unknown[]> {
  if (fromBlock > toBlock || budget.remaining <= 0) return [];
  budget.remaining -= 1;

  try {
    // eslint-disable-next-line
    return (await client.getLogs({...(params as any), fromBlock, toBlock})) as unknown[];
  } catch (error) {
    if (toBlock - fromBlock < 2n) throw error;
    const mid = fromBlock + (toBlock - fromBlock) / 2n;
    const [left, right] = await Promise.all([
      getLogsResilient(client, params, fromBlock, mid, budget),
      getLogsResilient(client, params, mid + 1n, toBlock, budget),
    ]);
    return [...left, ...right];
  }
}

type RawLog = {
  args: Record<string, unknown>;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
};

/**
 * Native ETH transfers, via the Arbiscan (Etherscan v2) account API.
 *
 * Plain ETH sends emit no logs, so they cannot be read with `eth_getLogs`. This is the only
 * non-RPC data source in the app and it is optional: without `NEXT_PUBLIC_ARBISCAN_API_KEY` the
 * history simply covers token and staking activity, and the UI says so. It is still real chain
 * data — Arbiscan is an indexer over Arbitrum Sepolia, not a mock.
 */
async function fetchNativeTransfers(
  address: Address,
  symbol: string,
): Promise<ActivityItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_ARBISCAN_API_KEY;
  if (!apiKey) return [];

  const url =
    `https://api.etherscan.io/v2/api?chainid=421614&module=account&action=txlist` +
    `&address=${address}&startblock=${startBlock}&sort=desc&page=1&offset=25&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return [];
  const body = (await response.json()) as {status: string; result?: unknown};
  if (body.status !== "1" || !Array.isArray(body.result)) return [];

  const rows = body.result as Array<Record<string, string>>;
  return rows
    .filter((row) => row.value !== "0" && row.isError === "0")
    .map((row) => {
      const outgoing = row.from.toLowerCase() === address.toLowerCase();
      return {
        id: `native-${row.hash}`,
        kind: outgoing ? ("native-send" as const) : ("native-receive" as const),
        amount: BigInt(row.value),
        symbol,
        decimals: 18,
        counterparty: (outgoing ? row.to : row.from) as Address,
        hash: row.hash,
        blockNumber: BigInt(row.blockNumber),
        timestamp: Number(row.timeStamp),
      };
    });
}

async function fetchActivity(
  client: PublicClient,
  address: Address,
  symbol: string,
  decimals: number,
  nativeSymbol: string,
): Promise<ActivityItem[]> {
  const latest = await client.getBlockNumber();
  const budget = {remaining: MAX_LOG_REQUESTS};
  const range = [startBlock, latest] as const;

  const [outgoing, incoming, faucets, stakes, withdrawals, rewards, natives] = await Promise.all([
    getLogsResilient(
      client,
      {address: twilightToken.address, event: transferEvent, args: {from: address}},
      ...range,
      budget,
    ),
    getLogsResilient(
      client,
      {address: twilightToken.address, event: transferEvent, args: {to: address}},
      ...range,
      budget,
    ),
    getLogsResilient(
      client,
      {address: twilightToken.address, event: faucetEvent, args: {account: address}},
      ...range,
      budget,
    ),
    getLogsResilient(
      client,
      {address: twilightStaking.address, event: stakedEvent, args: {account: address}},
      ...range,
      budget,
    ),
    getLogsResilient(
      client,
      {address: twilightStaking.address, event: withdrawnEvent, args: {account: address}},
      ...range,
      budget,
    ),
    getLogsResilient(
      client,
      {address: twilightStaking.address, event: rewardEvent, args: {account: address}},
      ...range,
      budget,
    ),
    fetchNativeTransfers(address, nativeSymbol).catch(() => [] as ActivityItem[]),
  ]);

  const base = {symbol, decimals};

  const map = (logs: unknown[], kind: ActivityKind, amountKey: string, partyKey?: string) =>
    (logs as RawLog[]).map((log) => ({
      ...base,
      id: `${log.transactionHash}-${log.logIndex}`,
      kind,
      amount: (log.args[amountKey] ?? 0n) as bigint,
      counterparty: partyKey ? (log.args[partyKey] as Address | undefined) : undefined,
      hash: log.transactionHash,
      blockNumber: log.blockNumber,
    }));

  const items: ActivityItem[] = [
    // A faucet mint is also a Transfer from the zero address; the mint is the meaningful event,
    // so incoming transfers are filtered to exclude it and the faucet log is used instead.
    ...map(
      (incoming as RawLog[]).filter(
        (log) => (log.args.from as string)?.toLowerCase() !== "0x" + "0".repeat(40),
      ),
      "receive",
      "value",
      "from",
    ),
    ...map(
      (outgoing as RawLog[]).filter(
        (log) =>
          (log.args.to as string)?.toLowerCase() !== twilightStaking.address.toLowerCase(),
      ),
      "send",
      "value",
      "to",
    ),
    ...map(faucets, "faucet", "amount"),
    ...map(stakes, "stake", "amount"),
    ...map(withdrawals, "unstake", "amount"),
    ...map(rewards, "reward", "amount"),
    ...(natives as ActivityItem[]),
  ];

  // Deduplicate: a stake emits both Staked and an ERC-20 Transfer in the same transaction.
  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    const key = `${item.hash}-${item.kind}-${item.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? b.id.localeCompare(a.id)
      : Number(b.blockNumber - a.blockNumber),
  );

  const recent = deduped.slice(0, 25);

  // Timestamps come from the block headers of the transactions we are actually showing.
  const uniqueBlocks = [...new Set(recent.map((item) => item.blockNumber))];
  const headers = await Promise.all(
    uniqueBlocks.map((blockNumber) =>
      client.getBlock({blockNumber}).catch(() => undefined),
    ),
  );
  const timestamps = new Map(
    uniqueBlocks.map((blockNumber, index) => [
      blockNumber,
      headers[index] ? Number(headers[index]!.timestamp) : undefined,
    ]),
  );

  return recent.map((item) => ({...item, timestamp: timestamps.get(item.blockNumber)}));
}

/**
 * Real transaction history for the connected account.
 *
 * Everything here is derived from Arbitrum Sepolia event logs — TWLT transfers plus the staking
 * pool's `Staked`/`Withdrawn`/`RewardPaid` events — read through the app's own RPC transport. No
 * third-party indexer, no cached fixtures. An account with no history gets an empty list, and the
 * UI renders an empty state rather than sample rows.
 */
export function useRealTransactions(symbol = "TWLT", decimals = 18, nativeSymbol = "ETH") {
  const {address} = useAccount();
  const client = usePublicClient();

  const query = useQuery({
    queryKey: ["activity", address, symbol, decimals],
    enabled: Boolean(address) && Boolean(client) && contractsDeployed,
    refetchInterval: 20_000,
    staleTime: 10_000,
    retry: 1,
    queryFn: () => fetchActivity(client!, address as Address, symbol, decimals, nativeSymbol),
  });

  return useMemo(
    () => ({
      activity: query.data ?? [],
      /** True when native ETH transfers are included; the panel labels its scope honestly. */
      includesNativeTransfers: Boolean(process.env.NEXT_PUBLIC_ARBISCAN_API_KEY),
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error as Error | null,
      refetch: query.refetch,
    }),
    [query.data, query.isLoading, query.isFetching, query.error, query.refetch],
  );
}
