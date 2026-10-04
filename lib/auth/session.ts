import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@/lib/types";
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
