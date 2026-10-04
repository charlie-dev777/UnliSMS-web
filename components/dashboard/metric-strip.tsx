import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Secondary metrics share one compact card: 4 across, 2×2 when the card is
 * narrower than 720px. Sized off the card, not the viewport, so the sidebar
 * at 1024–1280px doesn't squeeze four labels into wrapping.
 */
export function MetricStrip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="@container">
      <Card
        role="group"
        aria-label={label}
        className={cn(
          "grid grid-cols-2 @min-[720px]:grid-cols-4",
          "[&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t",
          "@min-[720px]:[&>*:nth-child(n+2)]:border-l @min-[720px]:[&>*:nth-child(n+3)]:border-t-0",
        )}
      >
        {children}
      </Card>
    </div>
  );
}

export function MetricStripItem({
  label,
  value,
  extra,
  tile,
  tone,
}: {
  label: string;
  value: string | null;
  /** Small muted suffix, e.g. a share of total. */
  extra?: string;
  /** Icon or dot shown in the 28px tile. */
  tile: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-4 py-3.5 @min-[400px]:gap-3 @min-[400px]:px-5">
      <span
        aria-hidden
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2 [&_svg]:size-3.5",
          tone === "danger" && "text-destructive",
        )}
      >
        {tile}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("num text-lg leading-[26px] font-semibold", value === null && "text-placeholder")}>
          {value ?? "—"} {value !== null && extra && <span className="text-[12px] font-normal text-muted-foreground">{extra}</span>}
        </span>
      </div>
    </div>
  );
}

/** Colored status dot for a strip tile. */
export const TileDot = ({ className }: { className: string }) => <span className={cn("size-2 rounded-full", className)} />;
