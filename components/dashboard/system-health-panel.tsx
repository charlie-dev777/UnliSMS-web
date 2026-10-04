import type { SystemHealth } from "@/lib/types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceStatusBadge } from "@/components/status";
import { UptimeBar } from "./uptime-bar";
import { ViewAllLink } from "./view-all-link";

/** Platform services with current status and daily uptime. */
export function SystemHealthPanel({ system }: { system: SystemHealth }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>System health</CardTitle>
          <CardDescription>Uptime, last {system.windowDays} days</CardDescription>
        </div>
        <CardAction>
          <ViewAllLink href="/admin/system">Details</ViewAllLink>
        </CardAction>
      </CardHeader>
      <ul className="m-0 list-none p-0">
        {system.services.map((svc) => (
          <li key={svc.id} className="flex flex-col gap-2 border-t border-border px-5 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium whitespace-nowrap">{svc.name}</span>
              <span className="min-w-0 truncate text-xs text-muted-foreground" title={svc.detail}>
                {svc.detail}
              </span>
              <ServiceStatusBadge status={svc.status} className="ml-auto shrink-0" />
            </div>
            <UptimeBar daily={svc.daily} uptimePct={svc.uptimePct} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
