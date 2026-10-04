export type Role = "USER" | "ADMIN";

/**
 * The signed-in account, built from the OnSim API login response
 * (`POST /v1/auth/login` → `user`). The API returns no email-verification or
 * account-status fields: it refuses to issue a session for unverified accounts
 * (403 `email_not_verified`) or suspended/deleted users and organizations
 * (401, same as a wrong password), so a session implies both at login time.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  name: string; // `display_name`
  role: Role;
}

export interface Organization {
  id: string;
  name: string;
  planCode: string;
}
