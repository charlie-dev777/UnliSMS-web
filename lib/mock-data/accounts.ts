import type { Plan, Subscription, User } from "@/lib/types";

// Preview sign-in accounts. Any non-empty password is accepted.
export const mockUsers: User[] = [
  { id: "usr_mreyes", name: "Maria Reyes", email: "maria@acme.ph", role: "USER", emailVerified: true, createdAt: "2026-03-14T02:10:00Z" },
  { id: "usr_jcruz", name: "Jun Cruz", email: "jun@unlisms.test", role: "ADMIN", emailVerified: true, createdAt: "2025-11-02T01:00:00Z" },
];

export const findMockUserByEmail = (email: string) =>
  mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null;

export const findMockUserById = (id: string) => mockUsers.find((u) => u.id === id) ?? null;

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
