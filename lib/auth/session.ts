import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findMockUserById } from "@/lib/mock-data";
import type { Role, User } from "@/lib/types";
import { HOME_BY_ROLE, MOCK_SESSION_COOKIE } from "./constants";

/** The signed-in (mock) user, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const id = (await cookies()).get(MOCK_SESSION_COOKIE)?.value;
  return id ? findMockUserById(id) : null;
}

/** The signed-in user with `role`; otherwise redirects to /login or their own portal. */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(HOME_BY_ROLE[user.role]);
  return user;
}
