import "server-only";

/**
 * Client for the OnSim API authentication endpoints. Server-only: the base URL
 * and bearer tokens never reach the browser (the API sends no CORS headers, so
 * browser calls would fail anyway). Contract verified against onsim-api source:
 * `app/api/routes/auth.py` (`log_in`), `app/schemas/auth.py` (`LoginRequest` →
 * `SignupResponse`), `app/services/auth.py` (`login`).
 */

/** `SignupResponse`, returned by `POST /v1/auth/login`. */
export interface OnSimSessionResponse {
  access_token: string;
  token_type?: string;
  expires_at: string; // ISO 8601
  user: { id: string; email: string; username: string; display_name: string };
  organization: { id: string; name: string; plan_code: string };
}

export type LoginResult =
  | { ok: true; session: OnSimSessionResponse }
  | { ok: false; reason: "invalid_email"; suggestion?: string }
  | {
      ok: false;
      reason: "invalid_credentials" | "email_not_verified" | "forbidden" | "invalid_input" | "rate_limited" | "unavailable";
    };

const TIMEOUT_MS = 10_000;

export function apiBaseUrl(): string {
  const base = process.env.ONSIM_API_BASE_URL;
  if (!base) throw new Error("ONSIM_API_BASE_URL is not set");
  return base.endsWith("/") ? base : `${base}/`;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(new URL("v1/auth/login", apiBaseUrl()), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[auth] login request failed:", error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "unavailable" };
  }

  const body: unknown = await response.json().catch(() => null);
  switch (response.status) {
    case 200:
      if (isSessionResponse(body)) return { ok: true, session: body };
      console.error("[auth] login returned an unexpected response shape");
      return { ok: false, reason: "unavailable" };
    // Unknown email, wrong password, and suspended/deleted users or organizations
    // all return the same 401; the API doesn't disclose which.
    case 401:
      return { ok: false, reason: "invalid_credentials" };
    // The API's only login 403 is `{ detail, code: "email_not_verified" }`.
    case 403:
      return { ok: false, reason: errorCode(body) === "email_not_verified" ? "email_not_verified" : "forbidden" };
    // FastAPI validation error. The email validator also rejects disposable and
    // reserved domains (example.com, *.test, …) and suggests fixes for typos.
    case 422:
      return emailValidationError(body) ?? { ok: false, reason: "invalid_input" };
    // onsim-api doesn't rate-limit login; this covers an edge proxy in front of it.
    case 429:
      return { ok: false, reason: "rate_limited" };
    default:
      console.error(`[auth] login returned HTTP ${response.status}`);
      return { ok: false, reason: "unavailable" };
  }
}

function errorCode(body: unknown): string | null {
  return isObject(body) && typeof body.code === "string" ? body.code : null;
}

/** A 422 whose error is on `body.email`, with the API's "Did you mean …?" suggestion if any. */
function emailValidationError(body: unknown): LoginResult | null {
  const details = isObject(body) && Array.isArray(body.detail) ? body.detail : [];
  const issue = details.find((d) => isObject(d) && Array.isArray(d.loc) && d.loc.at(-1) === "email");
  if (!isObject(issue)) return null;
  const suggestion = typeof issue.msg === "string" ? /Did you mean ([^\s?]+)\?/.exec(issue.msg)?.[1] : undefined;
  return { ok: false, reason: "invalid_email", suggestion };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const strings = (value: unknown, keys: string[]) => isObject(value) && keys.every((k) => typeof value[k] === "string");

function isSessionResponse(body: unknown): body is OnSimSessionResponse {
  return (
    strings(body, ["access_token", "expires_at"]) &&
    isObject(body) &&
    strings(body.user, ["id", "email", "username", "display_name"]) &&
    strings(body.organization, ["id", "name", "plan_code"])
  );
}
