import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Organization, Role, User } from "@/lib/types";
import { HOME_BY_ROLE, SESSION_COOKIE } from "./constants";
import { unsealSession, type Session } from "./session-cookie";

/** The current session (token + identity), or null. Memoized per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  return unsealSession((await cookies()).get(SESSION_COOKIE)?.value);
});

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<User | null> {
  return (await getSession())?.user ?? null;
}

/** The signed-in user with `role`; otherwise redirects to /login or their own portal. */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(HOME_BY_ROLE[user.role]);
  return user;
}

export const requireUser = () => requireRole("USER");
export const requireAdmin = () => requireRole("ADMIN");

/**
 * The signed-in user's organization as returned at login (name and `plan_code`). The API has
 * no endpoint to re-read it, so it reflects the organization at sign-in time.
 */
export async function requireUserOrganization(): Promise<Organization> {
  await requireUser();
  const session = await getSession();
  if (!session) redirect("/login");
  return session.organization;
}
