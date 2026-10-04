export type PlanTier = "FREE" | "STARTER" | "BUSINESS";

export interface Plan {
  tier: PlanTier;
  name: string;
  /** SMS included per billing month. */
  monthlySmsLimit: number;
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string; // ISO 8601
  currentPeriodEnd: string; // ISO 8601
  /** SMS used in the current billing period. */
  smsUsed: number;
}
