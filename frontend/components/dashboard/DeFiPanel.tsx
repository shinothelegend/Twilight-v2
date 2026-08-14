"use client";

import {useState} from "react";
import {AssetList} from "@/components/dashboard/AssetList";
import {TransferPanel} from "@/components/dashboard/TransferPanel";
import {StakingPanel} from "@/components/dashboard/StakingPanel";
import {FaucetCard} from "@/components/dashboard/FaucetCard";
import type {useRealBalances} from "@/lib/hooks/useRealBalances";

type Balances = ReturnType<typeof useRealBalances>;
type Tab = "holdings" | "transfer" | "staking" | "faucet";

export function DeFiPanel({balances}: {balances: Balances}) {
  const [activeTab, setActiveTab] = useState<Tab>("holdings");

  const tabs: {id: Tab; label: string}[] = [
    {id: "holdings", label: "Holdings"},
    {id: "transfer", label: "Send / Receive"},
    {id: "staking", label: "Stake"},
    {id: "faucet", label: "Faucet"},
  ];

  return (
    <section className="flex flex-col rounded-3xl border border-white/[0.09] bg-panel/55 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_28px_56px_-32px_rgba(0,0,0,0.95)] min-h-[460px] overflow-hidden transition-all duration-300 ease-[var(--ease-out-expo)] hover:border-white/[0.16] hover:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_32px_64px_-24px_rgba(0,0,0,0.98)]">
      {/* Header Tab Bar */}
      <header className="flex border-b border-divider bg-night-900/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center text-[10px] sm:text-xs tracking-[0.14em] font-brand uppercase transition-all duration-300 ease-[var(--ease-out-expo)] border-b-2 outline-none ${
                isActive
                  ? "border-ink text-ink bg-panel-raised/30"
                  : "border-transparent text-faint hover:text-muted hover:bg-panel-raised/15"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </header>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "holdings" && <AssetList balances={balances} noPanel />}
        {activeTab === "transfer" && <TransferPanel balances={balances} noPanel />}
        {activeTab === "staking" && <StakingPanel noPanel />}
        {activeTab === "faucet" && <FaucetCard noPanel />}
      </div>
    </section>
  );
}
