"use client";

import {useEffect, useState} from "react";
import {formatUnits, parseUnits} from "viem";
import {useAccount} from "wagmi";

import {TxStatus} from "@/components/ui/TxStatus";
import {Button, EmptyState, ErrorNote, Panel, Skeleton} from "@/components/ui/primitives";
import {computeApr, formatAmount, formatDuration, formatPercent} from "@/lib/format";
import {useStaking} from "@/lib/hooks/useStaking";

function PoolStat({
  label,
  value,
  loading,
  hint,
}: {
  label: string;
  value: string;
  loading: boolean;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] text-faint uppercase">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-4 w-20" />
      ) : (
        <p className="tnum mt-1.5 text-sm text-neutral-strong">{value}</p>
      )}
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

/**
 * Stake / withdraw / claim against the deployed TwilightStaking contract.
 *
 * Every figure here is a contract read: the APR is derived from the pool's live `rewardRate` and
 * `totalStaked`, not from a configured constant, and it is hidden entirely when the pool has no
 * stake or no active period rather than showing a made-up headline rate.
 */
export function StakingPanel({noPanel = false}: {noPanel?: boolean}) {
  const {isConnected} = useAccount();
  const staking = useStaking();
  const [mode, setMode] = useState<"stake" | "withdraw">("stake");
  const [amount, setAmount] = useState("");

  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const apr = computeApr(
    staking.rewardRate,
    staking.totalStaked,
    staking.periodFinish,
    nowSeconds,
  );

  const max = mode === "stake" ? staking.walletBalance : staking.stakedBalance;
  const needsApproval =
    mode === "stake" &&
    amount !== "" &&
    staking.allowance !== undefined &&
    (() => {
      try {
        return staking.allowance < parseUnits(amount, 18);
      } catch {
        return false;
      }
    })();

  let amountError: string | null = null;
  if (amount !== "") {
    try {
      const parsed = parseUnits(amount, 18);
      if (parsed <= 0n) amountError = "Enter an amount greater than zero.";
      else if (max !== undefined && parsed > max) amountError = "More than your available balance.";
    } catch {
      amountError = "Not a valid amount.";
    }
  }

  const busy = staking.isSigning || staking.isConfirming;
  const canSubmit = amount !== "" && !amountError && !busy;

  const submit = async () => {
    try {
      if (needsApproval) await staking.approve();
      else if (mode === "stake") await staking.stake(amount);
      else await staking.withdraw(amount);
      if (!needsApproval) setAmount("");
    } catch {
      // The wallet rejected or the RPC failed; the error surfaces through TxStatus below.
    }
  };

  const periodSecondsLeft =
    staking.periodFinish === undefined ? undefined : Number(staking.periodFinish) - nowSeconds;

  const innerContent = (
    <div className="flex flex-col">
      {staking.readError ? (
        <ErrorNote error={staking.readError} onRetry={() => void staking.refetch()} />
      ) : !isConnected ? (
        <EmptyState
          title="Connect a wallet to stake"
          hint="The pool's live figures below still come straight from the contract."
        />
      ) : null}

      <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-4">
        <PoolStat
          label="Total staked"
          value={staking.totalStaked !== undefined ? `${formatAmount(staking.totalStaked, 18, 2)} TWLT` : "—"}
          loading={staking.isLoading}
        />
        <PoolStat
          label="Current APR"
          value={apr === undefined ? "—" : formatPercent(apr)}
          loading={staking.isLoading}
          hint={apr === undefined ? "No active stake or period" : "From live reward rate"}
        />
        <PoolStat
          label="Emission"
          value={
            staking.rewardRate === undefined
              ? "—"
              : `${Number(formatUnits(staking.rewardRate, 18)).toFixed(4)} /s`
          }
          loading={staking.isLoading}
        />
        <PoolStat
          label="Period ends in"
          value={periodSecondsLeft === undefined ? "—" : formatDuration(periodSecondsLeft)}
          loading={staking.isLoading}
        />
      </div>

      {isConnected && (
        <>
          <div className="grid grid-cols-2 gap-5 border-t border-divider px-5 py-5">
            <PoolStat
              label="Your stake"
              value={staking.stakedBalance !== undefined ? `${formatAmount(staking.stakedBalance)} TWLT` : "—"}
              loading={staking.isLoading}
            />
            <div className="flex flex-col justify-between">
              <PoolStat
                label="Rewards earned"
                value={staking.pendingRewards !== undefined ? `${formatAmount(staking.pendingRewards, 18, 6)} TWLT` : "—"}
                loading={staking.isLoading}
              />
              {noPanel && staking.pendingRewards !== undefined && staking.pendingRewards > 0n && (
                <Button
                  variant="ghost"
                  className="mt-2 px-3 py-1 text-xs w-fit"
                  disabled={busy}
                  onClick={() => void staking.claim().catch(() => undefined)}
                >
                  {staking.action === "claim" && busy ? "Claiming…" : "Claim rewards"}
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-divider px-5 py-5">
            <div className="mb-4 flex gap-1 rounded-xl border border-edge p-1 bg-night-900/10">
              {(["stake", "withdraw"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    setMode(value);
                    setAmount("");
                  }}
                  className={
                    "flex-1 rounded-lg py-2 text-xs tracking-[0.14em] uppercase transition-colors " +
                    (mode === value
                      ? "bg-panel-raised text-ink"
                      : "text-faint hover:text-muted")
                  }
                >
                  {value}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="sr-only">Amount in TWLT</span>
              <div className="flex items-center gap-2 rounded-xl border border-edge bg-night-800 px-4 py-3 transition-all duration-300 ease-[var(--ease-out-expo)] focus-within:border-white/20 focus-within:bg-night-800/80">
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="decimal"
                  placeholder="0.0"
                  className="tnum min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-faint"
                />
                <span className="text-xs text-faint">TWLT</span>
                <button
                  type="button"
                  disabled={max === undefined || max === 0n}
                  onClick={() => max !== undefined && setAmount(formatUnits(max, 18))}
                  className="rounded-lg border border-edge px-2 py-1 text-[11px] tracking-[0.12em] text-muted uppercase transition-all duration-300 ease-[var(--ease-out-expo)] hover:border-white/20 hover:text-ink active:scale-[0.96] disabled:opacity-40 disabled:scale-100"
                >
                  Max
                </button>
              </div>
            </label>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-faint">
                {mode === "stake" ? "In wallet" : "Staked"}:{" "}
                <span className="tnum">{formatAmount(max)}</span> TWLT
              </span>
              {amountError && <span className="text-muted">{amountError}</span>}
            </div>

            <Button className="mt-4 w-full" disabled={!canSubmit} onClick={() => void submit()}>
              {busy
                ? staking.isSigning
                  ? "Confirm in wallet…"
                  : "Pending…"
                : needsApproval
                  ? "Approve TWLT"
                  : mode === "stake"
                    ? "Stake"
                    : "Withdraw"}
            </Button>
          </div>
        </>
      )}

      <TxStatus
        hash={staking.hash}
        isSigning={staking.isSigning}
        isConfirming={staking.isConfirming}
        isConfirmed={staking.isConfirmed}
        error={staking.error}
        onDismiss={staking.resetTx}
      />
    </div>
  );

  if (noPanel) {
    return innerContent;
  }

  return (
    <Panel
      title="Staking"
      subtitle="Stake TWLT, accrue rewards every second, withdraw any time"
      action={
        staking.pendingRewards !== undefined && staking.pendingRewards > 0n ? (
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            disabled={busy}
            onClick={() => void staking.claim().catch(() => undefined)}
          >
            {staking.action === "claim" && busy ? "Claiming…" : "Claim rewards"}
          </Button>
        ) : undefined
      }
    >
      {innerContent}
    </Panel>
  );
}
