import type { ServiceStatus } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const TICK: Record<ServiceStatus, string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  outage: "bg-danger",
};

/** One tick per day, oldest left. */
export function UptimeBar({ daily, uptimePct }: { daily: ServiceStatus[]; uptimePct: number }) {
  const incidents = daily.filter((s) => s !== "operational").length;
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex flex-1 gap-0.5"
        role="img"
        aria-label={`${formatPercent(uptimePct, 2)} uptime, ${incidents} day${incidents === 1 ? "" : "s"} with incidents in the last ${daily.length} days`}
      >
        {daily.map((s, i) => (
          <span key={i} className={cn("h-4 flex-1 rounded-[2px]", TICK[s])} />
        ))}
      </div>
      <span className="num w-[52px] text-right text-xs text-muted-foreground">{formatPercent(uptimePct, 2)}</span>
    </div>
  );
}
