/**
 * How a plan-limited resource reads against its limit. Shared by /usage and the sidebar
 * plan card so both show the same numbers and states.
 *
 * - `used` is always the real count, never clamped; only `percent` (the bar) stops at 100.
 * - Levels: under 80% normal, 80–99% warning, exactly at the limit `limit`, past it `over`.
 * - A null limit is unlimited: no percentage, no bar, no threshold.
 * - A zero limit (nothing allowed) reads as a full bar: `limit` at 0 used, `over` above it.
 */
export type MeterLevel = "normal" | "warning" | "limit" | "over" | "unlimited";

export interface Meter {
  used: number;
  limit: number | null;
  /** Bar width and displayed percentage, 0–100; null when unlimited. */
  percent: number | null;
  level: MeterLevel;
  /** How far past the limit; 0 when within it or unlimited. */
  overBy: number;
}

export const WARNING_PERCENT = 80;

export function meter(used: number, limit: number | null): Meter {
  if (limit === null) return { used, limit, percent: null, level: "unlimited", overBy: 0 };
  const overBy = Math.max(used - limit, 0);
  if (limit === 0) return { used, limit, percent: 100, level: used > 0 ? "over" : "limit", overBy };
  const raw = (used / limit) * 100;
  const level: MeterLevel = used > limit ? "over" : used === limit ? "limit" : raw >= WARNING_PERCENT ? "warning" : "normal";
  return { used, limit, percent: Math.min(raw, 100), level, overBy };
}

/** Whole percent for display: 79.5 → "79%" so a warning never reads as 80% too early. */
export const formatMeterPercent = (percent: number) => `${Math.floor(percent)}%`;
