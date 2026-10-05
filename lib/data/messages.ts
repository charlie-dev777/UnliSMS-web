import "server-only";
import { cache } from "react";
import { onsimGet } from "@/lib/onsim/client";
import * as Api from "@/lib/onsim/message-schemas";
import type { ApiResult, MessageDetail, MessageFilter, MessageStatus, MessageStatusDetail, OutboundMessage } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isMessageId = (id: string) => UUID.test(id);

/**
 * The organization's 100 most recent outbound SMS (the API's fixed limit; it has no
 * pagination), latest scheduled or created first. Memoized per request.
 */
export const listMessages = cache(async (filter: MessageFilter = "all"): Promise<ApiResult<OutboundMessage[]>> => {
  const path = filter === "all" ? "v1/messages" : `v1/messages?state=${filter}`;
  const result = await onsimGet(path, Api.isMessageListResponse);
  return result.ok ? { ok: true, data: result.data.messages.map(toMessage) } : result;
});

/** A message's current status. Non-UUIDs are `not_found` without an API call. */
export const getMessageStatus = cache(async (id: string): Promise<ApiResult<MessageStatusDetail>> => {
  if (!isMessageId(id)) return { ok: false, reason: "not_found" };
  const result = await onsimGet(`v1/messages/${encodeURIComponent(id)}`, Api.isMessageQueryResponse);
  return result.ok ? { ok: true, data: toStatusDetail(result.data) } : result;
});

/**
 * Status from the detail endpoint plus recipient, body, SIM and schedule from the history
 * list, since the detail endpoint doesn't return them. `message` is null when the message
 * is older than the 100 the list returns (or was removed from history in the app).
 */
export async function getMessage(id: string): Promise<ApiResult<MessageDetail>> {
  const [status, list] = await Promise.all([getMessageStatus(id), isMessageId(id) ? listMessages() : null]);
  if (!status.ok) return status;
  const message = list?.ok ? (list.data.find((m) => m.id === status.data.id) ?? null) : null;
  return { ok: true, data: { status: status.data, message } };
}

const KNOWN_STATES: readonly string[] = Api.MESSAGE_STATES;
const toStatus = (state: string): MessageStatus => (KNOWN_STATES.includes(state) ? (state as MessageStatus) : "unknown");

function toMessage(m: Api.MessageListItem): OutboundMessage {
  return {
    id: m.msg_id,
    status: toStatus(m.state),
    to: m.to,
    body: m.message,
    simSlot: m.sim === "sim1" ? 1 : 2,
    schedule: m.scheduled_at && { localTime: m.scheduled_at.local_time, timeZone: m.scheduled_at.timezone },
    recurrence: m.recurrence && {
      frequency: m.recurrence.frequency,
      interval: m.recurrence.interval,
      daysOfWeek: m.recurrence.days_of_week,
      until: m.recurrence.until,
      count: m.recurrence.count,
    },
    queuedAt: m.queued_at,
    sentAt: m.sent_at,
    createdAt: m.created_at,
  };
}

function toStatusDetail(m: Api.MessageQueryResponse): MessageStatusDetail {
  return {
    id: m.msg_id,
    status: m.state,
    queuedAt: m.queued_at,
    sentAt: m.sent_at,
    deliveredAt: m.delivered_at,
    failedAt: m.failed_at,
    updatedAt: m.updated_at,
    attemptCount: m.attempt_count,
    errorClassification: m.error_classification,
  };
}
