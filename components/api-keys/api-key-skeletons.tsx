import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ApiKeyListSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading API keys">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Card>
        <div className="flex flex-col gap-1.5 px-5 py-4">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <div className="flex flex-col divide-y divide-border border-t border-border">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-56 max-w-full" />
              <Skeleton className="h-2.5 w-40" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
