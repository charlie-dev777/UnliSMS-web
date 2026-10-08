/** Plan tiers in the Phase 1 admin mock data. The OnSim API exposes only a free-form `plan_code`. */
export type PlanTier = "FREE" | "STARTER" | "BUSINESS";

/**
 * Live subscription statuses `GET /v1/subscription` can return. UnliSMS has no trial: Free is
 * free forever. `trialing` is kept only so an unexpected legacy value doesn't break parsing,
 * and the UI never presents it.
 */
export type SubscriptionStatus = "trialing" | "active" | "past_due";

/** The organization's plan, subscription and plan-limited usage (`GET /v1/subscription`). */
export interface Subscription {
  /** The organization's quota timezone (IANA), for every period date shown. UTC when unknown. */
  timeZone: string;
  plan: { code: string; name: string; gatewayLimit: number };
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gateways: { used: number; limit: number; remaining: number };
  sms: {
    /** Null = unlimited. */
    limit: number | null;
    /** Real count; inbound can take it past the limit. */
    used: number;
    inbound: number;
    outbound: number;
    /** Clamped at 0 by the API; null when unlimited. */
    remaining: number | null;
    periodStart: string | null;
    /** When the quota resets, as computed by the API. Null when there's no valid period. */
    periodEnd: string | null;
    /** New outbound SMS is refused until the period resets or the plan changes. */
    overQuota: boolean;
  };
}
