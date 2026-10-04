import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/** Secondary metrics share one compact card: 4 across, 2×2 below 760px. */
export function MetricStrip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card
      role="group"
      aria-label={label}
      className={cn(
        "grid grid-cols-2 min-[761px]:grid-cols-4",
        "[&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t",
        "min-[761px]:[&>*:nth-child(n+2)]:border-l min-[761px]:[&>*:nth-child(n+3)]:border-t-0",
      )}
    >
      {children}
    </Card>
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
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span
        aria-hidden
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2 [&_svg]:size-3.5",
          tone === "danger" && "text-destructive",
        )}
      >
        {tile}
      </span>
      <div className="flex flex-col">
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
