"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isMessageId } from "@/lib/data/messages";
import { onsimMutate, type MutationResult } from "@/lib/onsim/client";
import { isMessageCreateResponse, type MessageCreateRequest, type MessageCreateResponse } from "@/lib/onsim/message-schemas";
import { checkSchedule, isSimValue, messageError, normalizePhone, phoneError } from "./compose";

export type ComposeMode = "now" | "schedule";

export type ComposeValues = {
  mode: ComposeMode;
  to: string;
  message: string;
  gateway: string; // public_gateway_id
  sim: string; // "sim1" | "sim2"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timeZone: string; // IANA, from the browser
};

export type ComposeField = Exclude<keyof ComposeValues, "mode">;

export type ComposeState = {
  values: ComposeValues;
  errors?: Partial<Record<ComposeField | "form", string>>;
};

const IDEMPOTENCY_KEY = /^[0-9a-f-]{36}$/i;

const read = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/**
 * Sends or schedules an SMS with `POST /v1/messages`. Re-validates everything the form
 * checked, then maps API failures to field or form errors. On success it opens the history
 * with the new message highlighted; its status there is whatever the API reports.
 *
 * The form's `idempotencyKey` is sent as `Idempotency-Key`, so resubmitting the same
 * message after a timeout returns the original instead of sending it twice.
 */
export async function sendMessage(_prev: ComposeState, formData: FormData): Promise<ComposeState> {
  if (!(await getSession())) redirect("/login");

  const values: ComposeValues = {
    mode: read(formData, "mode") === "schedule" ? "schedule" : "now",
    to: read(formData, "to"),
    message: read(formData, "message"),
    gateway: read(formData, "gateway"),
    sim: read(formData, "sim"),
    date: read(formData, "date"),
    time: read(formData, "time"),
    timeZone: read(formData, "timeZone"),
  };
  const idempotencyKey = read(formData, "idempotencyKey");

  const errors: NonNullable<ComposeState["errors"]> = {};
  const phone = phoneError(values.to);
  if (phone) errors.to = phone;
  const message = messageError(values.message);
  if (message) errors.message = message;
  if (!values.gateway || values.gateway.length > 128) errors.gateway = "Choose a gateway.";
  if (!isSimValue(values.sim)) errors.sim = "Choose SIM 1 or SIM 2.";

  let scheduledAt: MessageCreateRequest["scheduled_at"];
  if (values.mode === "schedule") {
    const schedule = checkSchedule(values.date, values.time, values.timeZone);
    if (schedule.ok) scheduledAt = { local_time: schedule.localTime, timezone: values.timeZone };
    else errors[schedule.field] = schedule.error;
  }
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) errors.form = "Reload the page and try again.";
  if (Object.keys(errors).length > 0) return { values, errors };

  const body: MessageCreateRequest = {
    gateway_id: values.gateway,
    to: normalizePhone(values.to),
    message: values.message,
    sim: values.sim as MessageCreateRequest["sim"],
    ...(scheduledAt && { scheduled_at: scheduledAt }),
  };

  let result: MutationResult<MessageCreateResponse>;
  try {
    result = await onsimMutate("POST", "v1/messages", isMessageCreateResponse, {
      body,
      headers: { "Idempotency-Key": idempotencyKey },
    });
  } catch (error) {
    // redirect() (401 → expired session) must propagate.
    if (isConfigError(error)) result = { ok: false, reason: "unavailable" };
    else throw error;
  }

  if (!result.ok) return { values, errors: sendErrors(result) };
  redirect(`/messages?submitted=${encodeURIComponent(result.data.msg_id)}`);
}

/** API failure → user-facing copy. The API's own `detail` text is never shown. */
function sendErrors(result: Extract<MutationResult<unknown>, { ok: false }>): NonNullable<ComposeState["errors"]> {
  const detail = typeof result.detail === "string" ? result.detail : "";
  switch (result.reason) {
    case "forbidden":
      return { form: "Your role in this organization can’t send messages. Ask an organization owner or admin." };
    case "not_found":
      // `create_outbound_message`: "gateway not found" or "sim{n} is unavailable".
      if (/^sim\d is unavailable$/.test(detail)) {
        return { sim: "This SIM isn’t active on the gateway. The phone may have reported a SIM change — choose another SIM or gateway." };
      }
      return { gateway: "This gateway isn’t available to your organization anymore. Choose another gateway." };
    case "conflict":
      if (detail === "scheduled_at must be in the future") return { time: "Choose a time in the future." };
      if (detail === "idempotency key was used with another request") {
        return { form: "A different message was already submitted from this form. Check your message history, then edit the message to send again." };
      }
      return { form: "UnliSMS couldn’t accept this message. Check the details and try again." };
    case "invalid":
      return validationErrors(result.detail);
    case "rate_limited":
      return { form: "Too many messages at once. Wait a moment and try again." };
    default:
      return {
        form: "UnliSMS didn’t respond, so this message may not have been sent. Check your message history, or select Send again — the same message won’t be sent twice.",
      };
  }
}

const FIELD_BY_LOC: Record<string, ComposeField> = {
  to: "to",
  message: "message",
  gateway_id: "gateway",
  sim: "sim",
  scheduled_at: "time",
};

const FIELD_COPY: Record<ComposeField, string> = {
  to: "Enter a number in international format, e.g. +63 917 555 0142.",
  message: "Enter a message of up to 1,600 characters.",
  gateway: "Choose a gateway.",
  sim: "Choose SIM 1 or SIM 2.",
  date: "Choose a valid date.",
  time: "Choose a valid time.",
  timeZone: "Your timezone isn’t supported for scheduling.",
};

/** FastAPI 422 `detail: [{ loc: ["body", field, …], msg }]` → per-field copy. */
function validationErrors(detail: unknown): NonNullable<ComposeState["errors"]> {
  const errors: NonNullable<ComposeState["errors"]> = {};
  for (const issue of Array.isArray(detail) ? detail : []) {
    const loc: unknown[] = typeof issue === "object" && issue !== null && Array.isArray(issue.loc) ? issue.loc : [];
    const msg = typeof issue?.msg === "string" ? issue.msg : "";
    const field = loc[0] === "body" && typeof loc[1] === "string" ? FIELD_BY_LOC[loc[1]] : undefined;
    if (!field) continue;
    // `MessageSchedule` errors all mention the timezone, so match the specific ones first.
    if (field === "time" && msg.includes("does not exist")) errors.time = "That time is skipped by a daylight-saving change. Choose another time.";
    else if (field === "time" && msg.includes("ambiguous")) errors.time = "That time happens twice because of a daylight-saving change. Choose another time.";
    else if (field === "time" && msg.includes("valid IANA timezone")) errors.timeZone = FIELD_COPY.timeZone;
    else errors[field] = FIELD_COPY[field];
  }
  return Object.keys(errors).length > 0 ? errors : { form: "Check the message details and try again." };
}

export type CancelResult = { ok: true } | { ok: false; error: string };

/** Cancels a scheduled SMS (`DELETE /v1/messages/{id}`); only possible before its time. */
export async function cancelScheduledMessage(id: string): Promise<CancelResult> {
  if (!(await getSession())) redirect("/login");
  if (!isMessageId(id)) return { ok: false, error: "This message doesn’t exist." };

  let result: MutationResult<MessageCreateResponse>;
  try {
    result = await onsimMutate("DELETE", `v1/messages/${encodeURIComponent(id)}`, isMessageCreateResponse);
  } catch (error) {
    if (isConfigError(error)) result = { ok: false, reason: "unavailable" };
    else throw error;
  }
  if (result.ok) return { ok: true };

  switch (result.reason) {
    case "forbidden":
      return { ok: false, error: "Your role in this organization can’t cancel messages." };
    case "not_found":
      return { ok: false, error: "This message doesn’t exist anymore." };
    case "conflict":
      return { ok: false, error: "This SMS can’t be cancelled anymore. It may already be sending." };
    default:
      return { ok: false, error: "UnliSMS didn’t respond. Check the message status and try again." };
  }
}

/** Missing `ONSIM_API_BASE_URL`; redirects and other framework errors are rethrown. */
function isConfigError(error: unknown) {
  return error instanceof Error && error.message === "ONSIM_API_BASE_URL is not set";
}
