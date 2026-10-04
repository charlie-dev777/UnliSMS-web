import type { BadgeVariant } from "@/components/ui/badge";
import type { PlanTier } from "@/lib/types";
import { StatusBadge } from "./status-badge";

const config: Record<PlanTier, { tone: BadgeVariant; label: string }> = {
  FREE: { tone: "neutral", label: "Free" },
  STARTER: { tone: "neutral", label: "Starter" },
  BUSINESS: { tone: "info", label: "Business" },
};

export function PlanBadge({ tier }: { tier: PlanTier }) {
  return <StatusBadge {...config[tier]} />;
}
