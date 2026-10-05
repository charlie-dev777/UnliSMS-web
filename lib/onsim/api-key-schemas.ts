import "server-only";

/**
 * Wire shapes of the OnSim API-key management API, verified against the deployed OpenAPI
 * (`/openapi.json`) and onsim-api `app/schemas/api_keys.py` + `app/services/api_keys.py`.
 * Every route requires an owner/admin user session; member/viewer roles get 403.
 *
 * - `GET /v1/api-keys` → `ApiKeyListResponse`: every key of the organization, revoked ones
 *   included, newest first. Only metadata; the API stores a hash, never the key itself.
 * - `POST /v1/api-keys` → 201 `ApiKeySecretResponse`: metadata plus `api_key`, the plaintext
 *   key. This and rotate are the only responses that ever contain it.
 * - `POST /v1/api-keys/{id}/rotate` → `ApiKeySecretResponse` for a new key with the same
 *   name, environment, scopes and metadata; the old key is revoked in the same transaction.
 *   404 for an unknown key, 409 for one that's already revoked.
 * - `DELETE /v1/api-keys/{id}` → 204, no body. Idempotent: revoking a revoked key keeps its
 *   original `revoked_at`. 404 for an unknown key.
 */

export interface ApiKeyMetadata {
  id: string;
  name: string;
  /** The key's first 12 characters, kept in clear for lookup; the rest is hashed. */
  key_prefix: string;
  /** "live" or "test"; the API stores it but doesn't treat test keys differently. */
  environment: string;
  scopes: string[];
  metadata: Record<string, unknown>;
  last_used_at: string | null;
  /** The create API can't set this; it's only non-null for keys given an expiry elsewhere. */
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiKeySecretResponse extends ApiKeyMetadata {
  api_key: string;
}

export interface ApiKeyListResponse {
  api_keys: ApiKeyMetadata[];
}

/** `POST /v1/api-keys` body (`ApiKeyCreateRequest`; extra fields are rejected). */
export interface ApiKeyCreateRequest {
  /** 1–100 characters; the API collapses runs of whitespace. */
  name: string;
  environment?: "live" | "test";
  /** 1–20 free-form strings; defaults to ["sms:send"]. */
  scopes?: string[];
  metadata?: Record<string, unknown>;
}

// Structural checks: a response that doesn't match is treated as unavailable rather
// than rendered with missing data.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string";
const optStr = (v: unknown) => v === null || typeof v === "string";

function has(o: Obj, checks: Record<string, (v: unknown) => boolean>) {
  return Object.entries(checks).every(([key, check]) => key in o && check(o[key]));
}

function isMetadata(v: unknown): v is ApiKeyMetadata {
  return (
    isObj(v) &&
    has(v, {
      id: str,
      name: str,
      key_prefix: str,
      environment: str,
      scopes: (x) => Array.isArray(x) && x.every(str),
      metadata: isObj,
      last_used_at: optStr,
      expires_at: optStr,
      revoked_at: optStr,
      created_at: str,
    })
  );
}

export function isApiKeyListResponse(v: unknown): v is ApiKeyListResponse {
  return isObj(v) && Array.isArray(v.api_keys) && v.api_keys.every(isMetadata);
}

export function isApiKeySecretResponse(v: unknown): v is ApiKeySecretResponse {
  return isObj(v) && typeof v.api_key === "string" && v.api_key !== "" && isMetadata(v);
}

/** `DELETE` answers 204 with no body, which `onsimMutate` reads as null. */
export const isNoContent = (v: unknown): v is null => v === null;
