import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  MessageSquare,
  Users,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import {
  Avatar,
  BarChart,
  Breakdown,
  Down,
  Legend,
  Metric,
  MetricStrip,
  PageHeader,
  Row21,
  StatCard,
  StatGrid,
  Up,
  UptimeBar,
} from "@/components/dashboard/widgets";
import {
  adminStats as s,
  fmt,
  gatewayHealth,
  platformActivity,
  recentFailures,
  recentSignups,
  services,
  type Service,
  type Signup,
} from "@/lib/mock-data";

export const metadata: Metadata = { title: "Admin dashboard" };

const serviceVariant: Record<Service["status"], BadgeVariant> = { Operational: "success", Degraded: "warning", Outage: "danger" };
const planVariant: Record<Signup["plan"], BadgeVariant> = { Business: "info", Starter: "neutral", Free: "neutral" };

const Dot = ({ color }: { color: string }) => <span className="size-2 rounded-full" style={{ background: color }} />;

export default function AdminDashboardPage() {
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
              <ChevronDown className="text-muted-fg" />
            </Button>
            <Button variant="outline">
              <Download />
              Export
            </Button>
          </>
        }
      />

      <StatGrid label="Key metrics">
        <StatCard label="Total users" icon={Users} value={fmt(s.totalUsers.value)} footer={<><Up>{s.totalUsers.change}</Up> this week</>} />
        <StatCard label="Active users" icon={Activity} value={fmt(s.activeUsers.value)} footer={s.activeUsers.note} />
        <StatCard label="Messages today" icon={MessageSquare} value={fmt(s.messagesToday.value)} footer={<><Up>{s.messagesToday.change}</Up> vs same time yesterday</>} />
        <StatCard label="SMS delivery rate" icon={CheckCheck} value={s.deliveryRate.value} footer={<><Down>{s.deliveryRate.change}</Down> vs yesterday</>} />
      </StatGrid>

      <MetricStrip label="Gateways, webhooks and subscriptions">
        <Metric label="Online gateways" value={fmt(s.onlineGateways)} tile={<Dot color="var(--success)" />} />
        <Metric label="Offline gateways" value={fmt(s.offlineGateways)} tile={<Dot color="var(--offline)" />} />
        <Metric label="Failed webhooks · 24h" value={fmt(s.failedWebhooks24h)} tile={<AlertTriangle />} tone="danger" />
        <Metric label="Active subscriptions" value={fmt(s.activeSubscriptions)} tile={<CreditCard />} />
      </MetricStrip>

      <Row21>
        <Card>
          <CardHeader
            title="Message activity"
            description="Platform-wide SMS per day, last 14 days"
            action={<Legend items={[{ label: "Outbound", color: "var(--primary)" }, { label: "Inbound", color: "var(--primary-tint)" }]} />}
          />
          <BarChart data={platformActivity} max={240} unit="k" ticks={["240k", "180k", "120k", "60k", "0"]} seriesLabels={["Outbound", "Inbound"]} />
        </Card>

        <Card>
          <CardHeader
            title="System health"
            description="Uptime, last 30 days"
            action={<Link href="/admin/system" className={buttonVariants({ variant: "link", size: "sm" })}>Details</Link>}
          />
          {services.map((svc) => (
            <div key={svc.name} className="flex flex-col gap-2 border-t border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium">{svc.name}</span>
                <span className="text-xs text-muted-fg">{svc.meta}</span>
                <Badge variant={serviceVariant[svc.status]} dot className="ml-auto">{svc.status}</Badge>
              </div>
              <UptimeBar bad={svc.bad} warn={svc.warn} uptime={svc.uptime} />
            </div>
          ))}
        </Card>
      </Row21>

      <Row21>
        <Card>
          <CardHeader
            className="items-center"
            title="Recent signups"
            description={`${s.totalUsers.change.replace("+", "")} new accounts this week`}
            action={<Link href="/admin/users" className={buttonVariants({ variant: "link", size: "sm" })}>View all users</Link>}
          />
          <Table>
            <thead>
              <tr><Th>User</Th><Th>Plan</Th><Th>Email</Th><Th className="text-right">Gateways</Th><Th className="text-right">Joined</Th></tr>
            </thead>
            <tbody>
              {recentSignups.map((u) => (
                <Tr key={u.email}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={u.initials} />
                      <div className="flex flex-col leading-[18px]">
                        <Link href="/admin/users" className="font-medium text-fg">{u.name}</Link>
                        <span className="text-xs text-muted-fg">{u.email}</span>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge variant={planVariant[u.plan]}>{u.plan}</Badge></Td>
                  <Td>
                    {u.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-success-fg"><CheckCircle2 className="size-3.5" />Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-fg"><Clock className="size-3.5" />Pending</span>
                    )}
                  </Td>
                  <Td className="num text-right">{u.gateways}</Td>
                  <Td className="num text-right text-xs text-muted-fg">{u.joined}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Gateway health" description={`${fmt(gatewayHealth.registered)} registered devices`} />
          <div className="flex flex-col gap-5 px-5 pt-1 pb-5">
            <div>
              <div className="num text-4xl leading-[44px] font-semibold tracking-[-0.02em]">{gatewayHealth.onlinePct}</div>
              <div className="text-xs text-muted-fg">online right now</div>
            </div>
            <Breakdown segments={gatewayHealth.segments} showPct={false} />
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div className="flex flex-col"><span className="text-xs text-muted-fg">Avg. heartbeat</span><span className="num font-semibold">{gatewayHealth.avgHeartbeat}</span></div>
              <div className="flex flex-col"><span className="text-xs text-muted-fg">FCM push success</span><span className="num font-semibold">{gatewayHealth.fcmSuccess}</span></div>
            </div>
          </div>
        </Card>
      </Row21>

      <Card>
        <CardHeader
          className="items-center"
          title="Recent failures"
          description="SMS, webhook, gateway and push errors in the last hour"
          action={<Link href="/admin/system" className={buttonVariants({ variant: "outline", size: "sm" })}>View system log</Link>}
        />
        <Table>
          <thead>
            <tr><Th>Type</Th><Th>Detail</Th><Th>User</Th><Th>Error</Th><Th className="text-right">Time</Th></tr>
          </thead>
          <tbody>
            {recentFailures.map((f) => (
              <Tr key={f.code + f.time}>
                <Td><Badge variant="neutral">{f.type}</Badge></Td>
                <Td className="max-w-[360px] overflow-hidden text-ellipsis text-fg-2">{f.detail}</Td>
                <Td><Link href="/admin/users" className="text-fg">{f.user}</Link></Td>
                <Td><span className="font-mono text-[12.5px] text-danger-fg">{f.code}</span></Td>
                <Td className="num text-right text-xs text-muted-fg">{f.time}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
