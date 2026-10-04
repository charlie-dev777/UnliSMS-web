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
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium">{svc.name}</span>
              <span className="truncate text-xs text-muted-foreground">{svc.detail}</span>
              <ServiceStatusBadge status={svc.status} className="ml-auto" />
            </div>
            <UptimeBar daily={svc.daily} uptimePct={svc.uptimePct} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
