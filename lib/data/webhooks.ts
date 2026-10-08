import "server-only";
import { cache } from "react";
import { onsimGet } from "@/lib/onsim/client";
import { isGatewayWebhookResponse, type GatewayWebhookResponse } from "@/lib/onsim/webhook-schemas";
import type { ApiResult, GatewayWebhook } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isGatewayId = (id: string) => UUID.test(id);

/** A gateway's webhook, always read fresh from the API. Non-UUIDs are `not_found` without a call. */
export const getGatewayWebhook = cache(async (gatewayId: string): Promise<ApiResult<GatewayWebhook>> => {
  if (!isGatewayId(gatewayId)) return { ok: false, reason: "not_found" };
  const result = await onsimGet(`v1/gateways/${encodeURIComponent(gatewayId)}/webhook`, isGatewayWebhookResponse);
  return result.ok ? { ok: true, data: toGatewayWebhook(result.data) } : result;
});

export function toGatewayWebhook(w: GatewayWebhookResponse): GatewayWebhook {
  return {
    gatewayId: w.gateway_id,
    configured: w.webhook_id !== null && w.url !== null,
    url: w.url,
    enabled: w.enabled,
    events: w.event_names,
    hasSigningSecret: w.has_signing_secret,
    version: w.configuration_version,
    createdAt: w.created_at,
    updatedAt: w.updated_at,
  };
}
