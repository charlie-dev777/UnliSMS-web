import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  Inbox,
  PhoneIncoming,
  PhoneMissed,
  Send,
  Smartphone,
  Webhook,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import {
  BarChart,
  Breakdown,
  Legend,
  Metric,
  MetricStrip,
  PageHeader,
  Row21,
  SignalBars,
  StatCard,
  StatGrid,
  Up,
} from "@/components/dashboard/widgets";
import {
  deliveryBreakdown,
  fmt,
  gateways,
  messageStatusVariant,
  recentMessages,
  userActivity,
  userStats as s,
  webhookEvents,
  type Sim,
} from "@/lib/mock-data";

export const metadata: Metadata = { title: "Dashboard" };

const viewAll = buttonVariants({ variant: "link", size: "sm" });

export default function DashboardPage() {
  const online = gateways.filter((g) => g.online).length;
  const sims = gateways.reduce((n, g) => n + (g.sim1 ? 1 : 0) + (g.sim2 ? 1 : 0), 0);

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
              <ChevronDown className="text-muted-fg" />
            </Button>
            <Button>
              <Send />
              Send SMS
            </Button>
          </>
        }
      />

      <StatGrid label="Key metrics">
        <StatCard label="SMS sent" icon={Send} value={fmt(s.sent.value)} footer={<><Up>{s.sent.change}</Up> vs previous 7 days</>} />
        <StatCard label="Delivered" icon={CheckCheck} value={fmt(s.delivered.value)} footer={<><Up>{s.delivered.rate}</Up> delivery rate</>} />
        <StatCard label="Received" icon={Inbox} value={fmt(s.received.value)} footer={<><Up>{s.received.change}</Up> vs previous 7 days</>} />
        <StatCard
          label="Webhook success"
          icon={Webhook}
          value={s.webhook.rate}
          footer={<span className="num">{fmt(s.webhook.ok)} of {fmt(s.webhook.total)} deliveries</span>}
        />
      </StatGrid>

      <MetricStrip label="Calls and failures">
        <Metric label="Answered calls" value={fmt(s.answeredCalls)} tile={<PhoneIncoming />} />
        <Metric label="Missed calls" value={fmt(s.missedCalls)} tile={<PhoneMissed />} />
        <Metric label="Failed SMS" value={fmt(s.failedSms.value)} extra={s.failedSms.pct} tile={<XCircle />} tone="danger" />
        <Metric label="Failed webhooks" value={fmt(s.failedWebhooks.value)} extra={s.failedWebhooks.pct} tile={<AlertTriangle />} tone="danger" />
      </MetricStrip>

      <Row21>
        <Card>
          <CardHeader
            title="Message activity"
            description="SMS sent and received per day, last 14 days"
            action={<Legend items={[{ label: "Sent", color: "var(--primary)" }, { label: "Received", color: "var(--primary-tint)" }]} />}
          />
          <BarChart data={userActivity} max={2400} ticks={["2.4k", "1.8k", "1.2k", "600", "0"]} seriesLabels={["Sent", "Received"]} />
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Delivery rate"
            description="Outbound SMS, last 7 days"
            action={<Badge variant="success" dot>Healthy</Badge>}
          />
          <div className="flex flex-col gap-5 px-5 pt-1 pb-5">
            <div>
              <div className="num text-4xl leading-[44px] font-semibold tracking-[-0.02em]">{deliveryBreakdown.rate}</div>
              <div className="text-xs text-muted-fg"><Up>{deliveryBreakdown.change}</Up> vs previous 7 days</div>
            </div>
            <Breakdown segments={deliveryBreakdown.segments} />
          </div>
        </Card>
      </Row21>

      <Row21>
        <Card>
          <CardHeader
            title="Gateways"
            description={`${online} of ${gateways.length} devices online · ${sims} active SIMs`}
            action={<Link href="/gateways" className={viewAll}>View all</Link>}
          />
          <Table>
            <thead>
              <tr><Th>Device</Th><Th>Status</Th><Th>SIM 1</Th><Th>SIM 2</Th><Th>Last seen</Th></tr>
            </thead>
            <tbody>
              {gateways.map((g) => (
                <Tr key={g.name}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-fg-2">
                        <Smartphone className="size-3.5" />
                      </span>
                      <div className="flex flex-col leading-[18px]">
                        <Link href="/gateways" className="font-medium text-fg">{g.name}</Link>
                        <span className="text-xs text-muted-fg">{g.model}</span>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {g.online ? (
                      <Badge variant="success" dot>Online</Badge>
                    ) : (
                      <Badge variant="neutral" dot dotClassName="bg-offline">Offline</Badge>
                    )}
                  </Td>
                  <Td><SimCell sim={g.sim1} /></Td>
                  <Td><SimCell sim={g.sim2} /></Td>
                  <Td className="text-xs text-muted-fg">{g.lastSeen}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Webhook activity" description="Last delivery 2 min ago" action={<Link href="/webhooks" className={viewAll}>View all</Link>} />
          {webhookEvents.map((h, i) => (
            <div key={i} className="flex items-center gap-3 border-t border-border px-5 py-3">
              <div className="flex min-w-0 flex-1 flex-col leading-[18px]">
                <span className="font-mono text-[12.5px] text-fg">{h.event}</span>
                <span className="truncate text-xs text-muted-fg">{h.host} · {h.time}</span>
              </div>
              {h.state === "ok" && <Badge variant="success" className="font-mono text-[11.5px]">{h.code}</Badge>}
              {h.state === "retry" && <Badge variant="warning">Retrying</Badge>}
              {h.state === "fail" && <Badge variant="danger" className="font-mono text-[11.5px]">{h.code}</Badge>}
            </div>
          ))}
        </Card>
      </Row21>

      <Card>
        <CardHeader
          className="items-center"
          title="Recent messages"
          description="Latest outbound and inbound SMS"
          action={<Link href="/messages" className={buttonVariants({ variant: "outline", size: "sm" })}>View all messages</Link>}
        />
        <Table>
          <thead>
            <tr><Th>Number</Th><Th>Direction</Th><Th>Message</Th><Th>Gateway · SIM</Th><Th>Status</Th><Th className="text-right">Time</Th></tr>
          </thead>
          <tbody>
            {recentMessages.map((m) => (
              <Tr key={m.number + m.time}>
                <Td className="font-mono text-[12.5px]">{m.number}</Td>
                <Td className="text-xs text-muted-fg">{m.direction}</Td>
                <Td className="max-w-80 overflow-hidden text-ellipsis text-fg-2">{m.body}</Td>
                <Td><span className="font-medium">{m.gateway}</span><span className="text-xs text-muted-fg"> · {m.sim}</span></Td>
                <Td><Badge variant={messageStatusVariant[m.status]} dot>{m.status}</Badge></Td>
                <Td className="num text-right text-xs text-muted-fg">{m.time}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function SimCell({ sim }: { sim: Sim }) {
  return (
    <div className="flex items-center gap-2">
      <SignalBars level={sim?.signal ?? 0} />
      <div className="flex flex-col leading-[18px]">
        <span className="font-medium">{sim ? sim.carrier : "Empty slot"}</span>
        <span className="font-mono text-[11.5px] text-muted-fg">{sim ? sim.number : "—"}</span>
      </div>
    </div>
  );
}
