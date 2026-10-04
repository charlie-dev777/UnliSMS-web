import { BarChart3 } from "lucide-react";
import type { DailyVolume } from "@/lib/types";
import { formatCompact, formatNumber } from "@/lib/format";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/feedback";
import { ChartLegend } from "./chart-legend";

const GRID_LINES = [0, 25, 50, 75];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Rounds the axis up to 4 even steps of 1, 1.5, 2, 3, 4, 6 or 8 × 10ⁿ (e.g. 2,040 → 2.4k). */
function niceAxis(max: number, steps = 4) {
  const raw = Math.max(max, 1) / steps;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 3, 4, 6, 8, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  return { max: step * steps, ticks: Array.from({ length: steps + 1 }, (_, i) => step * (steps - i)) };
}

const parseDay = (date: string) => {
  const [, m, d] = date.split("-").map(Number);
  return { month: MONTHS[m - 1], day: d };
};

/** Every other day is labelled; the month is shown on the first label and when it changes. */
function axisLabels(data: DailyVolume[]) {
  let lastMonth = "";
  return data.map(({ date }, i) => {
    if (i % 2 !== 0) return "";
    const { month, day } = parseDay(date);
    const label = month === lastMonth ? String(day) : `${month} ${day}`;
    lastMonth = month;
    return label;
  });
}

/** Grouped daily bars, outbound vs inbound. */
export function MessageActivityChart({
  title = "Message activity",
  description,
  data,
  seriesLabels,
}: {
  title?: string;
  description: string;
  data: DailyVolume[];
  seriesLabels: [outbound: string, inbound: string];
}) {
  const [outLabel, inLabel] = seriesLabels;
  const peak = Math.max(0, ...data.map((d) => Math.max(d.outbound, d.inbound)));
  const axis = niceAxis(peak);
  const labels = axisLabels(data);
  const fullLabel = (date: string) => {
    const { month, day } = parseDay(date);
    return `${month} ${day}`;
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <CardAction>
          <ChartLegend
            items={[
              { label: outLabel, colorClass: "bg-brand" },
              { label: inLabel, colorClass: "bg-brand-tint" },
            ]}
          />
        </CardAction>
      </CardHeader>

      {peak === 0 ? (
        <EmptyState icon={BarChart3} title="No messages yet" description="Daily sent and received SMS will chart here once your gateways start sending." />
      ) : (
        <figure className="m-0 grid grid-cols-[32px_minmax(0,1fr)] gap-x-2 gap-y-2 px-5 pt-1 pb-5">
          <div aria-hidden className="num -mt-[5px] flex h-[200px] flex-col justify-between text-right text-[11px] leading-none text-muted-foreground">
            {axis.ticks.map((t) => (
              <span key={t}>{formatCompact(t)}</span>
            ))}
          </div>
          <div aria-hidden className="relative box-content h-[200px] border-b border-border">
            {GRID_LINES.map((top) => (
              <div key={top} className="absolute inset-x-0 border-t border-dashed border-gridline" style={{ top: `${top}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end">
              {data.map((d) => (
                <Tooltip key={d.date}>
                  <TooltipTrigger asChild>
                    <div className="flex h-full flex-1 items-end justify-center gap-[3px] px-px">
                      <div className="w-full max-w-[9px] rounded-t-[3px] bg-brand" style={{ height: `${(d.outbound / axis.max) * 100}%` }} />
                      <div className="w-full max-w-[9px] rounded-t-[3px] bg-brand-tint" style={{ height: `${(d.inbound / axis.max) * 100}%` }} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="num">
                    {fullLabel(d.date)}: {formatNumber(d.outbound)} {outLabel.toLowerCase()}, {formatNumber(d.inbound)} {inLabel.toLowerCase()}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div />
          <div aria-hidden className="flex text-[11px] text-muted-foreground">
            {labels.map((label, i) => (
              <span key={data[i].date} className="flex-1 text-center whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
          {/* Screen readers get the numbers as a table. */}
          <table className="sr-only">
            <caption>{description}</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">{outLabel}</th>
                <th scope="col">{inLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <th scope="row">{fullLabel(d.date)}</th>
                  <td>{formatNumber(d.outbound)}</td>
                  <td>{formatNumber(d.inbound)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </Card>
  );
}
