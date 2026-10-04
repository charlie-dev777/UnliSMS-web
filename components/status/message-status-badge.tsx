import type { BadgeVariant } from "@/components/ui/badge";
import type { MessageStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";

const config: Record<MessageStatus, { tone: BadgeVariant; label: string }> = {
  delivered: { tone: "success", label: "Delivered" },
  sent: { tone: "neutral", label: "Sent" },
  pending: { tone: "warning", label: "Pending" },
  scheduled: { tone: "info", label: "Scheduled" },
  received: { tone: "info", label: "Received" },
  failed: { tone: "danger", label: "Failed" },
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  return <StatusBadge {...config[status]} dot />;
}
