/**
 * Organization API keys as the portal renders them, mapped from the OnSim API-key API
 * (`GET /v1/api-keys`; wire shapes in `lib/onsim/api-key-schemas.ts`). Never includes the
 * key itself: the API only returns it once, from create or rotate.
 */

/** Derived from `revoked_at` and `expires_at`; the API has no status field. */
export type ApiKeyStatus = "active" | "expired" | "revoked";

export interface ApiKey {
  id: string;
  name: string;
  /** First 12 characters of the key, for recognizing it. */
  prefix: string;
  environment: string;
  scopes: string[];
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}
