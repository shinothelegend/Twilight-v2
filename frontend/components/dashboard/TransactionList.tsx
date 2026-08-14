"use client";

import {
  DirectionGlyph,
  EmptyState,
  ErrorNote,
  Panel,
  Skeleton,
} from "@/components/ui/primitives";
import {explorer} from "@/lib/contracts";
import {formatAmount, relativeTime, shortAddress, shortHash} from "@/lib/format";
import type {ActivityItem, ActivityKind} from "@/lib/hooks/useRealTransactions";

const LABELS: Record<ActivityKind, {title: string; direction: "in" | "out"}> = {
  send: {title: "Sent", direction: "out"},
  receive: {title: "Received", direction: "in"},
  faucet: {title: "Faucet mint", direction: "in"},
  stake: {title: "Staked", direction: "out"},
  unstake: {title: "Unstaked", direction: "in"},
  reward: {title: "Reward claimed", direction: "in"},
  "native-send": {title: "Sent", direction: "out"},
  "native-receive": {title: "Received", direction: "in"},
};

function Row({item}: {item: ActivityItem}) {
  const label = LABELS[item.kind];
  const isNative = item.kind.startsWith("native-");

  return (
    <li className="flex items-center gap-4 px-5 py-3.5 border-b border-divider last:border-b-0 transition-colors hover:bg-panel-raised/20">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge text-[10px] bg-panel-raised/15 text-muted">
        <DirectionGlyph direction={label.direction} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink leading-tight">{label.title}</p>
        <p className="truncate text-xs text-faint mt-0.5">
          {item.counterparty ? (
            <>
              {label.direction === "out" ? "to " : "from "}
              <span className="tnum font-medium">{shortAddress(item.counterparty)}</span>
              {" · "}
            </>
          ) : null}
          <span>
            {item.timestamp ? relativeTime(item.timestamp) : `block ${item.blockNumber}`}
          </span>
          {" · "}
          <a
            href={explorer.tx(item.hash)}
            target="_blank"
            rel="noreferrer"
            className="tnum font-medium underline decoration-edge underline-offset-2 transition-colors hover:text-muted hover:decoration-muted"
          >
            {shortHash(item.hash)}
          </a>
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="tnum text-sm text-neutral-strong font-medium">
          {label.direction === "out" ? "−" : "+"}
          {formatAmount(item.amount, item.decimals, isNative ? 5 : 4)}{" "}
          <span className="text-faint font-normal">{isNative ? "ETH" : item.symbol}</span>
        </p>
      </div>
    </li>
  );
}

/**
 * Recent activity, assembled from Arbitrum Sepolia event logs for the connected account.
 *
 * When an account has no history the panel says exactly that. There is no sample data path.
 */
export function TransactionList({
  activity,
  isLoading,
  error,
  refetch,
  includesNativeTransfers,
  isConnected,
}: {
  activity: ActivityItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  includesNativeTransfers: boolean;
  isConnected: boolean;
}) {
  return (
    <Panel
      title="Recent transactions"
      subtitle={
        includesNativeTransfers
          ? "Token, staking and native ETH activity, read from chain"
          : "Token and staking activity, read from chain event logs"
      }
    >
      {!isConnected ? (
        <EmptyState
          title="Connect a wallet to see your activity"
          hint="History is read from Arbitrum Sepolia for the connected address only."
        />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : isLoading ? (
        <ul className="divide-y divide-divider">
          {[0, 1, 2, 3].map((index) => (
            <li key={index} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-40" />
              </div>
              <Skeleton className="h-3 w-20" />
            </li>
          ))}
        </ul>
      ) : activity.length === 0 ? (
        <EmptyState
          title="No transactions yet — send your first payment"
          hint="Claim TWLT from the faucet or send ETH, and it will appear here within a block or two."
        />
      ) : (
        <ul className="quiet-scroll max-h-[26rem] divide-y divide-divider overflow-y-auto">
          {activity.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
