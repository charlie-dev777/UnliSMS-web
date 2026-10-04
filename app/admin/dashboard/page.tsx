import type { Metadata } from "next";
import { Activity, AlertTriangle, CalendarDays, CheckCheck, ChevronDown, CreditCard, Download, MessageSquare, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboard } from "@/lib/data/dashboard";
import { parseScenario } from "@/lib/mock-data";
import { formatChangePct, formatChangePts, formatNumber, formatPercent, ratioPct } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  GatewayHealthPanel,
  MessageActivityChart,
  MetricCard,
  MetricGrid,
  MetricStrip,
  MetricStripItem,
  RecentFailuresTable,
  RecentRegistrationsTable,
  SplitRow,
  SystemHealthPanel,
  TileDot,
  Trend,
} from "@/components/dashboard";

export const metadata: Metadata = { title: "Admin dashboard" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminDashboardPage({ searchParams }: Props) {
  await requireAdmin();
  const data = await getAdminDashboard({ scenario: parseScenario((await searchParams).mock) });
  const now = new Date(data.generatedAt);
  const m = data.metrics;
  const fleet = data.fleet;
  const value = (n: number | undefined) => (n === undefined ? null : formatNumber(n));

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Users, gateways and message delivery across UnliSMS."
        actions={
          <>
            <Button variant="outline">
              <CalendarDays />
              Today
              <ChevronDown className="text-muted-foreground" />
            </Button>
            <Button variant="outline">
              <Download />
              Export
            </Button>
          </>
        }
      />

      <MetricGrid label="Key metrics">
        <MetricCard
          label="Total users"
          icon={Users}
          value={value(m?.totalUsers)}
          footer={m && <><Trend value={m.newUsersThisWeek}>+{formatNumber(m.newUsersThisWeek)}</Trend> this week</>}
        />
        <MetricCard
          label="Active users"
          icon={Activity}
          value={value(m?.activeUsers30d)}
          footer={m && `${formatPercent(ratioPct(m.activeUsers30d, m.totalUsers))} active in last 30 days`}
        />
        <MetricCard
          label="Messages today"
          icon={MessageSquare}
          value={value(m?.messagesToday)}
          footer={m && <><Trend value={m.messagesTodayChangePct}>{formatChangePct(m.messagesTodayChangePct)}</Trend> vs same time yesterday</>}
        />
        <MetricCard
          label="SMS delivery rate"
          icon={CheckCheck}
          value={m && formatPercent(m.deliveryRatePct)}
          footer={m && <><Trend value={m.deliveryRateChangePts}>{formatChangePts(m.deliveryRateChangePts)}</Trend> vs yesterday</>}
        />
      </MetricGrid>

      <MetricStrip label="Gateways, webhooks and subscriptions">
        <MetricStripItem label="Online gateways" value={value(fleet?.online)} tile={<TileDot className="bg-success" />} />
        <MetricStripItem
          label="Offline gateways"
          value={fleet ? formatNumber(fleet.offlineUnder24h + fleet.offlineOver24h) : null}
          tile={<TileDot className="bg-offline" />}
        />
        <MetricStripItem label="Failed webhooks · 24h" value={value(m?.failedWebhooks24h)} tile={<AlertTriangle />} tone="danger" />
        <MetricStripItem label="Active subscriptions" value={value(m?.activeSubscriptions)} tile={<CreditCard />} />
      </MetricStrip>

      <SplitRow>
        <MessageActivityChart description="Platform-wide SMS per day, last 14 days" data={data.activity} seriesLabels={["Outbound", "Inbound"]} />
        <SystemHealthPanel system={data.system} />
      </SplitRow>

      <SplitRow>
        <RecentRegistrationsTable registrations={data.registrations} newThisWeek={m?.newUsersThisWeek ?? 0} now={now} />
        <GatewayHealthPanel fleet={fleet} />
      </SplitRow>

      <RecentFailuresTable failures={data.failures} />
    </>
  );
}
