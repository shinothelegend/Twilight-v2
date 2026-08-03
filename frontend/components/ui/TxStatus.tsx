"use client";

import {explorer} from "@/lib/contracts";
import {shortHash} from "@/lib/format";

/**
 * Real transaction lifecycle feedback: awaiting signature → pending on chain → confirmed.
 *
 * Each state maps to actual wallet/RPC state, so a "confirmed" line means a receipt came back,
 * not that a timer elapsed.
 */
export function TxStatus({
  hash,
  isSigning,
  isConfirming,
  isConfirmed,
  error,
  onDismiss,
}: {
  hash?: `0x${string}`;
  isSigning: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  onDismiss?: () => void;
}) {
  if (!isSigning && !isConfirming && !isConfirmed && !error) return null;

  const message = error
    ? // Wallet errors carry a long RPC payload; the first line is the human-readable part.
      (error.message.split("\n")[0] ?? "Transaction failed")
    : isSigning
      ? "Waiting for your wallet…"
      : isConfirming
        ? "Pending on Arbitrum Sepolia…"
        : "Confirmed";

  return (
    <div className="flex items-start justify-between gap-3 border-t border-divider px-5 py-3">
      <div className="min-w-0">
        <p className="text-xs text-ink">{message}</p>
        {hash && (
          <a
            href={explorer.tx(hash)}
            target="_blank"
            rel="noreferrer"
            className="tnum text-xs text-faint transition-colors hover:text-muted"
          >
            {shortHash(hash)} ↗
          </a>
        )}
      </div>
      {onDismiss && (isConfirmed || error) && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-xs text-faint transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
