import type { GatewayStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";

export type GatewayBadgeStatus = GatewayStatus | "weak_signal";

export function GatewayStatusBadge({ status }: { status: GatewayBadgeStatus }) {
  if (status === "online") return <StatusBadge tone="success" label="Online" dot />;
  if (status === "weak_signal") return <StatusBadge tone="warning" label="Weak signal" dot />;
  return <StatusBadge tone="neutral" label="Offline" dot dotClassName="bg-offline" />;
}
