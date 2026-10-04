import type { Role } from "@/lib/types";

/** httpOnly cookie holding the sealed session (see `session-cookie.ts`). */
export const SESSION_COOKIE = "unlisms_session";

export const HOME_BY_ROLE: Record<Role, string> = {
  USER: "/dashboard",
  ADMIN: "/admin/dashboard",
};
