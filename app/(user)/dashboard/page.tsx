import type { Metadata } from "next";
import { AlertTriangle, CalendarDays, CheckCheck, ChevronDown, Inbox, PhoneIncoming, PhoneMissed, Send, Webhook, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserDashboard } from "@/lib/data/dashboard";
import { parseScenario } from "@/lib/mock-data";
import { formatChangePct, formatNumber, formatPercent, ratioPct } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  DeliveryRatePanel,
  GatewayStatusPanel,
  MessageActivityChart,
  MetricCard,
  MetricGrid,
  MetricStrip,
  MetricStripItem,
  RecentMessagesTable,
  SplitRow,
  Trend,
  WebhookActivityPanel,
} from "@/components/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser();
  const data = await getUserDashboard(user.id, { scenario: parseScenario((await searchParams).mock) });
  const now = new Date(data.generatedAt);
  const m = data.metrics;
  const period = `vs previous ${m?.periodDays ?? 7} days`;
  const value = (n: number | undefined) => (n === undefined ? null : formatNumber(n));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Traffic and device health across your gateways."
        actions={
          <>
            <Button variant="outline">
              <CalendarDays />
              Last 7 days
              <ChevronDown className="text-muted-foreground" />
            </Button>
            <Button>
              <Send />
              Send SMS
            </Button>
          </>
        }
      />

      <MetricGrid label="Key metrics">
        <MetricCard
          label="SMS sent"
          icon={Send}
          value={value(m?.smsSent)}
          footer={m && <><Trend value={m.smsSentChangePct}>{formatChangePct(m.smsSentChangePct)}</Trend> {period}</>}
        />
        <MetricCard
          label="Delivered"
          icon={CheckCheck}
          value={value(m?.smsDelivered)}
          footer={m && <><Trend positive>{formatPercent(ratioPct(m.smsDelivered, m.smsSent))}</Trend> delivery rate</>}
        />
        <MetricCard
          label="Received"
          icon={Inbox}
          value={value(m?.smsReceived)}
          footer={m && <><Trend value={m.smsReceivedChangePct}>{formatChangePct(m.smsReceivedChangePct)}</Trend> {period}</>}
        />
        <MetricCard
          label="Webhook success"
          icon={Webhook}
          value={m && formatPercent(ratioPct(m.webhookDeliveries - m.webhookFailures, m.webhookDeliveries))}
          footer={m && <span className="num">{formatNumber(m.webhookDeliveries - m.webhookFailures)} of {formatNumber(m.webhookDeliveries)} deliveries</span>}
        />
      </MetricGrid>

      <MetricStrip label="Calls and failures">
        <MetricStripItem label="Answered calls" value={value(m?.callsAnswered)} tile={<PhoneIncoming />} />
        <MetricStripItem label="Missed calls" value={value(m?.callsMissed)} tile={<PhoneMissed />} />
        <MetricStripItem
          label="Failed SMS"
          value={value(m?.smsFailed)}
          extra={m ? formatPercent(ratioPct(m.smsFailed, m.smsSent)) : undefined}
          tile={<XCircle />}
          tone="danger"
        />
        <MetricStripItem
          label="Failed webhooks"
          value={value(m?.webhookFailures)}
          extra={m ? formatPercent(ratioPct(m.webhookFailures, m.webhookDeliveries)) : undefined}
          tile={<AlertTriangle />}
          tone="danger"
        />
      </MetricStrip>

      <SplitRow>
        <MessageActivityChart description="SMS sent and received per day, last 14 days" data={data.activity} seriesLabels={["Sent", "Received"]} />
        <DeliveryRatePanel metrics={m} />
      </SplitRow>

      <SplitRow>
        <GatewayStatusPanel gateways={data.gateways} now={now} />
        <WebhookActivityPanel deliveries={data.webhookDeliveries} now={now} />
      </SplitRow>

      <RecentMessagesTable messages={data.messages} />
    </>
  );
}
