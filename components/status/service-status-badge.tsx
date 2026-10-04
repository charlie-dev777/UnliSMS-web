import type { BadgeVariant } from "@/components/ui/badge";
import type { ServiceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

const config: Record<ServiceStatus, { tone: BadgeVariant; label: string }> = {
  operational: { tone: "success", label: "Operational" },
  degraded: { tone: "warning", label: "Degraded" },
  outage: { tone: "danger", label: "Outage" },
};

export function ServiceStatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
  return <StatusBadge {...config[status]} dot className={cn(className)} />;
}
