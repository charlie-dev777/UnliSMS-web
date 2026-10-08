import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WebhookPageSkeleton() {
  return (
    <div className="flex flex-col gap-5 min-[641px]:gap-6" role="status" aria-label="Loading webhooks">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg min-[641px]:w-[360px]" />
      <div className="grid grid-cols-1 gap-5 min-[1024px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {[4, 7].map((rows) => (
          <Card key={rows}>
            <div className="flex flex-col gap-3 px-5 py-5">
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: rows }, (_, i) => (
                <Skeleton key={i} className="h-3 w-full max-w-[85%]" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
