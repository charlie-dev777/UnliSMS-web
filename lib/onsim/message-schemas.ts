import "server-only";

/**
 * Wire shapes of the OnSim message API, verified against the deployed OpenAPI
 * (`/openapi.json`) and onsim-api `app/schemas/messages.py` + `app/services/messaging.py`.
 *
 * - `GET /v1/messages[?state=sent|scheduled]` → `MessageListResponse`: the organization's
 *   100 most recent outbound messages, ordered by `COALESCE(scheduled_at, created_at)`
 *   descending. No pagination. Rows don't include the gateway, `delivered_at` or `failed_at`.
 * - `GET /v1/messages/{msg_id}` → `MessageQueryResponse`: status and timestamps only (no
 *   recipient, body, SIM or gateway).
 * - `POST /v1/messages` → 202 `MessageCreateResponse` (`state` is "queued" or "scheduled").
 * - `DELETE /v1/messages/{msg_id}` → `MessageCreateResponse` (`state` "cancelled").
 *
 * Optional fields are always present in responses (FastAPI serializes `None` as null).
 */

/** Every state `sms_messages.state` can hold for an outbound message (`MessageQueryResponse.state`). */
export const MESSAGE_STATES = [
  "queued",
  "claimed",
  "sending",
  "retry_waiting",
  "sent",
  "delivered",
  "failed",
  "expired",
  "blocked",
  "scheduled",
  "cancelled",
] as const;
export type MessageState = (typeof MESSAGE_STATES)[number];

export const ERROR_CLASSIFICATIONS = [
  "TRANSIENT_NETWORK",
  "TRANSIENT_MODEM",
  "BLOCKED_CONFIGURATION",
  "PERMANENT",
  "UNKNOWN_SEND_OUTCOME",
  "UNKNOWN",
] as const;
export type ErrorClassification = (typeof ERROR_CLASSIFICATIONS)[number];

export interface MessageSchedule {
  /** Naive wall-clock time, e.g. "2026-10-06T09:00:00". */
  local_time: string;
  /** IANA timezone the wall time is in. */
  timezone: string;
}

export interface MessageRecurrence {
  frequency: "daily" | "weekly";
  interval: number;
  days_of_week: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  until: string | null; // inclusive local date, YYYY-MM-DD
  count: number | null; // total number of sends
}

export interface MessageListItem {
  msg_id: string;
  /** Typed as a plain string by the API; expected to be one of `MESSAGE_STATES`. */
  state: string;
  to: string; // E.164
  /** Decrypted body, or "Message content unavailable" if the API couldn't decrypt it. */
  message: string;
  sim: "sim1" | "sim2";
  scheduled_at: MessageSchedule | null;
  recurrence: MessageRecurrence | null;
  queued_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface MessageListResponse {
  messages: MessageListItem[];
}

export interface MessageQueryResponse {
  msg_id: string;
  state: MessageState;
  queued_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  updated_at: string;
  attempt_count: number;
  error_classification: ErrorClassification | null;
}

export interface MessageCreateResponse {
  msg_id: string;
  state: string;
}

/** `POST /v1/messages` body (`MessageCreateRequest`; extra fields are rejected). */
export interface MessageCreateRequest {
  /** The gateway's `public_gateway_id`, not its internal UUID. */
  gateway_id: string;
  to: string;
  message: string;
  sim: "sim1" | "sim2";
  scheduled_at?: MessageSchedule;
}

// Structural checks: a response that doesn't match is treated as unavailable rather
// than rendered with missing data.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string";
const optStr = (v: unknown) => v === null || typeof v === "string";
const oneOf = (values: readonly string[]) => (v: unknown) => typeof v === "string" && values.includes(v);

function has(o: Obj, checks: Record<string, (v: unknown) => boolean>) {
  return Object.entries(checks).every(([key, check]) => key in o && check(o[key]));
}

function isSchedule(v: unknown): v is MessageSchedule {
  return isObj(v) && has(v, { local_time: str, timezone: str });
}

function isRecurrence(v: unknown): v is MessageRecurrence {
  return (
    isObj(v) &&
    has(v, {
      frequency: oneOf(["daily", "weekly"]),
      interval: (x) => typeof x === "number",
      days_of_week: (x) => Array.isArray(x) && x.every(str),
      until: optStr,
      count: (x) => x === null || typeof x === "number",
    })
  );
}

function isListItem(v: unknown): v is MessageListItem {
  return (
    isObj(v) &&
    has(v, {
      msg_id: str,
      state: str,
      to: str,
      message: str,
      sim: oneOf(["sim1", "sim2"]),
      scheduled_at: (x) => x === null || isSchedule(x),
      recurrence: (x) => x === null || isRecurrence(x),
      queued_at: optStr,
      sent_at: optStr,
      created_at: str,
    })
  );
}

export function isMessageListResponse(v: unknown): v is MessageListResponse {
  return isObj(v) && Array.isArray(v.messages) && v.messages.every(isListItem);
}

export function isMessageQueryResponse(v: unknown): v is MessageQueryResponse {
  return (
    isObj(v) &&
    has(v, {
      msg_id: str,
      state: oneOf(MESSAGE_STATES),
      queued_at: optStr,
      sent_at: optStr,
      delivered_at: optStr,
      failed_at: optStr,
      updated_at: str,
      attempt_count: (x) => typeof x === "number",
      error_classification: (x) => x === null || oneOf(ERROR_CLASSIFICATIONS)(x),
    })
  );
}

export function isMessageCreateResponse(v: unknown): v is MessageCreateResponse {
  return isObj(v) && has(v, { msg_id: str, state: str });
}
