import "server-only";
import { cache } from "react";
import { onsimGet } from "@/lib/onsim/client";
import { isSubscriptionResponse, type SubscriptionResponse } from "@/lib/onsim/subscription-schemas";
import type { ApiResult, Subscription } from "@/lib/types";
import { safeTimeZone } from "@/lib/format";

/** The organization's plan and plan-limited usage. Memoized per request (layout + page). */
export const getSubscription = cache(async (): Promise<ApiResult<Subscription>> => {
  const result = await onsimGet("v1/subscription", isSubscriptionResponse);
  return result.ok ? { ok: true, data: toSubscription(result.data) } : result;
});

function toSubscription({ organization_timezone, plan, subscription: s, usage: u }: SubscriptionResponse): Subscription {
  return {
    timeZone: safeTimeZone(organization_timezone),
    plan: { code: plan.code, name: plan.name, gatewayLimit: plan.gateway_limit },
    status: s.status,
    startedAt: s.started_at,
    currentPeriodStart: s.current_period_start,
    currentPeriodEnd: s.current_period_end,
    gateways: { used: u.current_gateway_count, limit: plan.gateway_limit, remaining: u.remaining_gateway_slots },
    sms: {
      limit: u.monthly_sms_limit,
      used: u.sms_used,
      inbound: u.sms_inbound,
      outbound: u.sms_outbound,
      remaining: u.sms_remaining,
      periodStart: u.sms_period_start,
      periodEnd: u.sms_period_end,
      overQuota: u.sms_over_quota,
    },
  };
}
