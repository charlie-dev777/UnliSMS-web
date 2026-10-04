import "server-only";
import { redirect } from "next/navigation";
import { SESSION_EXPIRED_PATH } from "@/lib/auth/constants";
import { apiBaseUrl } from "@/lib/auth/onsim";
import { getSession } from "@/lib/auth/session";
import type { ApiResult } from "@/lib/types";

const TIMEOUT_MS = 10_000;

/**
 * Authenticated GET against the OnSim API with the session's bearer token. Server-only:
 * the token is read from the sealed httpOnly cookie and never sent to the browser.
 *
 * - 401: the API session is expired or revoked, so the web session ends (redirect to
 *   `SESSION_EXPIRED_PATH`, which clears the cookie and opens /login).
 * - 403: the session is valid but the organization role can't read this resource
 *   (the API allows owner/admin only). The web session is kept.
 * - 404 → `not_found`. Network errors, timeouts, 5xx and malformed bodies → `unavailable`.
 */
export async function onsimGet<T>(path: string, isValid: (body: unknown) => body is T): Promise<ApiResult<T>> {
  const session = await getSession();
  if (!session) redirect("/login");

  let response: Response;
  try {
    response = await fetch(new URL(path, apiBaseUrl()), {
      headers: { Authorization: `Bearer ${session.token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[onsim] GET ${path} failed:`, error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "unavailable" };
  }

  // redirect() throws, so it stays outside the try block above.
  if (response.status === 401) redirect(SESSION_EXPIRED_PATH);
  if (response.status === 403) return { ok: false, reason: "forbidden" };
  if (response.status === 404) return { ok: false, reason: "not_found" };
  if (!response.ok) {
    console.error(`[onsim] GET ${path} returned HTTP ${response.status}`);
    return { ok: false, reason: "unavailable" };
  }

  const body: unknown = await response.json().catch(() => null);
  if (!isValid(body)) {
    console.error(`[onsim] GET ${path} returned an unexpected response shape`);
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true, data: body };
}
