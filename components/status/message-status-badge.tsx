import type { BadgeVariant } from "@/components/ui/badge";
import type { MessageStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";

/**
 * One label per API message state. Labels are presentation only; the state names are the
 * API's. Only "delivered" is shown as success: "sent" means the carrier accepted the SMS
 * but hasn't reported delivery.
 */
export const MESSAGE_STATUS: Record<MessageStatus, { tone: BadgeVariant; label: string; description: string }> = {
  scheduled: { tone: "info", label: "Scheduled", description: "Waiting for its scheduled time." },
  queued: { tone: "warning", label: "Queued", description: "Accepted. Waiting for the gateway to pick it up." },
  claimed: { tone: "warning", label: "Picked up", description: "The gateway has picked it up and is about to send it." },
  sending: { tone: "warning", label: "Sending", description: "The gateway is sending it." },
  retry_waiting: { tone: "warning", label: "Retrying", description: "A send attempt failed. The gateway will try again." },
  sent: { tone: "neutral", label: "Sent", description: "Sent by the gateway. Delivery hasn’t been confirmed." },
  delivered: { tone: "success", label: "Delivered", description: "The carrier reported delivery." },
  failed: { tone: "danger", label: "Failed", description: "The gateway couldn’t send it." },
  expired: { tone: "danger", label: "Expired", description: "It wasn’t sent before it expired." },
  blocked: { tone: "danger", label: "Blocked", description: "It was blocked and won’t be sent." },
  cancelled: { tone: "neutral", label: "Cancelled", description: "Cancelled before its scheduled time." },
  unknown: { tone: "neutral", label: "Unknown", description: "UnliSMS reported a status this page doesn’t recognize." },
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const { tone, label, description } = MESSAGE_STATUS[status];
  return (
    <span title={description} className="inline-flex">
      <StatusBadge tone={tone} label={label} dot />
    </span>
  );
}
