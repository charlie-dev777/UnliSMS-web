import type { Meter } from "@/lib/usage-meter";
import { cn } from "@/lib/utils";

const FILL: Record<Exclude<Meter["level"], "unlimited">, string> = {
  normal: "bg-primary",
  warning: "bg-warning-strong",
  limit: "bg-destructive",
  over: "bg-destructive",
};

/** Progress for a limited resource, never wider than 100%. Renders nothing when unlimited. */
export function UsageBar({ meter, label, className }: { meter: Meter; label: string; className?: string }) {
  if (meter.level === "unlimited" || meter.percent === null) return null;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(meter.percent)}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className={cn("h-full rounded-full", FILL[meter.level])} style={{ width: `${meter.percent}%` }} />
    </div>
  );
}
