"use client";

import {MoonDisc} from "@/components/landing/MoonDisc";
import {ErrorNote, Skeleton} from "@/components/ui/primitives";
import {formatAmount} from "@/lib/format";
import type {useRealBalances} from "@/lib/hooks/useRealBalances";

type Balances = ReturnType<typeof useRealBalances>;

function Stat({label, value, loading}: {label: string; value: string; loading: boolean}) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:items-start">
      <span className="text-[11px] tracking-[0.16em] text-faint uppercase">{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-24" />
      ) : (
        <span className="tnum text-base text-neutral-strong">{value}</span>
      )}
    </div>
  );
}

/**
 * The hero balance, sitting inside the moon.
 *
 * The headline figure is the account's native ETH balance, read live. There is deliberately no
 * aggregated "total portfolio value" in fiat: TWLT is a testnet token with no market, so any
 * total would be a number we invented — and inventing it would undo the one claim this whole
 * product makes. The moon carries what the chain actually says.
 */
export function BalanceCard({balances}: {balances: Balances}) {
  const {nativeBalance, nativeSymbol, tokenBalance, stakedBalance, pendingRewards, tokenSymbol} =
    balances;

  if (balances.error) {
    return (
      <div className="rounded-3xl border border-edge bg-panel/80">
        <ErrorNote error={balances.error} onRetry={balances.refetch} />
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-edge bg-panel/40 backdrop-blur-[3px]">
      <div className="relative flex flex-col items-center px-6 pt-10 pb-8 sm:pt-14">
        <MoonDisc size={300} className="sm:scale-110">
          {balances.nativeBalance === undefined ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-11 w-44 bg-night-900/30" />
              <Skeleton className="h-3 w-24 bg-night-900/30" />
            </div>
          ) : (
            <>
              <p className="tnum font-display text-4xl leading-none font-medium text-night-900 sm:text-[2.75rem]">
                {formatAmount(nativeBalance, 18, 4)}
              </p>
              <p className="mt-2.5 text-[11px] tracking-[0.22em] text-night-900/60 uppercase">
                {nativeSymbol} · Wallet balance
              </p>
            </>
          )}
        </MoonDisc>

        <p className="mt-8 max-w-md text-center text-xs leading-relaxed text-faint">
          Read live from Arbitrum Sepolia. No fiat conversion is shown — TWLT is a testnet asset
          with no market price, and an invented total would be worse than none.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 border-t border-divider px-6 py-6 sm:grid-cols-3 sm:px-10">
        <Stat
          label={`${tokenSymbol} in wallet`}
          value={formatAmount(tokenBalance)}
          loading={tokenBalance === undefined}
        />
        <Stat
          label={`${tokenSymbol} staked`}
          value={formatAmount(stakedBalance)}
          loading={stakedBalance === undefined}
        />
        <Stat
          label="Rewards pending"
          value={formatAmount(pendingRewards, 18, 6)}
          loading={pendingRewards === undefined}
        />
      </div>
    </section>
  );
}
