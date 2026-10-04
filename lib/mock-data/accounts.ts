import type { Plan, Subscription } from "@/lib/types";

export const plans: Record<Plan["tier"], Plan> = {
  FREE: { tier: "FREE", name: "Free plan", monthlySmsLimit: 500 },
  STARTER: { tier: "STARTER", name: "Starter plan", monthlySmsLimit: 20_000 },
  BUSINESS: { tier: "BUSINESS", name: "Business plan", monthlySmsLimit: 100_000 },
};

export const mockSubscription = (userId: string): Subscription => ({
  id: "sub_7Kq2mX",
  userId,
  plan: plans.STARTER,
  status: "active",
  currentPeriodStart: "2026-10-01T00:00:00+08:00",
  currentPeriodEnd: "2026-10-31T23:59:59+08:00",
  smsUsed: 12_480,
});
