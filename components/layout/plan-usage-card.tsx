import Link from "next/link";
import type { UserShellData } from "@/lib/types";
import { formatNumber, formatPlanCode } from "@/lib/format";
import { meter } from "@/lib/usage-meter";
import { Card } from "@/components/ui/card";
import { UpgradeButton, UsageBar } from "@/components/usage";

/**
 * Sidebar plan summary from `GET /v1/subscription`, the same numbers /usage shows. When the
 * read is refused (member/viewer) or fails, it falls back to the session's plan code.
 */
export function PlanUsageCard({ organization, subscription }: Pick<UserShellData, "organization" | "subscription">) {
  return (
    <Card className="mt-2 flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-semibold">{subscription ? subscription.plan.name : formatPlanCode(organization.planCode)} plan</span>
        <Link href="/usage" className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover">
          View usage
        </Link>
      </div>
      {subscription && (
        <>
          <MiniMeter label="Devices" used={subscription.gateways.used} limit={subscription.gateways.limit} />
          <MiniMeter label="SMS" used={subscription.sms.used} limit={subscription.sms.limit} />
          <UpgradeButton />
        </>
      )}
    </Card>
  );
}

function MiniMeter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const m = meter(used, limit);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="num font-medium">
          {formatNumber(m.used)}
          {m.limit === null ? <span className="font-normal text-muted-foreground"> · Unlimited</span> : ` / ${formatNumber(m.limit)}`}
        </span>
      </div>
      <UsageBar meter={m} label={`${label} usage`} className="h-1" />
    </div>
  );
}
