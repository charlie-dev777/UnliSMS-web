"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HOME_BY_ROLE, SESSION_COOKIE } from "./constants";
import { login, type LoginResult } from "./onsim";
import { sealSession, secondsUntilExpiry, sessionFromLogin } from "./session-cookie";

export type SignInState = {
  email: string;
  errors?: { email?: string; password?: string; form?: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User-facing copy per failure; backend details are never shown.
const FAILURE_MESSAGES: Record<Exclude<Extract<LoginResult, { ok: false }>["reason"], "invalid_email">, string> = {
  invalid_credentials: "Email or password is incorrect.",
  email_not_verified: "Verify your email address before signing in. Check your inbox for the verification code.",
  forbidden: "This account can’t sign in right now. Contact support if this continues.",
  invalid_input: "Check your email and password and try again.",
  rate_limited: "Too many sign-in attempts. Wait a moment and try again.",
  unavailable: "We couldn’t sign you in right now. Please try again shortly.",
};

/** Validates the form, signs in against the OnSim API and routes by role. */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Mirrors the API's LoginRequest limits (email 3–254, password 1–128).
  const errors: SignInState["errors"] = {};
  if (!EMAIL.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (password.length > 128) errors.password = "Password must be 128 characters or fewer.";
  if (errors.email || errors.password) return { email, errors };

  let result: LoginResult;
  try {
    result = await login(email, password);
  } catch (error) {
    // Configuration errors (missing env vars); never includes request data.
    console.error("[auth] sign-in failed:", error instanceof Error ? error.message : "unknown");
    result = { ok: false, reason: "unavailable" };
  }
  if (!result.ok) {
    if (result.reason === "invalid_email") {
      const message = result.suggestion ? `Did you mean ${result.suggestion}?` : "Use a valid, non-disposable email address.";
      return { email, errors: { email: message } };
    }
    return { email, errors: { form: FAILURE_MESSAGES[result.reason] } };
  }

  const session = sessionFromLogin(result.session);
  (await cookies()).set(SESSION_COOKIE, sealSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: secondsUntilExpiry(session),
  });
  redirect(HOME_BY_ROLE[session.user.role]);
}

/**
 * The OnSim API has no logout or session-revocation endpoint, so this ends the
 * web session only; the bearer token stays valid server-side until its
 * `expires_at` (or until a password reset revokes all of the user's sessions).
 */
export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
