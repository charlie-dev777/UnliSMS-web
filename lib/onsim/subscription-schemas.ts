import "server-only";

/**
 * Wire shape of `GET /v1/subscription` (onsim-api `app/schemas/subscription.py`, migration
 * 024). Owner/admin user sessions only: member/viewer get 403. 503 with
 * `code: "organization_plan_unavailable"` when the organization has no live subscription.
 *
 * - `monthly_sms_limit` null = unlimited, so `sms_remaining` is null too.
 * - `sms_used` is the real count (inbound + outbound) and can exceed the limit, because
 *   inbound is never blocked. `sms_remaining` is clamped at 0 by the API.
 * - `sms_over_quota` is true once `sms_used >= monthly_sms_limit`: new outbound SMS is refused.
 * - The SMS period is the calendar month in the organization's timezone for Free, or the
 *   billing period for paid plans; both bounds are computed by the API. Null only for a
 *   paid subscription without a valid billing period.
 *
 * No billing provider or customer identifiers are returned. `trialing` stays in the API's
 * status set for compatibility only; UnliSMS has no trial (Free is the try-out plan).
 */
export interface SubscriptionResponse {
  /**
   * `organizations.timezone`, unchanged: the zone the Free quota month is computed in. Added
   * after the first release of this endpoint, so treated as optional; missing means UTC.
   */
  organization_timezone?: string;
  plan: { code: string; name: string; gateway_limit: number };
  subscription: {
    status: "trialing" | "active" | "past_due";
    started_at: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancelled_at: string | null;
    expires_at: string | null;
  };
  usage: {
    current_gateway_count: number;
    remaining_gateway_slots: number;
    monthly_sms_limit: number | null;
    sms_used: number;
    sms_inbound: number;
    sms_outbound: number;
    sms_remaining: number | null;
    sms_period_start: string | null;
    sms_period_end: string | null;
    sms_over_quota: boolean;
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;
const isTime = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));
const isOptionalTime = (v: unknown) => v === null || isTime(v);
const STATUSES = new Set(["trialing", "active", "past_due"]);

export function isSubscriptionResponse(body: unknown): body is SubscriptionResponse {
  if (!isObject(body) || !isObject(body.plan) || !isObject(body.subscription) || !isObject(body.usage)) return false;
  const { plan, subscription: s, usage: u } = body;
  return (
    (body.organization_timezone === undefined || typeof body.organization_timezone === "string") &&
    typeof plan.code === "string" &&
    typeof plan.name === "string" &&
    isCount(plan.gateway_limit) &&
    typeof s.status === "string" &&
    STATUSES.has(s.status) &&
    isTime(s.started_at) &&
    isOptionalTime(s.current_period_start) &&
    isOptionalTime(s.current_period_end) &&
    isOptionalTime(s.cancelled_at) &&
    isOptionalTime(s.expires_at) &&
    isCount(u.current_gateway_count) &&
    isCount(u.remaining_gateway_slots) &&
    (u.monthly_sms_limit === null || isCount(u.monthly_sms_limit)) &&
    isCount(u.sms_used) &&
    isCount(u.sms_inbound) &&
    isCount(u.sms_outbound) &&
    (u.sms_remaining === null || isCount(u.sms_remaining)) &&
    isOptionalTime(u.sms_period_start) &&
    isOptionalTime(u.sms_period_end) &&
    typeof u.sms_over_quota === "boolean"
  );
}
