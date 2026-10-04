import type { Role } from "@/lib/types";

/** httpOnly cookie holding the sealed session (see `session-cookie.ts`). */
export const SESSION_COOKIE = "unlisms_session";

/**
 * Route Handler that clears the session cookie and sends the user to /login. Server
 * Components can't delete cookies, so an API 401 redirects here; going straight to
 * /login would loop, because the proxy sends a still-unexpired cookie back to the portal.
 */
export const SESSION_EXPIRED_PATH = "/session/expired";

export const HOME_BY_ROLE: Record<Role, string> = {
  USER: "/dashboard",
  ADMIN: "/admin/dashboard",
};
