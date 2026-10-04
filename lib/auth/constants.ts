import type { Role } from "@/lib/types";

/**
 * Preview-only session cookie holding a mock user id. This is NOT
 * authentication: it exists so the login screen can route USER and ADMIN
 * accounts during Phase 1. Replace with the real UnliSMS session.
 */
export const MOCK_SESSION_COOKIE = "unlisms_mock_session";

export const HOME_BY_ROLE: Record<Role, string> = {
  USER: "/dashboard",
  ADMIN: "/admin/dashboard",
};
