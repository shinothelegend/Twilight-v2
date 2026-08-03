"use client";

import {useCallback, useEffect, useState} from "react";
import {maxUint256, parseUnits} from "viem";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {contractsDeployed, twilightStaking, twilightToken} from "@/lib/contracts";

export type StakingAction = "approve" | "stake" | "withdraw" | "claim" | "faucet" | null;

/**
 * Live view of the staking pool plus the write helpers the panel needs.
 *
 * Pool figures (`totalStaked`, `rewardRate`, `periodFinish`) are read from the contract on a
 * short interval so the APR shown is the pool's actual, current rate rather than a stated one.
 */
export function useStaking() {
  const {address} = useAccount();
  const enabled = Boolean(address) && contractsDeployed;

  /**
   * Pool-wide state. These take no account argument, so they are read whether or not a wallet is
   * connected — a visitor who has not connected still sees the pool's real size, rate and period
   * rather than an empty panel that implies the pool is dead.
   */
  const poolReads = useReadContracts({
    contracts: [
      {...twilightStaking, functionName: "totalStaked"},
      {...twilightStaking, functionName: "rewardRate"},
      {...twilightStaking, functionName: "periodFinish"},
      {...twilightStaking, functionName: "rewardPoolBalance"},
    ],
    query: {enabled: contractsDeployed, refetchInterval: 8_000},
  });

  /** Per-account state. Genuinely requires an address. */
  const accountReads = useReadContracts({
    contracts: [
      {...twilightStaking, functionName: "stakedBalanceOf", args: [address!]},
      {...twilightStaking, functionName: "earned", args: [address!]},
      {...twilightToken, functionName: "balanceOf", args: [address!]},
      {...twilightToken, functionName: "allowance", args: [address!, twilightStaking.address]},
      {...twilightToken, functionName: "nextFaucetClaim", args: [address!]},
    ],
    // Rewards accrue every second; 8s keeps the figure visibly live without spamming the RPC.
    query: {enabled, refetchInterval: 8_000},
  });

  const [totalStaked, rewardRate, periodFinish, rewardPool] = poolReads.data ?? [];
  const [staked, earned, walletBalance, allowance, nextFaucet] = accountReads.data ?? [];

  const reads = {
    isLoading: poolReads.isLoading || accountReads.isLoading,
    error: poolReads.error ?? accountReads.error,
    refetch: () => {
      void poolReads.refetch();
      void accountReads.refetch();
    },
  };

  const [action, setAction] = useState<StakingAction>(null);
  const {writeContractAsync, data: hash, reset, isPending: isSigning, error: writeError} =
    useWriteContract();

  const receipt = useWaitForTransactionReceipt({hash});

  // Once a transaction confirms, pull fresh state so the panel reflects the new chain state.
  useEffect(() => {
    if (receipt.isSuccess) {
      void reads.refetch();
      setAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess]);

  useEffect(() => {
    if (writeError) setAction(null);
  }, [writeError]);

  const run = useCallback(
    async (next: Exclude<StakingAction, null>, fn: () => Promise<`0x${string}`>) => {
      setAction(next);
      try {
        return await fn();
      } catch (error) {
        setAction(null);
        throw error;
      }
    },
    [],
  );

  const approve = useCallback(
    () =>
      run("approve", () =>
        writeContractAsync({
          ...twilightToken,
          functionName: "approve",
          args: [twilightStaking.address, maxUint256],
        }),
      ),
    [run, writeContractAsync],
  );

  const stake = useCallback(
    (amount: string) =>
      run("stake", () =>
        writeContractAsync({
          ...twilightStaking,
          functionName: "stake",
          args: [parseUnits(amount, 18)],
        }),
      ),
    [run, writeContractAsync],
  );

  const withdraw = useCallback(
    (amount: string) =>
      run("withdraw", () =>
        writeContractAsync({
          ...twilightStaking,
          functionName: "withdraw",
          args: [parseUnits(amount, 18)],
        }),
      ),
    [run, writeContractAsync],
  );

  const claim = useCallback(
    () =>
      run("claim", () =>
        writeContractAsync({...twilightStaking, functionName: "claimRewards"}),
      ),
    [run, writeContractAsync],
  );

  const claimFaucet = useCallback(
    () => run("faucet", () => writeContractAsync({...twilightToken, functionName: "faucet"})),
    [run, writeContractAsync],
  );

  return {
    stakedBalance: staked?.result as bigint | undefined,
    pendingRewards: earned?.result as bigint | undefined,
    totalStaked: totalStaked?.result as bigint | undefined,
    rewardRate: rewardRate?.result as bigint | undefined,
    periodFinish: periodFinish?.result as bigint | undefined,
    rewardPoolBalance: rewardPool?.result as bigint | undefined,
    walletBalance: walletBalance?.result as bigint | undefined,
    allowance: allowance?.result as bigint | undefined,
    nextFaucetClaim: nextFaucet?.result as bigint | undefined,

    isLoading: reads.isLoading,
    readError: reads.error ?? null,
    refetch: reads.refetch,

    action,
    hash,
    isSigning,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    error: (writeError ?? receipt.error) as Error | null,
    resetTx: () => {
      reset();
      setAction(null);
    },

    approve,
    stake,
    withdraw,
    claim,
    claimFaucet,
  };
}
