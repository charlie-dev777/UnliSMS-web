import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Organization, Role, User } from "@/lib/types";
import type { OnSimSessionResponse } from "./onsim";

/**
 * The web session: the OnSim bearer token plus the identity returned with it,
 * sealed with AES-256-GCM into one httpOnly cookie. The token never reaches
 * client JavaScript, and the sealed identity (including `role`) can't be
 * edited by the browser. Used by both `proxy.ts` and server components.
 */
export interface Session {
  token: string;
  expiresAt: string; // ISO 8601, from the API
  user: User;
  organization: Organization;
}

/**
 * The OnSim API has no platform-role field (users carry no role; only
 * organization-scoped `organization_members.role` exists, and login doesn't
 * return it). Until the API exposes one, every account is a USER and admin
 * routes stay closed. Map the backend field here once it exists.
 */
function roleFrom(): Role {
  return "USER";
}

export function sessionFromLogin(response: OnSimSessionResponse): Session {
  const { user, organization } = response;
  return {
    token: response.access_token,
    expiresAt: response.expires_at,
    user: { id: user.id, email: user.email, username: user.username, name: user.display_name, role: roleFrom() },
    organization: { id: organization.id, name: organization.name, planCode: organization.plan_code },
  };
}

/** Seconds until the API session expires (0 when already expired). */
export function secondsUntilExpiry(session: Session, now = Date.now()): number {
  const ms = Date.parse(session.expiresAt) - now;
  return Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
}

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters");
  return createHash("sha256").update(secret).digest();
}

export function sealSession(session: Session): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

/** The session in a cookie value, or null if it's missing, tampered with, or expired. */
export function unsealSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const [iv, tag, data] = value.split(".").map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const session = JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")) as Session;
    return secondsUntilExpiry(session) > 0 ? session : null;
  } catch {
    return null;
  }
}
