/**
 * Outbound SMS as the portal renders them, mapped from the OnSim message API
 * (`GET /v1/messages`, `GET /v1/messages/{id}`; wire shapes in `lib/onsim/message-schemas.ts`).
 * Every field comes from the API; null means the API has no value yet.
 */

/**
 * The API's message states, verbatim. "unknown" is the portal's own value for a state
 * string the API returns that this build doesn't recognize.
 */
export type MessageStatus =
  | "scheduled" // waiting for its scheduled time
  | "queued" // accepted; waiting for the gateway to pick it up
  | "claimed" // the gateway has picked it up
  | "sending" // the gateway is sending it
  | "retry_waiting" // a send attempt failed; the gateway will retry
  | "sent" // the carrier accepted it; no delivery report yet
  | "delivered" // the carrier reported delivery
  | "failed"
  | "expired" // not sent before it expired
  | "blocked"
  | "cancelled" // a scheduled SMS cancelled before its time
  | "unknown";

/** `failed_at`'s companion: why a send failed, in the API's public categories. */
export type MessageErrorClassification =
  | "TRANSIENT_NETWORK"
  | "TRANSIENT_MODEM"
  | "BLOCKED_CONFIGURATION"
  | "PERMANENT"
  | "UNKNOWN_SEND_OUTCOME"
  | "UNKNOWN";

/** The wall-clock time a scheduled SMS was set for, in the timezone it was set in. */
export interface MessageSchedule {
  localTime: string; // naive ISO 8601, e.g. "2026-10-06T09:00:00"
  timeZone: string; // IANA, e.g. "Asia/Manila"
}

/** Repeat rule of a recurring scheduled SMS (created from the Android app). */
export interface MessageRecurrence {
  frequency: "daily" | "weekly";
  interval: number;
  daysOfWeek: string[]; // "mon"…"sun"; empty = the first send's weekday
  until: string | null; // inclusive local date
  count: number | null; // total sends
}

/** One row of the message history (`GET /v1/messages`). */
export interface OutboundMessage {
  id: string;
  status: MessageStatus;
  to: string; // E.164
  body: string;
  simSlot: 1 | 2;
  schedule: MessageSchedule | null;
  recurrence: MessageRecurrence | null;
  queuedAt: string | null; // ISO 8601
  sentAt: string | null;
  createdAt: string;
}

/** A message's current status and timestamps (`GET /v1/messages/{id}`). */
export interface MessageStatusDetail {
  id: string;
  status: MessageStatus;
  queuedAt: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  updatedAt: string;
  attemptCount: number;
  errorClassification: MessageErrorClassification | null;
}

/** `/messages/[id]`: the status read, plus the history row when it's among the recent 100. */
export interface MessageDetail {
  status: MessageStatusDetail;
  message: OutboundMessage | null;
}

/** History filters the API supports (`?state=`); "sent" includes delivered messages. */
export type MessageFilter = "all" | "scheduled" | "sent";
