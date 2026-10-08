import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Send, Smartphone } from "lucide-react";
import type { Subscription } from "@/lib/types";
import { formatCalendarDate, formatNumber, formatZonedDateTime } from "@/lib/format";
import { formatMeterPercent, meter, type Meter } from "@/lib/usage-meter";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageBar } from "./usage-bar";

/**
 * Plan-limited resources only: gateways and SMS. API keys and webhooks aren't limited by
 * any plan, so they're not shown as quota here.
 */
export function UsageMeters({ subscription }: { subscription: Subscription }) {
  return (
    <div className="grid gap-5 min-[1024px]:grid-cols-2 min-[641px]:gap-6">
      <GatewayUsage gateways={subscription.gateways} />
      <SmsUsage sms={subscription.sms} timeZone={subscription.timeZone} />
    </div>
  );
}

function GatewayUsage({ gateways }: { gateways: Subscription["gateways"] }) {
  const m = meter(gateways.used, gateways.limit);
  return (
    <MeterCard
      icon={Smartphone}
      title="Device usage"
      description="Phones registered as gateways. Upgrade to add more devices."
      meter={m}
      unit={gateways.limit === 1 ? "device" : "devices"}
      details={[
        { label: "Registered", value: formatNumber(gateways.used) },
        { label: "Limit", value: formatNumber(gateways.limit) },
        { label: "Slots remaining", value: formatNumber(gateways.remaining) },
      ]}
      footer={
        <Link href="/gateways" className="text-xs font-medium text-primary hover:text-primary-hover hover:underline">
          View devices
        </Link>
      }
    />
  );
}

function SmsUsage({ sms, timeZone }: { sms: Subscription["sms"]; timeZone: string }) {
  // Period dates are shown in the organization's quota timezone, as the API computed them.
  const reset = sms.periodEnd ? formatCalendarDate(sms.periodEnd, timeZone) : null;
  const m = meter(sms.used, sms.limit);
  return (
    <MeterCard
      icon={Send}
      title="SMS usage"
      description="Every SMS sent or received counts as one, whatever its length."
      meter={m}
      unit="SMS"
      details={[
        { label: "Inbound", value: formatNumber(sms.inbound) },
        { label: "Outbound", value: formatNumber(sms.outbound) },
        { label: "Remaining", value: sms.remaining === null ? "Unlimited" : formatNumber(sms.remaining) },
        {
          label: sms.limit === null ? "Period ends" : "Resets",
          value: reset ?? "—",
          title:
            sms.periodStart && sms.periodEnd
              ? `Period ${formatZonedDateTime(sms.periodStart, timeZone)} – ${formatZonedDateTime(sms.periodEnd, timeZone)}`
              : "No current period",
        },
      ]}
      footer={
        sms.overQuota ? (
          <p className="m-0 text-xs text-muted-foreground">
            New outbound SMS can’t be sent until {reset ? `the quota resets on ${reset}` : "the quota resets"} or you
            upgrade. Incoming SMS is still received and counted.
          </p>
        ) : undefined
      }
    />
  );
}

const LEVEL_BADGE: Partial<Record<Meter["level"], { label: string; variant: "warning" | "danger" }>> = {
  warning: { label: "Approaching limit", variant: "warning" },
  limit: { label: "Limit reached", variant: "danger" },
  over: { label: "Over limit", variant: "danger" },
};

function MeterCard({
  icon: Icon,
  title,
  description,
  meter: m,
  unit,
  details,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  meter: Meter;
  unit: string;
  details: { label: string; value: string; title?: string }[];
  footer?: React.ReactNode;
}) {
  const badge = LEVEL_BADGE[m.level];
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex min-w-0 gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mb-0">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <div className="flex flex-1 flex-col gap-3 border-t border-border px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="flex flex-wrap items-baseline gap-x-1.5" data-testid="meter-value">
            <span className="num text-2xl leading-8 font-semibold">{formatNumber(m.used)}</span>
            {m.limit === null ? (
              <span className="text-[13px] text-muted-foreground">{unit} · Unlimited</span>
            ) : (
              <span className="num text-[13px] text-muted-foreground">
                / {formatNumber(m.limit)} {unit}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
            {m.percent !== null && (
              <span className="num text-[13px] font-semibold" data-testid="meter-percent">
                {formatMeterPercent(m.percent)}
              </span>
            )}
          </span>
        </div>
        <UsageBar meter={m} label={`${title}: ${m.percent === null ? "unlimited" : formatMeterPercent(m.percent)}`} />
        {m.overBy > 0 && (
          <p className="m-0 text-xs font-medium text-destructive" data-testid="meter-over">
            Over limit by {formatNumber(m.overBy)}
          </p>
        )}
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2.5 min-[480px]:grid-cols-4">
          {details.map((d) => (
            <div key={d.label} className="min-w-0" title={d.title}>
              <dt className="text-xs text-muted-foreground">{d.label}</dt>
              <dd className="num m-0 truncate text-[13px] font-medium">{d.value}</dd>
            </div>
          ))}
        </dl>
        {footer && <div className="mt-auto pt-1">{footer}</div>}
      </div>
    </Card>
  );
}
