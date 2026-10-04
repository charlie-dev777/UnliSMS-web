import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/feedback";
import { MetricGrid, SplitRow } from "./dashboard-grid";
import { MetricCardSkeleton } from "./metric-card";

function PanelSkeleton({ rows = 3, chart }: { rows?: number; chart?: boolean }) {
  return (
    <Card>
      <div className="flex flex-col gap-2 px-5 py-4">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
      {chart ? <Skeleton className="mx-5 mb-5 h-[200px]" /> : <ListSkeleton rows={rows} />}
    </Card>
  );
}

/** Route-level loading state shared by the user and admin dashboards. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading dashboard">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <MetricGrid label="Loading metrics">
        {Array.from({ length: 4 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </MetricGrid>
      <Skeleton className="h-[58px] rounded-xl" />
      <SplitRow>
        <PanelSkeleton chart />
        <PanelSkeleton />
      </SplitRow>
      <SplitRow>
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={4} />
      </SplitRow>
    </div>
  );
}
