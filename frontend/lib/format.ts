import {formatUnits} from "viem";

/**
 * Formats a raw on-chain amount for display.
 *
 * Deliberately conservative: no rounding that could overstate a balance, no abbreviations that
 * hide magnitude at small sizes, and always tabular so columns of numbers line up.
 */
export function formatAmount(
  value: bigint | undefined,
  decimals = 18,
  maxFractionDigits = 4,
): string {
  if (value === undefined) return "—";
  const asString = formatUnits(value, decimals);
  const [whole, fraction = ""] = asString.split(".");
  const groupedWhole = BigInt(whole).toLocaleString("en-US");

  if (maxFractionDigits === 0) return groupedWhole;

  // Truncate rather than round, so a displayed balance is never larger than the real one.
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  if (trimmed === "") {
    // Non-zero dust that truncates away should not read as an exact zero.
    return value !== 0n && BigInt(whole) === 0n ? "< 0.0001" : groupedWhole;
  }
  return `${groupedWhole}.${trimmed}`;
}

/** Shortens an address to `0x1234…abcd`. */
export function shortAddress(address?: string): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Shortens a transaction hash to `0x123456…abcdef`. */
export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

/** Relative time such as "4m ago". Falls back to an absolute date past a week. */
export function relativeTime(timestampSeconds: number, now = Date.now()): string {
  const deltaSeconds = Math.floor(now / 1000) - timestampSeconds;
  if (deltaSeconds < 45) return "just now";
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`;
  if (deltaSeconds < 604800) return `${Math.floor(deltaSeconds / 86400)}d ago`;
  return new Date(timestampSeconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/** Formats a duration in seconds as e.g. "6d 4h" or "12m". */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "ended";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Annualised percentage rate implied by the pool's live on-chain reward rate and total stake.
 *
 * Returns `undefined` when the pool has no stake or no active period — in that case there is no
 * meaningful rate to show and the UI says so rather than inventing one.
 */
export function computeApr(
  rewardRatePerSecond: bigint | undefined,
  totalStaked: bigint | undefined,
  periodFinish: bigint | undefined,
  nowSeconds: number,
): number | undefined {
  if (rewardRatePerSecond === undefined || totalStaked === undefined) return undefined;
  if (periodFinish === undefined || Number(periodFinish) <= nowSeconds) return undefined;
  if (totalStaked === 0n || rewardRatePerSecond === 0n) return undefined;

  const yearlyEmission = rewardRatePerSecond * 31_536_000n;
  // Scale before dividing to keep precision, then convert once at the end.
  return Number((yearlyEmission * 10_000n) / totalStaked) / 100;
}

/** Formats a percentage that may be very large (typical for a lightly-staked testnet pool). */
export function formatPercent(value: number | undefined): string {
  if (value === undefined) return "—";
  if (value >= 100_000) return `${Math.round(value).toLocaleString("en-US")}%`;
  if (value >= 100) return `${value.toFixed(0)}%`;
  return `${value.toFixed(2)}%`;
}
