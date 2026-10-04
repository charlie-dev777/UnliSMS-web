import type { WebhookDeliveryState } from "@/lib/types";
import { StatusBadge } from "./status-badge";

/** HTTP code for finished deliveries, "Retrying" while the worker retries. */
export function WebhookStatusBadge({
  state,
  responseStatus = null,
}: {
  state: WebhookDeliveryState | "disabled";
  responseStatus?: number | null;
}) {
  switch (state) {
    case "succeeded":
      return <StatusBadge tone="success" label={String(responseStatus ?? "OK")} mono />;
    case "retrying":
      return <StatusBadge tone="warning" label="Retrying" />;
    case "failed":
      return responseStatus ? <StatusBadge tone="danger" label={String(responseStatus)} mono /> : <StatusBadge tone="danger" label="Failed" />;
    case "disabled":
      return <StatusBadge tone="neutral" label="Disabled" />;
  }
}
