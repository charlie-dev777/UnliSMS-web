import type { Metadata } from "next";
import { Plus, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { StatCard, Up } from "@/components/dashboard/widgets";
import { LogoMark } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Design system" };

const colors: [string, string, string][] = [
  ["Foreground", "--fg", "#0B1220"],
  ["Foreground 2", "--fg-2", "#344054"],
  ["Muted fg", "--muted-fg", "#5F6B7A"],
  ["Border", "--border", "#E6E9EE"],
  ["Muted", "--muted", "#F7F8FA"],
  ["Primary", "--primary", "#0080F0"],
  ["Primary solid", "--primary-solid", "#0073DD"],
  ["Primary dark", "--primary-dark", "#0048A0"],
  ["Primary soft", "--primary-soft", "#EEF6FF"],
  ["Accent", "--accent", "#F8C848"],
  ["Success", "--success", "#16A34A"],
  ["Danger", "--danger", "#DC2626"],
];

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-8 border-t border-border py-10 md:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <h2 className="m-0 text-base font-semibold">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-fg">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-10">
      <div className="flex items-center gap-3 pb-8">
        <LogoMark width={54} height={34} />
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.02em]">UnliSMS design system</h1>
      </div>

      <Section title="Color" description="Neutral surfaces carry the UI. Blue is reserved for primary actions, active navigation, links and focus. Status colors appear only inside badges, alerts and charts.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {colors.map(([name, token, hex]) => (
            <div key={token} className="flex flex-col gap-1.5">
              <div className="h-14 rounded-lg border border-border" style={{ background: `var(${token})` }} />
              <span className="text-[13px] font-medium">{name}</span>
              <span className="font-mono text-[11.5px] text-muted-fg">{token} · {hex}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" description="Geist for UI, Geist Mono for phone numbers, IDs, keys and event names. Tabular numerals on every metric.">
        <div className="flex flex-col gap-3">
          <span className="text-2xl leading-8 font-semibold tracking-[-0.02em]">Page title · 24/32 semibold</span>
          <span className="text-sm leading-5 font-semibold">Card title · 14/20 semibold</span>
          <span className="text-sm">Body · 14/21 regular</span>
          <span className="text-xs text-muted-fg">Caption · 12 muted</span>
          <span className="font-mono text-[12.5px]">+63 917 555 0142 · message.delivered</span>
          <span className="num text-[28px] leading-9 font-semibold tracking-[-0.02em]">12,480</span>
        </div>
      </Section>

      <Section title="Buttons" description="One primary action per view. Outline for secondary, ghost inside cards and toolbars, destructive only in confirmation dialogs.">
        <div className="flex flex-wrap items-center gap-2">
          <Button><Send />Send SMS</Button>
          <Button variant="outline"><Plus />Add gateway</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="link" size="sm">View all</Button>
          <Button variant="destructive"><Trash2 />Delete</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Form controls" description="Labels above, helper text below. Errors replace helper text and turn the border red.">
        <div className="grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-name">Gateway name</Label>
            <Input id="ds-name" placeholder="Office Pixel 7" />
            <span className="text-xs text-muted-fg">Shown in message logs.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-url">Webhook URL</Label>
            <Input id="ds-url" defaultValue="api.acme.ph/hooks" aria-invalid="true" aria-describedby="ds-url-err" />
            <span id="ds-url-err" className="text-xs text-danger-fg">Enter a full URL starting with https://</span>
          </div>
        </div>
      </Section>

      <Section title="Status badges" description="Pill, 22px, soft tint + 1px border + dot. One mapping across messages, gateways, webhooks and services.">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" dot>Delivered</Badge>
          <Badge variant="info" dot>Received</Badge>
          <Badge variant="neutral" dot>Sent</Badge>
          <Badge variant="warning" dot>Pending</Badge>
          <Badge variant="danger" dot>Failed</Badge>
        </div>
      </Section>

      <Section title="Cards & metrics" description="Only the 3–4 headline metrics get a stat card. Secondary metrics share one compact strip.">
        <div className="grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="SMS sent" icon={Send} value="12,480" footer={<><Up>+8.2%</Up> vs previous 7 days</>} />
          <Card><CardHeader title="Card title" description="Short supporting description" /></Card>
        </div>
      </Section>
    </main>
  );
}
