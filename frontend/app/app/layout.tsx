"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {TopNav} from "@/components/dashboard/TopNav";
import {MoonDisc} from "@/components/landing/MoonDisc";
import {TwilightScene} from "@/components/landing/TwilightScene";
import {ErrorNote, Skeleton} from "@/components/ui/primitives";
import {contractsDeployed} from "@/lib/contracts";
import {formatAmount} from "@/lib/format";
import {useRealBalances} from "@/lib/hooks/useRealBalances";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const balances = useRealBalances();
  const pathname = usePathname();

  const tabs = [
    {href: "/app", label: "Holdings"},
    {href: "/app/transfer", label: "Send / Receive"},
    {href: "/app/staking", label: "Stake"},
    {href: "/app/faucet", label: "Faucet"},
    {href: "/app/transactions", label: "Transactions"},
  ];

  return (
    <div className="relative min-h-dvh">
      {/* Cinematic night sky backdrop */}
      <TwilightScene variant="app" />
      <TopNav />

      <main className="mx-auto max-w-6xl px-5 pt-4 pb-24 sm:px-8">
        {!contractsDeployed && (
          <div className="mb-8 rounded-2xl border border-edge bg-panel/85 backdrop-blur-md px-5 py-4 font-display">
            <p className="text-sm text-ink font-semibold">Contracts are not deployed yet.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Run the Foundry deploy script against Arbitrum Sepolia and re-run{" "}
              <code className="text-neutral-strong">npm run gen:contracts</code>. Until then this
              dashboard has nothing real to read — and it will not invent anything to fill the
              space.
            </p>
          </div>
        )}

        {/* Center-aligned Moon Disc hosting the Wallet Balance */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 select-none">
          {balances.error ? (
            <div className="rounded-3xl border border-edge bg-panel/80 p-6 max-w-md w-full font-display">
              <ErrorNote error={balances.error} onRetry={balances.refetch} />
            </div>
          ) : (
            <MoonDisc size={280} className="transition-transform duration-500 hover:scale-[1.02]">
              {balances.nativeBalance === undefined ? (
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-10 w-36 bg-night-900/20" />
                  <Skeleton className="h-3.5 w-20 bg-night-900/20" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <p className="tnum font-display text-4xl font-medium tracking-tight text-night-900 sm:text-5xl leading-none">
                    {formatAmount(balances.nativeBalance, 18, 4)}
                  </p>
                  <p className="mt-2.5 text-[10px] tracking-[0.2em] text-night-900/60 uppercase font-brand font-bold">
                    {balances.nativeSymbol} · Wallet Balance
                  </p>
                </div>
              )}
            </MoonDisc>
          )}
        </div>

        {/* Shared Sub-Navigation Bar */}
        <div className="flex justify-center border-b border-divider mb-8">
          <div className="flex w-full max-w-2xl gap-2 md:gap-4">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  data-tour={
                    tab.label === "Faucet" ? "nav-faucet" :
                    tab.label === "Stake" ? "nav-stake" :
                    tab.label === "Transactions" ? "nav-transactions" : undefined
                  }
                  className={`flex-1 py-3.5 text-center text-[10px] sm:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-brand font-bold ${
                    isActive
                      ? "border-b-2 border-ink text-ink bg-panel-raised/30"
                      : "border-b-2 border-transparent text-faint hover:text-muted hover:bg-panel-raised/15"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Child Pages Content Area */}
        <div className="min-h-[460px]">
          {children}
        </div>

        <footer className="mt-12 border-t border-divider pt-6 text-xs text-faint font-display">
          Every number on this page is read from Arbitrum Sepolia at render time. Empty states mean
          the chain is genuinely empty, not that data is missing.
        </footer>
      </main>
    </div>
  );
}
