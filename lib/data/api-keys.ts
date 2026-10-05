import "server-only";
import { cache } from "react";
import { onsimGet } from "@/lib/onsim/client";
import * as Api from "@/lib/onsim/api-key-schemas";
import type { ApiKey, ApiKeyStatus, ApiResult } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isApiKeyId = (id: string) => UUID.test(id);

/** The organization's API keys, revoked ones included, newest first. Memoized per request. */
export const listApiKeys = cache(async (): Promise<ApiResult<ApiKey[]>> => {
  const result = await onsimGet("v1/api-keys", Api.isApiKeyListResponse);
  if (!result.ok) return result;
  const now = Date.now();
  return { ok: true, data: result.data.api_keys.map((k) => toApiKey(k, now)) };
});

/** Metadata only: the plaintext `api_key` of a create/rotate response is never copied here. */
export function toApiKey(k: Api.ApiKeyMetadata, now = Date.now()): ApiKey {
  return {
    id: k.id,
    name: k.name,
    prefix: k.key_prefix,
    environment: k.environment,
    scopes: k.scopes,
    status: keyStatus(k, now),
    createdAt: k.created_at,
    lastUsedAt: k.last_used_at,
    expiresAt: k.expires_at,
    revokedAt: k.revoked_at,
  };
}

/** Mirrors the API's own check (`organization_auth`): revoked, or past `expires_at`. */
function keyStatus(k: Api.ApiKeyMetadata, now: number): ApiKeyStatus {
  if (k.revoked_at) return "revoked";
  if (k.expires_at && Date.parse(k.expires_at) <= now) return "expired";
  return "active";
}
