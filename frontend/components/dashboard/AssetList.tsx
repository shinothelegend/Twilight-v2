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
    <li className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3.5">
        <span className="font-brand flex h-9 w-9 items-center justify-center rounded-full border border-edge text-[11px] tracking-wider text-muted">
          {symbol.slice(0, 3)}
        </span>
        <div>
          <p className="text-sm text-ink">{symbol}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-faint transition-colors hover:text-muted"
            >
              {name}
            </a>
          ) : (
            <p className="text-xs text-faint">{name}</p>
          )}
        </div>
      </div>
      {balance === undefined ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <span className="tnum text-sm text-neutral-strong">
          {formatAmount(balance, decimals, 5)}
        </span>
      )}
    </li>
  );
}

/** Real token balances read from chain. Zero balances are shown as zero, never hidden or faked. */
export function AssetList({balances}: {balances: Balances}) {
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
      <ul className="divide-y divide-divider">
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
    </Panel>
  );
}
