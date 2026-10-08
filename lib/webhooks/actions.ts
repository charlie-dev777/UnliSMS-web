"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isGatewayId } from "@/lib/data/webhooks";
import { onsimGet, onsimMutate, type MutationResult } from "@/lib/onsim/client";
import { isGatewayWebhookResponse, type GatewayWebhookResponse, type GatewayWebhookUpdate } from "@/lib/onsim/webhook-schemas";
import type { ApiResult } from "@/lib/types";
import { isWebhookEventName, PRIVATE_COPY, SECRET_MAX, SECRET_MIN, signingSecretError, webhookUrlError } from "./config";

export type WebhookField = "url" | "events" | "signingSecret" | "form";

export type SaveWebhookInput = {
  gatewayId: string;
  /** `configuration_version` the form was loaded with, to catch changes made meanwhile. */
  loadedVersion: number;
  url: string;
  enabled: boolean;
  events: string[];
  /** Replacement secret, or "" to keep the current one. Never logged or returned. */
  signingSecret: string;
};

export type SaveWebhookResult = {
  errors: Partial<Record<WebhookField, string>>;
  /** Set when the webhook changed since the form loaded (the app or another tab saved). */
  staleVersion?: number;
};

/**
 * Saves a gateway's webhook with `PUT /v1/gateways/{gateway_id}/webhook`, the same row the
 * Android app syncs. Re-checks the form's rules, refuses to overwrite a configuration that
 * changed since the form loaded, and on success reloads the page so it shows what the API
 * stored. Only returns on failure; the response never contains the signing secret.
 */
export async function saveGatewayWebhook(input: SaveWebhookInput): Promise<SaveWebhookResult> {
  if (!(await getSession())) redirect("/login");

  const gatewayId = typeof input?.gatewayId === "string" ? input.gatewayId : "";
  if (!isGatewayId(gatewayId)) return { errors: { form: "This gateway isn’t available. Choose another gateway." } };
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const events = Array.isArray(input.events) ? [...new Set(input.events)] : [];
  const removing = url === "";
  const secret = typeof input.signingSecret === "string" ? input.signingSecret : "";

  const errors: SaveWebhookResult["errors"] = {};
  if (events.length === 0) errors.events = "Choose at least one event.";
  // Only the three events the Android app uses, even though the API accepts more.
  else if (!events.every(isWebhookEventName)) errors.events = "Choose from the listed events.";
  const secretError = signingSecretError(secret);
  if (secretError) errors.signingSecret = secretError;
  const urlError = url ? webhookUrlError(url) : null;
  if (urlError) errors.url = urlError;

  // The API's current configuration decides two things: whether an empty URL can mean
  // "remove" (only when a webhook URL is set), and whether someone saved in the meantime.
  const current = await read(() => onsimGet(`v1/gateways/${gatewayId}/webhook`, isGatewayWebhookResponse, "action"));
  if (!current.ok) return { errors: { ...errors, form: failureCopy(current.reason) } };
  const configured = current.data.webhook_id !== null && current.data.url !== null;
  if (removing && !configured) errors.url = "Enter your webhook URL.";
  if (Object.keys(errors).length > 0) return { errors };
  if (current.data.configuration_version !== input.loadedVersion) {
    return {
      errors: { form: "This webhook was changed after you opened it, possibly from the gateway app. Load the latest settings, then make your changes again." },
      staleVersion: current.data.configuration_version,
    };
  }

  const body: GatewayWebhookUpdate = {
    // No URL removes the webhook: the API disables it and clears the stored URL.
    url: removing ? null : url,
    enabled: removing ? false : input.enabled === true,
    event_names: events as GatewayWebhookUpdate["event_names"],
    ...(secret && { signing_secret: secret }),
  };
  const result = await mutate(() =>
    onsimMutate("PUT", `v1/gateways/${gatewayId}/webhook`, isGatewayWebhookResponse, { body }),
  );
  if (!result.ok) return { errors: saveErrors(result) };
  redirect(`/webhooks?gateway=${gatewayId}&saved=${result.data.configuration_version}`);
}

function failureCopy(reason: "forbidden" | "not_found" | "unavailable" | string) {
  switch (reason) {
    case "forbidden":
      return "Your role in this organization can’t manage webhooks. Ask an organization owner or admin.";
    case "not_found":
      return "This gateway isn’t available to your organization anymore. Choose another gateway.";
    default:
      return "UnliSMS didn’t respond, so nothing was saved. Try again in a moment.";
  }
}

function saveErrors(result: Extract<MutationResult<GatewayWebhookResponse>, { ok: false }>): SaveWebhookResult["errors"] {
  switch (result.reason) {
    case "forbidden":
    case "not_found":
      return { form: failureCopy(result.reason) };
    case "invalid":
      return validationErrors(result.detail);
    default:
      return {
        form: "UnliSMS didn’t respond, so your changes may not have been saved. Reload the page to see the current settings before trying again.",
      };
  }
}

/** FastAPI 422 `detail: [{ loc: ["body", field, …], msg }]` → per-field copy. */
function validationErrors(detail: unknown): SaveWebhookResult["errors"] {
  const errors: SaveWebhookResult["errors"] = {};
  for (const issue of Array.isArray(detail) ? detail : []) {
    const loc: unknown[] = typeof issue === "object" && issue !== null && Array.isArray(issue.loc) ? issue.loc : [];
    const msg = typeof issue?.msg === "string" ? issue.msg : "";
    if (loc[0] !== "body") continue;
    if (loc[1] === "url") errors.url = urlCopy(msg);
    else if (loc[1] === "event_names") errors.events = "Choose at least one event, each only once.";
    else if (loc[1] === "signing_secret") errors.signingSecret = `Use ${SECRET_MIN} to ${SECRET_MAX} characters.`;
  }
  return Object.keys(errors).length > 0 ? errors : { form: "Check the webhook details and try again." };
}

/** Messages from `validate_webhook_destination` and pydantic's `HttpUrl`. */
function urlCopy(msg: string) {
  if (msg.includes("HTTPS URL without embedded credentials")) return "Use an https:// URL without a username or password.";
  if (msg.includes("non-public address")) return PRIVATE_COPY;
  if (msg.includes("did not resolve")) return "This domain couldn’t be found. Check the URL and try again.";
  if (msg.includes("at most")) return "This URL is too long.";
  return "Enter a full URL, like https://example.com/webhooks/unlisms.";
}

async function read<T>(call: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  try {
    return await call();
  } catch (error) {
    if (isConfigError(error)) return { ok: false, reason: "unavailable" };
    throw error; // redirect() (401 → expired session) must propagate
  }
}

async function mutate<T>(call: () => Promise<MutationResult<T>>): Promise<MutationResult<T>> {
  try {
    return await call();
  } catch (error) {
    if (isConfigError(error)) return { ok: false, reason: "unavailable" };
    throw error;
  }
}

/** Missing `ONSIM_API_BASE_URL`; redirects and other framework errors are rethrown. */
function isConfigError(error: unknown) {
  return error instanceof Error && error.message === "ONSIM_API_BASE_URL is not set";
}
