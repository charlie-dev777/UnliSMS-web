import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <div className="flex items-center gap-3 px-5 py-4">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-36 max-w-full" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 border-t border-border px-5 py-4 min-[480px]:grid-cols-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GatewayListSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading gateways">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function GatewayDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading gateway">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        <CardSkeleton rows={2} />
        <CardSkeleton rows={4} />
        <CardSkeleton rows={6} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  );
}
