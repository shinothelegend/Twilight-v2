"use client";

import {EmptyState, ErrorNote, Panel, Skeleton} from "@/components/ui/primitives";
import {explorer} from "@/lib/contracts";
import {formatAmount} from "@/lib/format";
import type {useRealBalances} from "@/lib/hooks/useRealBalances";

type Balances = ReturnType<typeof useRealBalances>;

function AssetRow({
  symbol,
  name,
  balance,
  decimals,
  href,
}: {
  symbol: string;
  name: string;
  balance: bigint | undefined;
  decimals: number;
  href?: string;
}) {
  return (
    <li className="grid grid-cols-4 items-center gap-4 px-5 py-3.5 border-b border-divider last:border-b-0 transition-colors hover:bg-panel-raised/20">
      <div className="col-span-2 flex items-center gap-3">
        <span className="font-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge text-[10px] tracking-wider text-muted bg-panel-raised/35">
          {symbol.slice(0, 3)}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-ink truncate">{symbol}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-faint transition-colors hover:text-muted truncate block"
            >
              {name}
            </a>
          ) : (
            <p className="text-xs text-faint truncate">{name}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        {balance === undefined ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span className="tnum text-sm text-neutral-strong">
            {formatAmount(balance, decimals, 5)}
          </span>
        )}
      </div>
      <div className="text-right">
        <span className="tnum text-sm text-faint">—</span>
      </div>
    </li>
  );
}

/** Real token balances read from chain. Zero balances are shown as zero, never hidden or faked. */
export function AssetList({balances, noPanel = false}: {balances: Balances; noPanel?: boolean}) {
  const content = (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 px-5 py-3 border-b border-divider text-[10px] tracking-[0.14em] text-faint uppercase font-brand font-bold bg-night-900/5">
        <div className="col-span-2">Asset</div>
        <div className="text-right">Quantity</div>
        <div className="text-right">Value</div>
      </div>
      <ul>
        <AssetRow
          symbol={balances.nativeSymbol}
          name="Native gas token"
          balance={balances.nativeBalance}
          decimals={18}
        />
        {balances.assets.map((asset) => (
          <AssetRow
            key={`${asset.address}-${asset.location}`}
            symbol={asset.symbol}
            name={asset.location === "staked" ? "Staked in Twilight pool" : "Twilight token"}
            balance={asset.balance}
            decimals={asset.decimals}
            href={
              asset.location === "staked"
                ? explorer.address(asset.address)
                : explorer.token(asset.address)
            }
          />
        ))}
      </ul>
    </div>
  );

  if (noPanel) {
    if (!balances.isConnected) {
      return <EmptyState title="Connect a wallet to see your balances" />;
    }
    if (balances.error) {
      return <ErrorNote error={balances.error} onRetry={balances.refetch} />;
    }
    return content;
  }

  if (!balances.isConnected) {
    return (
      <Panel title="Your assets" subtitle="Balances read directly from Arbitrum Sepolia">
        <EmptyState title="Connect a wallet to see your balances" />
      </Panel>
    );
  }

  if (balances.error) {
    return (
      <Panel title="Your assets">
        <ErrorNote error={balances.error} onRetry={balances.refetch} />
      </Panel>
    );
  }

  return (
    <Panel title="Your assets" subtitle="Balances read directly from Arbitrum Sepolia">
      {content}
    </Panel>
  );
}
