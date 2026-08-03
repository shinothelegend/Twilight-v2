"use client";

import {useAccount, useBalance, useReadContracts} from "wagmi";

import {contractsDeployed, twilightStaking, twilightToken} from "@/lib/contracts";

export type TokenAsset = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  /** Raw on-chain balance. `undefined` while loading — never defaulted to zero. */
  balance: bigint | undefined;
  /** Where the balance lives, so the UI can label staked vs. wallet holdings. */
  location: "wallet" | "staked";
};

/**
 * Every balance shown in the dashboard, read directly from Arbitrum Sepolia.
 *
 * There is no fallback data path: while a read is in flight the value is `undefined` and the UI
 * renders a skeleton; if a read fails, `error` is surfaced. Nothing is ever substituted.
 */
export function useRealBalances() {
  const {address, isConnected} = useAccount();
  const enabled = Boolean(address) && contractsDeployed;

  const native = useBalance({
    address,
    query: {enabled: Boolean(address), refetchInterval: 12_000},
  });

  const reads = useReadContracts({
    contracts: [
      {...twilightToken, functionName: "balanceOf", args: [address!]},
      {...twilightToken, functionName: "symbol"},
      {...twilightToken, functionName: "decimals"},
      {...twilightStaking, functionName: "stakedBalanceOf", args: [address!]},
      {...twilightStaking, functionName: "earned", args: [address!]},
    ],
    query: {enabled, refetchInterval: 12_000},
  });

  const [tokenBalance, symbol, decimals, staked, earned] = reads.data ?? [];

  const tokenDecimals = typeof decimals?.result === "number" ? decimals.result : 18;
  const tokenSymbol = typeof symbol?.result === "string" ? symbol.result : "TWLT";

  const assets: TokenAsset[] = [
    {
      symbol: tokenSymbol,
      name: "Twilight",
      address: twilightToken.address,
      decimals: tokenDecimals,
      balance: tokenBalance?.result as bigint | undefined,
      location: "wallet",
    },
    {
      symbol: tokenSymbol,
      name: "Twilight · staked",
      address: twilightStaking.address,
      decimals: tokenDecimals,
      balance: staked?.result as bigint | undefined,
      location: "staked",
    },
  ];

  return {
    isConnected,
    address,
    nativeBalance: native.data?.value,
    nativeSymbol: native.data?.symbol ?? "ETH",
    tokenSymbol,
    tokenDecimals,
    tokenBalance: tokenBalance?.result as bigint | undefined,
    stakedBalance: staked?.result as bigint | undefined,
    pendingRewards: earned?.result as bigint | undefined,
    assets,
    isLoading: native.isLoading || reads.isLoading,
    isFetching: native.isFetching || reads.isFetching,
    error: native.error ?? reads.error ?? null,
    refetch: () => {
      void native.refetch();
      void reads.refetch();
    },
  };
}
