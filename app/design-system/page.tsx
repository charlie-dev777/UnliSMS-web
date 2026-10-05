import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  Webhook,
  X,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback";
import { LogoMark } from "@/components/layout/logo";
import { MetricCard, MetricCardSkeleton, MetricStrip, MetricStripItem, TileDot, Trend } from "@/components/dashboard";
import { GatewayStatusBadge, MessageStatusBadge, PlanBadge, ServiceStatusBadge, WebhookStatusBadge } from "@/components/status";
import { ApiKeyDialogDemo, ToastDemo } from "./demos";

export const metadata: Metadata = { title: "Design system" };

const brand = [
  { name: "Primary blue", hex: "#0080F0", token: "brand", use: "Charts, indicators, focus" },
  { name: "Dark blue", hex: "#0048A0", token: "primary-hover", use: "Hover, active text" },
  { name: "Cyan", hex: "#00B8C8", token: "chart-3", use: "Charts only" },
  { name: "Light blue", hex: "#00A8E0", token: "chart-2", use: "Charts only" },
  { name: "Accent yellow", hex: "#F8C848", token: "warning", use: "Pending, warnings" },
  { name: "Background", hex: "#FFFFFF", token: "background", use: "Page and cards" },
];

const semantic = [
  ["foreground", "#0B1220"],
  ["muted", "#F7F8FA"],
  ["muted-foreground", "#5F6B7A"],
  ["border", "#E6E9EE"],
  ["input", "#D5DAE1"],
  ["primary", "#0073DD"],
  ["accent", "#EEF6FF"],
  ["ring", "#0080F0"],
  ["success-foreground", "#15803D"],
  ["warning-foreground", "#8A5A00"],
  ["destructive", "#B42318"],
  ["sidebar", "#FBFCFD"],
] as const;

const type = [
  { name: "Display", spec: "30/36 · 600 · −2%", className: "text-[30px] leading-9 font-semibold tracking-[-0.02em]", sample: "UnliSMS" },
  { name: "Page title", spec: "24/32 · 600 · −2%", className: "text-2xl leading-8 font-semibold tracking-[-0.02em]", sample: "Dashboard" },
  { name: "Section", spec: "16/24 · 600", className: "text-base leading-6 font-semibold", sample: "Webhook settings" },
  { name: "Card title", spec: "14/20 · 600", className: "text-sm leading-5 font-semibold", sample: "Message activity" },
  { name: "Body", spec: "14/20 · 400", className: "text-sm leading-5", sample: "Traffic and device health across your gateways." },
  { name: "Small / caption", spec: "13/20 · 12/16 · 400", className: "text-[13px] leading-5 text-muted-foreground", sample: "Last delivery 2 min ago" },
  { name: "Metric", spec: "28/36 · 600 · tabular", className: "num text-[28px] leading-9 font-semibold tracking-[-0.02em]", sample: "12,480" },
  { name: "Mono", spec: "Geist Mono 12.5/18", className: "font-mono text-[12.5px]", sample: "+63 917 555 0142 · gw_8f2k3x91a · message.delivered" },
];

const space = [1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => ({ tw: `p-${n}`, px: n * 4 }));

const radii = [
  { label: "6 px", use: "kbd, small tags", className: "rounded-md" },
  { label: "8 px", use: "inputs, buttons, nav items", className: "rounded-lg" },
  { label: "12 px", use: "cards, dialogs", className: "rounded-xl" },
  { label: "full", use: "badges, avatars", className: "rounded-full" },
];

function Section({ title, description, source, children }: { title: string; description: string; source: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-4 border-t border-border py-10 min-[901px]:grid-cols-[240px_minmax(0,1fr)] min-[901px]:gap-8">
      <div>
        <h2 className="m-0 text-base leading-6 font-semibold">{title}</h2>
        <p className="mt-1 mb-0 text-[13px] text-muted-foreground">{description}</p>
        <code className="mt-2.5 inline-block rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-foreground-2">{source}</code>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const Caption = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-xs text-muted-foreground ${className ?? ""}`}>{children}</span>
);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Caption className="w-[90px]">{label}</Caption>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="px-4 pt-14 pb-20">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-wrap items-end justify-between gap-6 pb-10">
          <div className="flex items-center gap-4">
            <LogoMark width={84} height={52} />
            <div>
              <h1 className="m-0 text-[30px] leading-9 font-semibold tracking-[-0.02em]">UnliSMS design system</h1>
              <p className="mt-1 mb-0 text-muted-foreground">Foundations and patterns shared by the user portal and the admin portal. Built on shadcn/ui + Tailwind.</p>
            </div>
          </div>
          <Badge>v0.1 · Light</Badge>
        </header>

        <Section
          title="Color"
          description="Neutral surfaces carry the UI. Blue is reserved for primary actions, active navigation, links and focus. Status colors appear only inside badges, alerts and charts."
          source="globals.css · :root"
        >
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-2.5 text-xs font-medium text-muted-foreground">Brand</div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {brand.map((c) => (
                  <Card key={c.token} className="overflow-hidden">
                    <div className="h-16 border-b border-border" style={{ background: c.hex }} />
                    <div className="flex flex-col gap-0.5 px-3 py-2.5">
                      <span className="text-[13px] font-medium">{c.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {c.hex} · {c.token}
                      </span>
                      <Caption>{c.use}</Caption>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2.5 text-xs font-medium text-muted-foreground">Semantic tokens</div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
                {semantic.map(([token, hex]) => (
                  <div key={token} className="flex items-center gap-2.5 rounded-[10px] border border-border p-2">
                    <span className="size-8 shrink-0 rounded-lg border border-foreground/10" style={{ background: `var(--${token})` }} />
                    <div className="flex min-w-0 flex-col leading-[18px]">
                      <span className="font-mono text-xs text-foreground">--{token}</span>
                      <span className="font-mono text-xs text-muted-foreground">{hex}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 mb-0 text-xs text-muted-foreground">
                Primary fills and link text use <span className="font-mono">#0073DD</span> (a step darker than brand <span className="font-mono">#0080F0</span>) so
                white button text and blue links pass WCAG AA 4.5:1. Brand <span className="font-mono">#0080F0</span> is used for charts, indicators and focus rings.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Typography" description="Geist for UI, Geist Mono for phone numbers, IDs, keys and event names. Tabular numerals on every metric." source="next/font · Geist">
          <Card>
            {type.map((t, i) => (
              <div
                key={t.name}
                className={`grid grid-cols-1 items-baseline gap-1 px-5 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4 ${i < type.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">{t.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{t.spec}</span>
                </div>
                <span className={t.className}>{t.sample}</span>
              </div>
            ))}
          </Card>
        </Section>

        <Section
          title="Spacing & radius"
          description="4 px base. Cards pad 20 px, page gutters 40 px desktop / 16 px mobile, 16 px between cards, 24 px between page sections."
          source="tailwind · spacing"
        >
          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
            <Card className="flex flex-col gap-2.5 p-5">
              {space.map((s) => (
                <div key={s.tw} className="flex items-center gap-3">
                  <span className="w-16 font-mono text-xs text-muted-foreground">{s.tw}</span>
                  <span className="h-2.5 rounded-[2px] bg-brand-tint" style={{ width: s.px }} />
                  <span className="font-mono text-xs text-muted-foreground">{s.px}px</span>
                </div>
              ))}
            </Card>
            <Card className="grid grid-cols-2 gap-4 p-5">
              {radii.map((r) => (
                <div key={r.label} className="flex flex-col gap-2">
                  <div className={`h-16 border border-input bg-muted ${r.className}`} />
                  <Caption>
                    <b className="font-medium text-foreground">{r.label}</b> · {r.use}
                  </Caption>
                </div>
              ))}
            </Card>
          </div>
        </Section>

        <Section
          title="Buttons"
          description="One primary action per view. Outline for secondary, ghost inside cards and toolbars, destructive only in confirmation dialogs."
          source="components/ui/button"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button>
                <Send />
                Send SMS
              </Button>
              <Button variant="outline">Schedule</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Revoke key</Button>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>
                <Send />
                Sending…
              </Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Form controls"
          description="36 px controls, labels above, helper text below. Errors replace helper text and turn the border red."
          source="input · select · textarea · checkbox · switch"
        >
          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds1">Destination</Label>
              <Input id="ds1" placeholder="+63 917 000 0000" />
              <Caption>E.164 or local format</Caption>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds2">Destination</Label>
              <Input id="ds2" defaultValue="+63 917 555 01" />
              <Caption>Focus to see the ring</Caption>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds3">Destination</Label>
              <Input id="ds3" defaultValue="0917-55" aria-invalid aria-describedby="ds3-err" />
              <span id="ds3-err" className="text-xs text-destructive">
                Enter a valid mobile number.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds4">Gateway · SIM</Label>
              <Select defaultValue="office-1">
                <SelectTrigger id="ds4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office-1">Office Pixel 7 · SIM 1 (Globe)</SelectItem>
                  <SelectItem value="office-2">Office Pixel 7 · SIM 2 (Smart)</SelectItem>
                  <SelectItem value="warehouse-1">Warehouse A54 · SIM 1 (Smart)</SelectItem>
                  <SelectItem value="cebu-1">Cebu Branch · SIM 1 (DITO)</SelectItem>
                </SelectContent>
              </Select>
              <Caption>Select</Caption>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds5">Scheduled for</Label>
              <Input id="ds5" defaultValue="Oct 3, 2026 · 9:00 AM" />
              <Caption>Shown in your local time (GMT+8)</Caption>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds6">Gateway ID</Label>
              <Input id="ds6" className="font-mono" defaultValue="gw_8f2k3x91a" disabled />
              <Caption>Disabled</Caption>
            </div>
            <div className="flex flex-col gap-1.5 min-[901px]:col-span-2">
              <Label htmlFor="ds7">Message</Label>
              <Textarea id="ds7" defaultValue="Hi Ana, your order #10482 has been shipped and arrives tomorrow." />
              <Caption className="num flex justify-between">
                <span>1 SMS segment</span>
                <span>66 / 160</span>
              </Caption>
            </div>
            <div className="flex flex-col gap-3.5 pt-6">
              <div className="flex items-center gap-2">
                <Checkbox id="ds8" defaultChecked />
                <Label htmlFor="ds8" className="text-sm font-normal">
                  message.delivered
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ds9" />
                <Label htmlFor="ds9" className="text-sm font-normal">
                  message.failed
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch id="ds10" defaultChecked />
                <Label htmlFor="ds10" className="text-sm font-normal">
                  Webhook enabled
                </Label>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Status badges"
          description="Pill, 22 px, soft tint + 1 px border + dot. One mapping across messages, gateways, webhooks and services."
          source="components/status"
        >
          <div className="flex flex-col gap-3.5">
            <Row label="Messages">
              {(["scheduled", "queued", "sending", "sent", "delivered", "failed", "cancelled"] as const).map((s) => (
                <MessageStatusBadge key={s} status={s} />
              ))}
            </Row>
            <Row label="Gateways">
              <GatewayStatusBadge status="online" />
              <GatewayStatusBadge status="offline" />
              <GatewayStatusBadge status="unknown" />
            </Row>
            <Row label="Webhooks">
              <WebhookStatusBadge state="succeeded" responseStatus={200} />
              <WebhookStatusBadge state="retrying" responseStatus={503} />
              <WebhookStatusBadge state="failed" responseStatus={500} />
              <WebhookStatusBadge state="disabled" />
            </Row>
            <Row label="Services">
              <ServiceStatusBadge status="operational" />
              <ServiceStatusBadge status="degraded" />
              <ServiceStatusBadge status="outage" />
            </Row>
            <Row label="Plans">
              <PlanBadge tier="FREE" />
              <PlanBadge tier="STARTER" />
              <PlanBadge tier="BUSINESS" />
            </Row>
          </div>
        </Section>

        <Section
          title="Cards & metrics"
          description="Only the 3–4 headline metrics get a stat card. Secondary metrics share one compact strip."
          source="components/dashboard"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
              <MetricCard
                label="SMS sent"
                icon={Send}
                value="12,480"
                footer={
                  <>
                    <Trend value={8.2}>+8.2%</Trend> vs previous 7 days
                  </>
                }
              />
              <MetricCardSkeleton />
              <MetricCard label="Delivered" icon={CheckCircle2} value={null} footer={null} />
            </div>
            <MetricStrip label="Example metric strip">
              <MetricStripItem label="Online gateways" value="1,248" tile={<TileDot className="bg-success" />} />
              <MetricStripItem label="Offline gateways" value="86" tile={<TileDot className="bg-offline" />} />
              <MetricStripItem label="Failed webhooks" value="312" tile={<TileDot className="bg-danger" />} />
              <MetricStripItem label="Active subscriptions" value="1,106" tile={<TileDot className="bg-brand" />} />
            </MetricStrip>
          </div>
        </Section>

        <Section
          title="Tables, search & filters"
          description="Toolbar above (search left, filters and actions right), muted header row, row hover, pagination below. Numbers and IDs in mono."
          source="table · input · dropdown-menu"
        >
          <Card className="overflow-hidden">
            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
              <label className="flex h-8 w-[260px] max-w-full items-center gap-2 rounded-lg border border-input px-2.5 text-muted-foreground">
                <Search className="size-4 shrink-0" aria-hidden />
                <input placeholder="Search number or message" aria-label="Search messages" className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-foreground outline-none" />
              </label>
              <Button variant="outline" size="sm" className="border-dashed">
                <PlusCircle />
                Status
                <span className="h-4 w-px bg-border" />
                <Badge shape="tag" className="h-[18px] rounded-[4px]">
                  Failed
                </Badge>
              </Button>
              <Button variant="outline" size="sm" className="border-dashed">
                <PlusCircle />
                Gateway
              </Button>
              <Button variant="ghost" size="sm">
                Reset
                <X />
              </Button>
              <Button variant="outline" size="sm" className="ml-auto">
                <SlidersHorizontal />
                View
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Gateway · SIM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["+63 905 555 0128", "Your verification code is 113027…", "Cebu Branch", "SIM 2", "Oct 2, 10:24 AM"],
                  ["+63 919 555 0186", "Reminder: your payment of ₱980 is due…", "Warehouse A54", "SIM 1", "Oct 2, 9:51 AM"],
                ].map(([num, msg, gw, sim, at]) => (
                  <TableRow key={num}>
                    <TableCell className="font-mono text-[12.5px]">{num}</TableCell>
                    <TableCell className="text-foreground-2">{msg}</TableCell>
                    <TableCell>
                      {gw} <span className="text-xs text-muted-foreground">· {sim}</span>
                    </TableCell>
                    <TableCell>
                      <MessageStatusBadge status="failed" />
                    </TableCell>
                    <TableCell className="num text-right text-xs text-muted-foreground">{at}</TableCell>
                    <TableCell className="py-1.5">
                      <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
              <Caption className="num">Showing 1–2 of 181</Caption>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <Button variant="ghost" size="sm" aria-label="Previous page">
                  <ChevronLeft />
                  Previous
                </Button>
                <Button variant="outline" size="icon-sm" aria-current="page">
                  1
                </Button>
                <Button variant="ghost" size="icon-sm">
                  2
                </Button>
                <Button variant="ghost" size="icon-sm">
                  3
                </Button>
                <Caption className="px-1">…</Caption>
                <Button variant="ghost" size="sm" aria-label="Next page">
                  Next
                  <ChevronRight />
                </Button>
              </nav>
            </div>
          </Card>
        </Section>

        <Section
          title="Feedback states"
          description="Alerts sit inline at the top of the affected card or page. Toasts confirm actions bottom-right and auto-dismiss after 5 s."
          source="alert · sonner · skeleton"
        >
          <div className="flex flex-col gap-4">
            <Alert variant="success">
              <CheckCircle2 aria-hidden />
              <div>
                <AlertTitle>Webhook test succeeded</AlertTitle>
                <AlertDescription>api.acme.ph/hooks/sms responded 200 in 182 ms.</AlertDescription>
              </div>
            </Alert>
            <Alert variant="warning">
              <AlertTriangle aria-hidden />
              <div>
                <AlertTitle>You’ve used 90% of this month’s SMS</AlertTitle>
                <AlertDescription>
                  Sending pauses at 20,000 messages. <a href="#">Upgrade plan</a>
                </AlertDescription>
              </div>
            </Alert>
            <Alert variant="danger">
              <XCircle aria-hidden />
              <div>
                <AlertTitle>Backup Moto is offline</AlertTitle>
                <AlertDescription>No heartbeat for 3 hours. Messages routed to this gateway are queued.</AlertDescription>
              </div>
            </Alert>

            <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
              <Card>
                <EmptyState
                  icon={Webhook}
                  title="No webhooks yet"
                  description="Get delivery reports and inbound SMS pushed to your server."
                  action={
                    <Button size="sm">
                      <PlusCircle />
                      Add webhook
                    </Button>
                  }
                />
              </Card>
              <Card>
                <ListSkeleton />
              </Card>
              <Card>
                <ErrorState
                  icon={MessageSquare}
                  title="Couldn’t load messages"
                  description="The request timed out. Check your connection and try again."
                  action={
                    <Button variant="outline" size="sm">
                      Try again
                    </Button>
                  }
                />
              </Card>
            </div>
            <div className="flex justify-end">
              <ToastDemo />
            </div>
          </div>
        </Section>

        <Section
          title="Dialogs & menus"
          description="Dialogs max 480 px wide, title + description + footer actions right-aligned. Menus 8 px radius, 32 px items, destructive item last."
          source="dialog · dropdown-menu"
        >
          <div className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-muted p-8">
            <ApiKeyDialogDemo />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Gateway actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy />
                  Copy gateway ID
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 />
                  Remove gateway
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Section>

        <Section
          title="Sidebar & navigation"
          description="248 px sidebar on #FBFCFD with a 1 px right border. Grouped by section labels. Active item: soft blue fill, dark-blue text, brand-blue icon. Below 1024 px the sidebar collapses into a sheet behind the mobile header."
          source="components/layout · sheet"
        >
          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
            {[
              { state: "Default", className: "text-foreground-2", icon: "" },
              { state: "Hover", className: "bg-sidebar-hover text-foreground", icon: "" },
              { state: "Active", className: "bg-accent text-accent-foreground", icon: "text-brand" },
            ].map((s) => (
              <div key={s.state} className="flex flex-col gap-1.5">
                <span className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium ${s.className}`}>
                  <MessageSquare className={`size-4 ${s.icon}`} aria-hidden />
                  Messages
                </span>
                <Caption className="pl-2.5">{s.state}</Caption>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
