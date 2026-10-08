import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_EXPIRED_PATH } from "@/lib/auth/constants";
import { apiBaseUrl } from "@/lib/auth/onsim";
import { getSession } from "@/lib/auth/session";
import type { ApiResult } from "@/lib/types";

const TIMEOUT_MS = 10_000;

/**
 * Authenticated request against the OnSim API with the session's bearer token.
 * Server-only: the token is read from the sealed httpOnly cookie and never sent to the
 * browser. Returns null when the request didn't complete (network error or timeout).
 *
 * A 401 means the API session is expired or revoked, so the web session ends here. Server
 * Components can't delete cookies, so reads redirect to `SESSION_EXPIRED_PATH`, which
 * clears the cookie and opens /login. Writes run in Server Actions, which follow a
 * redirect on the server (a route handler's Set-Cookie would never reach the browser), so
 * they clear the cookie themselves.
 */
async function onsimFetch(
  method: string,
  path: string,
  init: { body?: unknown; headers?: Record<string, string> } = {},
  context: "render" | "action" = "render",
) {
  const session = await getSession();
  if (!session) redirect("/login");

  let response: Response;
  try {
    response = await fetch(new URL(path, apiBaseUrl()), {
      method,
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: "application/json",
        ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[onsim] ${method} ${path} failed:`, error instanceof Error ? error.name : "unknown");
    return null;
  }

  // redirect() throws, so it stays outside the try block above.
  if (response.status === 401) {
    if (context === "render") redirect(SESSION_EXPIRED_PATH);
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/login?expired=1");
  }
  return response;
}

/**
 * Authenticated GET.
 *
 * - 403: the session is valid but the organization role can't read this resource
 *   (the API allows owner/admin only). The web session is kept.
 * - 404 → `not_found`. Network errors, timeouts, 5xx and malformed bodies → `unavailable`.
 *
 * Pass `context: "action"` when calling from a Server Action, so a 401 clears the cookie there.
 */
export async function onsimGet<T>(
  path: string,
  isValid: (body: unknown) => body is T,
  context: "render" | "action" = "render",
): Promise<ApiResult<T>> {
  const response = await onsimFetch("GET", path, {}, context);
  if (!response) return { ok: false, reason: "unavailable" };
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

/**
 * Outcome of an authenticated OnSim write. `detail` is the API's error `detail` (a
 * string for service errors, a list of field issues for 422). It's for mapping to
 * user-facing copy on the server and must never be shown or sent to the browser as is.
 */
export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "forbidden" | "not_found" | "conflict" | "invalid" | "rate_limited" | "unavailable"; detail?: unknown };

const FAILURE_BY_STATUS: Record<number, Extract<MutationResult<never>, { ok: false }>["reason"]> = {
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "invalid",
  429: "rate_limited",
};

/** Authenticated POST/PUT/PATCH/DELETE, for Server Actions only. A 401 ends the web session. */
export async function onsimMutate<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  isValid: (body: unknown) => body is T,
  init: { body?: unknown; headers?: Record<string, string> } = {},
): Promise<MutationResult<T>> {
  const response = await onsimFetch(method, path, init, "action");
  if (!response) return { ok: false, reason: "unavailable" };

  const body: unknown = await response.json().catch(() => null);
  if (response.ok) {
    if (isValid(body)) return { ok: true, data: body };
    console.error(`[onsim] ${method} ${path} returned an unexpected response shape`);
    return { ok: false, reason: "unavailable" };
  }

  const reason = FAILURE_BY_STATUS[response.status] ?? "unavailable";
  if (reason === "unavailable") console.error(`[onsim] ${method} ${path} returned HTTP ${response.status}`);
  const detail = typeof body === "object" && body !== null && "detail" in body ? body.detail : undefined;
  return { ok: false, reason, detail };
}
