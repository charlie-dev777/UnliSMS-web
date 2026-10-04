"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findMockUserByEmail } from "@/lib/mock-data";
import { HOME_BY_ROLE, MOCK_SESSION_COOKIE } from "./constants";

export type SignInState = {
  email: string;
  errors?: { email?: string; password?: string; form?: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mock sign-in: validates the form, looks up a preview account and routes by role. */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: SignInState["errors"] = {};
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  if (errors.email || errors.password) return { email, errors };

  const user = findMockUserByEmail(email);
  if (!user) return { email, errors: { form: "Email or password is incorrect." } };

  (await cookies()).set(MOCK_SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(HOME_BY_ROLE[user.role]);
}

export async function signOut() {
  (await cookies()).delete(MOCK_SESSION_COOKIE);
  redirect("/login");
}
