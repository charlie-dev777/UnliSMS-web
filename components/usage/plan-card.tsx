import { Layers } from "lucide-react";
import type { Subscription, SubscriptionStatus } from "@/lib/types";
import { formatCalendarDate, formatZonedDateTime } from "@/lib/format";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "./upgrade-button";

// UnliSMS has no trial, so a legacy `trialing` value gets no badge rather than "Trial".
const STATUS: Partial<Record<SubscriptionStatus, { label: string; variant: BadgeVariant }>> = {
  active: { label: "Active", variant: "success" },
  past_due: { label: "Past due", variant: "warning" },
};

/** The organization's current plan from `GET /v1/subscription`. No prices: there's no billing API. */
export function PlanCard({ subscription }: { subscription: Subscription }) {
  const { plan, status, currentPeriodStart, currentPeriodEnd, timeZone } = subscription;
  const badge = STATUS[status];
  const showCode = plan.code.toLowerCase() !== plan.name.toLowerCase();
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Current plan</CardTitle>
          <CardDescription className="mb-0">Your organization’s plan and what it includes.</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 min-[641px]:flex-row min-[641px]:items-start min-[641px]:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-muted text-foreground-2">
            <Layers className="size-4" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-lg leading-7 font-semibold">{plan.name}</span>
              {badge && (
                <Badge variant={badge.variant} dot>
                  {badge.label}
                </Badge>
              )}
              {showCode && (
                <Badge variant="neutral" className="font-mono" title="Plan code">
                  {plan.code}
                </Badge>
              )}
            </div>
            <span
              className="text-xs text-muted-foreground"
              title={currentPeriodStart && currentPeriodEnd ? `${formatZonedDateTime(currentPeriodStart, timeZone)} – ${formatZonedDateTime(currentPeriodEnd, timeZone)}` : undefined}
            >
              {currentPeriodStart && currentPeriodEnd
                ? `Current period ${formatCalendarDate(currentPeriodStart, timeZone)} – ${formatCalendarDate(currentPeriodEnd, timeZone)}`
                : "Current plan"}
            </span>
          </div>
        </div>
        <UpgradeButton variant="default" className="min-[641px]:items-end min-[641px]:text-right" />
      </div>
    </Card>
  );
}
