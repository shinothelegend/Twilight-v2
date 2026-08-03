"use client";

import {AssetList} from "@/components/dashboard/AssetList";
import {BalanceCard} from "@/components/dashboard/BalanceCard";
import {FaucetCard} from "@/components/dashboard/FaucetCard";
import {StakingPanel} from "@/components/dashboard/StakingPanel";
import {TopNav} from "@/components/dashboard/TopNav";
import {TransactionList} from "@/components/dashboard/TransactionList";
import {TransferPanel} from "@/components/dashboard/TransferPanel";
import {TwilightScene} from "@/components/landing/TwilightScene";
import {contractsDeployed} from "@/lib/contracts";
import {useRealBalances} from "@/lib/hooks/useRealBalances";
import {useRealTransactions} from "@/lib/hooks/useRealTransactions";

export default function DashboardPage() {
  const balances = useRealBalances();
  const transactions = useRealTransactions(
    balances.tokenSymbol,
    balances.tokenDecimals,
    balances.nativeSymbol,
  );

  return (
    <div className="relative min-h-dvh">
      {/* Same scene as the landing page, held back so the data reads first. */}
      <TwilightScene variant="app" />
      <TopNav />

      <main className="mx-auto max-w-6xl px-5 pt-8 pb-24 sm:px-8">
        {!contractsDeployed && (
          <div className="mb-8 rounded-2xl border border-edge bg-panel/80 px-5 py-4">
            <p className="text-sm text-ink">Contracts are not deployed yet.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Run the Foundry deploy script against Arbitrum Sepolia and re-run{" "}
              <code className="text-neutral-strong">npm run gen:contracts</code>. Until then this
              dashboard has nothing real to read — and it will not invent anything to fill the
              space.
            </p>
          </div>
        )}

        <BalanceCard balances={balances} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList
              activity={transactions.activity}
              isLoading={transactions.isLoading}
              error={transactions.error}
              refetch={() => void transactions.refetch()}
              includesNativeTransfers={transactions.includesNativeTransfers}
              isConnected={balances.isConnected}
            />
          </div>
          <div className="flex flex-col gap-6">
            <AssetList balances={balances} />
            <FaucetCard />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StakingPanel />
          </div>
          <TransferPanel balances={balances} />
        </div>

        <footer className="mt-12 border-t border-divider pt-6 text-xs text-faint">
          Every number on this page is read from Arbitrum Sepolia at render time. Empty states mean
          the chain is genuinely empty, not that data is missing.
        </footer>
      </main>
    </div>
  );
}
