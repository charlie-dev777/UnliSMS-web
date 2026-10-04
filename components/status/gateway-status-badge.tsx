import type { GatewayHealthStatus, GatewayPresence } from "@/lib/types";
import { StatusBadge } from "./status-badge";

/** Liveness from the API's `presence`; never the device-reported connection status. */
export function GatewayStatusBadge({ status }: { status: GatewayPresence }) {
  if (status === "online") return <StatusBadge tone="success" label="Online" dot />;
  if (status === "offline") return <StatusBadge tone="neutral" label="Offline" dot dotClassName="bg-offline" />;
  return <StatusBadge tone="neutral" label="Unknown" />;
}

const HEALTH: Record<GatewayHealthStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  healthy: { tone: "success", label: "Healthy" },
  degraded: { tone: "warning", label: "Degraded" },
  unhealthy: { tone: "danger", label: "Unhealthy" },
  unknown: { tone: "neutral", label: "Unknown" },
};

/** The device's last reported health status. */
export function GatewayHealthBadge({ status }: { status: GatewayHealthStatus }) {
  const { tone, label } = HEALTH[status];
  return <StatusBadge tone={tone} label={label} />;
}
