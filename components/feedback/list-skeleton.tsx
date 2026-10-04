import { Skeleton } from "@/components/ui/skeleton";

const widths = [
  ["60%", "40%"],
  ["70%", "30%"],
  ["50%", "45%"],
];

/** Loading placeholder for avatar + two-line list rows. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3.5 p-5" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-2.5" style={{ width: widths[i % 3][0] }} />
            <Skeleton className="h-2.5" style={{ width: widths[i % 3][1] }} />
          </div>
        </div>
      ))}
    </div>
  );
}
