import Link from "next/link";
import type { Subscription } from "@/lib/types";
import { formatNumber, ratioPct } from "@/lib/format";
import { Card } from "@/components/ui/card";

export function PlanUsageCard({ subscription }: { subscription: Subscription }) {
  const { plan, smsUsed } = subscription;
  const pct = Math.min(100, Math.round(ratioPct(smsUsed, plan.monthlySmsLimit)));
  return (
    <Card className="mt-2 flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">{plan.name}</span>
        <Link href="/billing" className="text-xs font-medium text-primary hover:text-primary-hover">
          Upgrade
        </Link>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-[3px] bg-skeleton"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Monthly SMS usage"
      >
        <div className="h-full rounded-[3px] bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="num text-xs text-muted-foreground">
        {formatNumber(smsUsed)} of {formatNumber(plan.monthlySmsLimit)} SMS this month
      </span>
    </Card>
  );
}
