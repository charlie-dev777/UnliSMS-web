import "server-only";
import { isApiEventName, type ApiEventName, type WebhookEventName } from "@/lib/webhooks/config";

/**
 * Wire shapes of the OnSim gateway webhook API for organization owners/admins, verified
 * against the deployed OpenAPI (`/openapi.json`) and onsim-api `app/schemas/webhooks.py`,
 * `app/services/webhook_config.py` and `app/api/routes/webhooks.py`.
 *
 * - `GET /v1/gateways/{gateway_id}/webhook` → `OrganizationGatewayWebhookResponse`. The
 *   gateway's internal UUID. A gateway with no webhook returns `webhook_id: null`,
 *   `configuration_version: 0` and null timestamps.
 * - `PUT /v1/gateways/{gateway_id}/webhook` → the saved configuration. `url: null` removes
 *   the webhook: the row is disabled and its URL cleared (signing secret kept), or nothing is
 *   created when there's none. Every save increments `configuration_version`.
 * - 404 for a gateway that isn't an allocated gateway of the organization. 422 for invalid
 *   fields, including a URL that isn't HTTPS, has credentials, doesn't resolve, or resolves
 *   to a non-public address (`detail: [{ loc: ["body", "url"], msg }]`).
 *
 * The same row is what the Android app reads and writes with its device credential
 * (`/v1/gateways/webhook`). The signing secret is never returned, only `has_signing_secret`.
 */

export interface GatewayWebhookResponse {
  webhook_id: string | null;
  gateway_id: string;
  url: string | null;
  enabled: boolean;
  /** Any of the API's events; the portal itself only ever sends `WebhookEventName`s. */
  event_names: ApiEventName[];
  has_signing_secret: boolean;
  configuration_version: number;
  created_at: string | null;
  updated_at: string | null;
}

/** `PUT` body (`OrganizationGatewayWebhookUpdate`; extra fields are rejected). */
export interface GatewayWebhookUpdate {
  url: string | null;
  enabled: boolean;
  /** 1–3 unique event names from the portal's list (the API accepts up to 8). */
  event_names: WebhookEventName[];
  /** 16–512 characters; omitted to keep the current secret. */
  signing_secret?: string;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const optStr = (v: unknown) => v === null || typeof v === "string";

export function isGatewayWebhookResponse(v: unknown): v is GatewayWebhookResponse {
  return (
    isObj(v) &&
    optStr(v.webhook_id) &&
    typeof v.gateway_id === "string" &&
    optStr(v.url) &&
    typeof v.enabled === "boolean" &&
    Array.isArray(v.event_names) &&
    v.event_names.every(isApiEventName) &&
    typeof v.has_signing_secret === "boolean" &&
    typeof v.configuration_version === "number" &&
    optStr(v.created_at) &&
    optStr(v.updated_at)
  );
}
