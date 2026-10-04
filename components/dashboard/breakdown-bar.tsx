import { formatNumber, formatPercent } from "@/lib/format";

export type BreakdownSegment = {
  label: string;
  value: number;
  /** Tailwind background class, e.g. "bg-brand". */
  colorClass: string;
};

/** Stacked 8px bar with a legend row per segment. Percentages are of the segment total. */
export function BreakdownBar({ segments, showPct = true }: { segments: BreakdownSegment[]; showPct?: boolean }) {
  const total = segments.reduce((n, s) => n + s.value, 0);
  const pct = (v: number) => (total === 0 ? 0 : (v / total) * 100);
  const aria = segments.map((s) => `${formatPercent(pct(s.value))} ${s.label.toLowerCase()}`).join(", ");

  return (
    <>
      <div className={`flex h-2 gap-0.5 overflow-hidden rounded ${total === 0 ? "bg-skeleton" : ""}`} role="img" aria-label={aria}>
        {total > 0 && segments.map((s) => <div key={s.label} className={s.colorClass} style={{ width: `${pct(s.value)}%` }} />)}
      </div>
      <div className="flex flex-col gap-2.5 text-[13px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`size-2 rounded-[2px] ${s.colorClass}`} />
            {s.label}
            <span className="num ml-auto font-medium">{formatNumber(s.value)}</span>
            {showPct && <span className="num w-11 text-right text-xs text-muted-foreground">{formatPercent(pct(s.value))}</span>}
          </div>
        ))}
      </div>
    </>
  );
}
