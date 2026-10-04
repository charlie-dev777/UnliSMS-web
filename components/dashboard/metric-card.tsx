import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Headline stat card. Only the 3–4 most important metrics get one; pass
 * `value={null}` when the period has no data.
 */
export function MetricCard({
  label,
  icon: Icon,
  value,
  footer,
}: {
  label: string;
  icon: LucideIcon;
  value: string | null;
  footer: React.ReactNode;
}) {
  const empty = value === null;
  return (
    <Card className="flex flex-col gap-1 p-5">
      <div className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden />
      </div>
      <div className={cn("num mt-1.5 text-[28px] leading-9 font-semibold tracking-[-0.02em]", empty && "text-placeholder")}>{empty ? "—" : value}</div>
      <div className="text-xs text-muted-foreground">{empty ? "No data for this period" : footer}</div>
    </Card>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card className="flex flex-col gap-2.5 p-5">
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-7 w-3/5" />
      <Skeleton className="h-2.5 w-[70%]" />
    </Card>
  );
}
