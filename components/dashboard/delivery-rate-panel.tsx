import type { DashboardMetrics } from "@/lib/types";
import { formatChangePts, formatPercent, ratioPct } from "@/lib/format";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status";
import { BreakdownBar } from "./breakdown-bar";
import { Trend } from "./trend";

const HEALTHY_PCT = 95;

/** Outbound delivery rate with the delivered / pending / failed split. */
export function DeliveryRatePanel({ metrics }: { metrics: DashboardMetrics | null }) {
  const rate = metrics ? ratioPct(metrics.smsDelivered, metrics.smsSent) : null;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Delivery rate</CardTitle>
          <CardDescription>Outbound SMS, last {metrics?.periodDays ?? 7} days</CardDescription>
        </div>
        {rate !== null && (
          <CardAction>
            {rate >= HEALTHY_PCT ? <StatusBadge tone="success" label="Healthy" dot /> : <StatusBadge tone="warning" label="Below target" dot />}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <div className="num text-4xl leading-[44px] font-semibold tracking-[-0.02em]">
            {rate === null ? <span className="text-placeholder">—</span> : formatPercent(rate)}
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics ? (
              <>
                <Trend value={metrics.deliveryRateChangePts}>{formatChangePts(metrics.deliveryRateChangePts)}</Trend> vs previous {metrics.periodDays} days
              </>
            ) : (
              "No data for this period"
            )}
          </div>
        </div>
        <BreakdownBar
          segments={[
            { label: "Delivered", value: metrics?.smsDelivered ?? 0, colorClass: "bg-brand" },
            { label: "Pending", value: metrics?.smsPending ?? 0, colorClass: "bg-warning" },
            { label: "Failed", value: metrics?.smsFailed ?? 0, colorClass: "bg-danger" },
          ]}
        />
      </CardContent>
    </Card>
  );
}
