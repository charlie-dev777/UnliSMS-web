import type { ApiEventName } from "@/lib/webhooks/config";

/**
 * A gateway's webhook as the portal renders it, mapped from
 * `GET /v1/gateways/{gateway_id}/webhook` (wire shape in `lib/onsim/webhook-schemas.ts`).
 * The signing secret itself is never available, only whether one is set.
 */
export interface GatewayWebhook {
  gatewayId: string;
  /**
   * True when a webhook URL is set. False when the gateway never had a webhook, or its
   * webhook was removed (the API keeps the row with `url: null` so versions keep counting).
   */
  configured: boolean;
  url: string | null;
  enabled: boolean;
  events: ApiEventName[];
  hasSigningSecret: boolean;
  /** 0 until the first save; every save from the portal or the app increments it. */
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}
