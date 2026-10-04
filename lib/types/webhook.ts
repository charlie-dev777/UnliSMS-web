export type WebhookEventType =
  | "message.delivered"
  | "message.received"
  | "message.failed"
  | "call.answered"
  | "call.missed"
  | "gateway.online"
  | "gateway.offline";

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEventType[];
  enabled: boolean;
}

export type WebhookDeliveryState = "succeeded" | "retrying" | "failed";

/** One attempt to POST an event to a webhook endpoint. */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  url: string;
  /** HTTP status returned by the endpoint; null when it never answered. */
  responseStatus: number | null;
  state: WebhookDeliveryState;
  attemptedAt: string; // ISO 8601
}
