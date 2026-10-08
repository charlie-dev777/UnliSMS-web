import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UsageSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading usage">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Card>
        <div className="flex flex-col gap-1.5 px-5 py-4">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <Skeleton className="size-10 rounded-[10px]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </Card>
      <div className="grid gap-5 min-[1024px]:grid-cols-2 min-[641px]:gap-6">
        {[0, 1].map((i) => (
          <Card key={i}>
            <div className="flex gap-3 px-5 py-4">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
