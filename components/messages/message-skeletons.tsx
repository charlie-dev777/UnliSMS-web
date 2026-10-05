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

function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2.5 w-40" />
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading messages">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-3 min-[641px]:grid-cols-2">
        <Skeleton className="h-[74px] rounded-xl" />
        <Skeleton className="h-[74px] rounded-xl" />
      </div>
      <Card>
        <RowsSkeleton />
      </Card>
    </div>
  );
}

export function MessageDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading message">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        {[3, 6].map((rows) => (
          <Card key={rows}>
            <div className="grid grid-cols-1 gap-3 px-5 py-4 min-[480px]:grid-cols-2">
              {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ComposeSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading">
      <HeaderSkeleton />
      <Card>
        <div className="flex flex-col gap-5 p-5">
          {[10, 10, 10, 36].map((h, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="rounded-lg" style={{ height: h * 4 }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
