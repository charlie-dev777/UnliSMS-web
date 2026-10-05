"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isApiKeyId, toApiKey } from "@/lib/data/api-keys";
import { onsimMutate, type MutationResult } from "@/lib/onsim/client";
import { isApiKeySecretResponse, isNoContent, type ApiKeyCreateRequest, type ApiKeySecretResponse } from "@/lib/onsim/api-key-schemas";
import type { ApiKey } from "@/lib/types";
import { isOfferedScope, NAME_MAX, normalizeKeyName } from "./scopes";

/**
 * A newly issued key. `secret` is the plaintext key from the API's create/rotate response,
 * returned to the browser exactly once so it can be shown for copying. It is never logged,
 * cached or stored, and the API can't return it again.
 */
export type IssuedKey = { key: ApiKey; secret: string };

export type CreateKeyField = "name" | "scopes" | "form";
export type CreateKeyResult = { ok: true; issued: IssuedKey } | { ok: false; errors: Partial<Record<CreateKeyField, string>> };

/** Creates an API key with `POST /v1/api-keys`. */
export async function createApiKey(input: { name: string; scopes: string[] }): Promise<CreateKeyResult> {
  if (!(await getSession())) redirect("/login");

  const name = normalizeKeyName(typeof input?.name === "string" ? input.name : "");
  const scopes = Array.isArray(input?.scopes) ? [...new Set(input.scopes.filter((s) => typeof s === "string"))] : [];
  const errors: Partial<Record<CreateKeyField, string>> = {};
  if (!name) errors.name = "Enter a name for this key.";
  else if (name.length > NAME_MAX) errors.name = `Use ${NAME_MAX} characters or fewer.`;
  if (scopes.length === 0) errors.scopes = "Choose at least one permission.";
  else if (!scopes.every(isOfferedScope)) errors.scopes = "Choose from the listed permissions.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const body: ApiKeyCreateRequest = { name, scopes };
  const result = await mutate(() => onsimMutate("POST", "v1/api-keys", isApiKeySecretResponse, { body }));
  if (result.ok) return { ok: true, issued: issued(result.data) };

  switch (result.reason) {
    case "forbidden":
      return { ok: false, errors: { form: "Your role in this organization can’t create API keys. Ask an organization owner or admin." } };
    case "invalid":
      return { ok: false, errors: validationErrors(result.detail) };
    default:
      return { ok: false, errors: { form: "UnliSMS didn’t respond, so the key may not have been created. Check your keys list before trying again." } };
  }
}

export type KeyActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Replaces a key with `POST /v1/api-keys/{id}/rotate`: a new key with the same name and
 * scopes, while the old one is revoked in the same transaction.
 */
export async function rotateApiKey(id: string): Promise<KeyActionResult<IssuedKey>> {
  if (!(await getSession())) redirect("/login");
  if (!isApiKeyId(id)) return { ok: false, error: "This API key doesn’t exist." };

  const result = await mutate(() => onsimMutate("POST", `v1/api-keys/${encodeURIComponent(id)}/rotate`, isApiKeySecretResponse));
  if (result.ok) return { ok: true, data: issued(result.data) };
  switch (result.reason) {
    case "forbidden":
      return { ok: false, error: "Your role in this organization can’t manage API keys." };
    case "not_found":
      return { ok: false, error: "This API key doesn’t exist anymore." };
    case "conflict":
      return { ok: false, error: "This key was already revoked, so it can’t be rotated. Create a new key instead." };
    default:
      return { ok: false, error: "UnliSMS didn’t respond, so the key may not have been rotated. Check your keys list before trying again." };
  }
}

/** Revokes a key with `DELETE /v1/api-keys/{id}`. Applications using it fail from the next request. */
export async function revokeApiKey(id: string): Promise<KeyActionResult> {
  if (!(await getSession())) redirect("/login");
  if (!isApiKeyId(id)) return { ok: false, error: "This API key doesn’t exist." };

  const result = await mutate(() => onsimMutate("DELETE", `v1/api-keys/${encodeURIComponent(id)}`, isNoContent));
  if (result.ok) return { ok: true, data: undefined };
  switch (result.reason) {
    case "forbidden":
      return { ok: false, error: "Your role in this organization can’t manage API keys." };
    case "not_found":
      return { ok: false, error: "This API key doesn’t exist anymore." };
    default:
      return { ok: false, error: "UnliSMS didn’t respond, so the key may still be active. Try again." };
  }
}

function issued(data: ApiKeySecretResponse): IssuedKey {
  return { key: toApiKey(data), secret: data.api_key };
}

async function mutate<T>(call: () => Promise<MutationResult<T>>): Promise<MutationResult<T>> {
  try {
    return await call();
  } catch (error) {
    // redirect() (401 → expired session) must propagate.
    if (isConfigError(error)) return { ok: false, reason: "unavailable" };
    throw error;
  }
}

/** FastAPI 422 `detail: [{ loc: ["body", field, …], msg }]` → per-field copy. */
function validationErrors(detail: unknown): Partial<Record<CreateKeyField, string>> {
  const errors: Partial<Record<CreateKeyField, string>> = {};
  for (const issue of Array.isArray(detail) ? detail : []) {
    const loc: unknown[] = typeof issue === "object" && issue !== null && Array.isArray(issue.loc) ? issue.loc : [];
    if (loc[0] !== "body") continue;
    if (loc[1] === "name") errors.name = `Enter a name of 1–${NAME_MAX} characters.`;
    else if (loc[1] === "scopes") errors.scopes = "Choose from the listed permissions.";
  }
  return Object.keys(errors).length > 0 ? errors : { form: "Check the key details and try again." };
}

/** Missing `ONSIM_API_BASE_URL`; redirects and other framework errors are rethrown. */
function isConfigError(error: unknown) {
  return error instanceof Error && error.message === "ONSIM_API_BASE_URL is not set";
}
