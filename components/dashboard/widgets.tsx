import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { DailyVolume } from "@/lib/mock-data";

/* Page header ------------------------------------------------------------- */

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-2xl leading-8 font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="mt-1 text-muted-fg">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* Headline stat cards (only the 3–4 most important metrics) --------------- */

export function StatGrid({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <section aria-label={label} className="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2 min-[1181px]:grid-cols-4">
      {children}
    </section>
  );
}

export function StatCard({ label, icon: Icon, value, footer }: { label: string; icon: LucideIcon; value: React.ReactNode; footer: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-1 p-5">
      <div className="flex items-center justify-between text-[13px] font-medium text-muted-fg">
        {label}
        <Icon className="size-4" />
      </div>
      <div className="num mt-1.5 text-[28px] leading-9 font-semibold tracking-[-0.02em]">{value}</div>
      <div className="text-xs text-muted-fg">{footer}</div>
    </Card>
  );
}

export const Up = ({ children }: { children: React.ReactNode }) => <span className="font-medium text-success-fg">{children}</span>;
export const Down = ({ children }: { children: React.ReactNode }) => <span className="font-medium text-danger-fg">{children}</span>;

/* Compact metric strip (secondary metrics share one card) ----------------- */

export function MetricStrip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Card
      aria-label={label}
      className={cn(
        "grid grid-cols-2 min-[761px]:grid-cols-4",
        "[&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t",
        "min-[761px]:[&>*:nth-child(n+2)]:border-l min-[761px]:[&>*:nth-child(n+3)]:border-t-0",
      )}
    >
      {children}
    </Card>
  );
}

export function Metric({ label, value, extra, tile, tone }: { label: string; value: React.ReactNode; extra?: string; tile: React.ReactNode; tone?: "danger" }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-fg-2 [&_svg]:size-3.5",
          tone === "danger" && "text-danger-fg",
        )}
      >
        {tile}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-fg">{label}</span>
        <span className="num text-lg leading-[26px] font-semibold">
          {value} {extra && <span className="text-xs font-normal text-muted-fg">{extra}</span>}
        </span>
      </div>
    </div>
  );
}

/* Two-column row (2fr / 1fr, stacks below 1180px) ------------------------- */

export function Row21({ children }: { children: React.ReactNode }) {
  return <section className="grid grid-cols-1 gap-4 min-[1181px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">{children}</section>;
}

/* Grouped bar chart -------------------------------------------------------- */

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex gap-4 text-xs text-muted-fg">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px]" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function BarChart({
  data,
  max,
  ticks,
  seriesLabels,
  unit = "",
}: {
  data: DailyVolume[];
  max: number;
  ticks: string[];
  seriesLabels: [string, string];
  unit?: string;
}) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-2 gap-y-2 px-5 pt-1 pb-5">
      <div className="num -mt-[5px] flex h-[200px] flex-col justify-between text-right text-[11px] leading-none text-muted-fg">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="relative h-[200px] border-b border-border">
        {[0, 25, 50, 75].map((top) => (
          <div key={top} className="absolute inset-x-0 border-t border-dashed border-[#ECEEF2]" style={{ top: `${top}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end">
          {data.map((d) => (
            <div
              key={d.label}
              className="flex h-full flex-1 items-end justify-center gap-[3px]"
              title={`${d.label}: ${d.a.toLocaleString()}${unit} ${seriesLabels[0].toLowerCase()}, ${d.b.toLocaleString()}${unit} ${seriesLabels[1].toLowerCase()}`}
            >
              <div className="w-[9px] rounded-t-[3px] bg-primary" style={{ height: `${(d.a / max) * 100}%` }} />
              <div className="w-[9px] rounded-t-[3px] bg-primary-tint" style={{ height: `${(d.b / max) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div />
      <div className="flex text-[11px] text-muted-fg">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center whitespace-nowrap">
            {i % 2 === 0 ? (i === 0 || d.label.startsWith("Oct 1") ? d.label : d.label.replace(/^\w+ /, "")) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Stacked breakdown bar + legend rows ------------------------------------- */

export function Breakdown({
  segments,
  showPct = true,
}: {
  segments: { label: string; value: number; pct: number; color: string }[];
  showPct?: boolean;
}) {
  const aria = segments.map((s) => `${s.pct}% ${s.label.toLowerCase()}`).join(", ");
  return (
    <>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded" role="img" aria-label={aria}>
        {segments.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div className="flex flex-col gap-2.5 text-[13px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="size-2 rounded-[2px]" style={{ background: s.color }} />
            {s.label}
            <span className="num ml-auto font-medium">{s.value.toLocaleString("en-US")}</span>
            {showPct && <span className="num w-11 text-right text-xs text-muted-fg">{s.pct}%</span>}
          </div>
        ))}
      </div>
    </>
  );
}

/* SIM signal bars ---------------------------------------------------------- */

export function SignalBars({ level }: { level: number }) {
  return (
    <div className="flex h-3 items-end gap-0.5" aria-hidden="true">
      {[4, 6, 9, 12].map((h, i) => (
        <span
          key={h}
          className="w-[3px] rounded-[1px]"
          style={{ height: h, background: i < level ? (level <= 1 ? "var(--warning)" : "var(--fg)") : "var(--border-strong)" }}
        />
      ))}
    </div>
  );
}

/* 30-day uptime ticks ------------------------------------------------------ */

export function UptimeBar({ bad, warn, uptime }: { bad: number[]; warn: number[]; uptime: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-0.5" role="img" aria-label={`${uptime} uptime`}>
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="h-4 flex-1 rounded-[2px]"
            style={{ background: bad.includes(i) ? "var(--danger)" : warn.includes(i) ? "var(--accent)" : "var(--success)" }}
          />
        ))}
      </div>
      <span className="num w-[52px] text-right text-xs text-muted-fg">{uptime}</span>
    </div>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8F1FB] text-xs font-semibold text-primary-dark">{initials}</span>
  );
}
