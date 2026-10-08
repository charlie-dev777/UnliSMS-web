import type { Metadata } from "next";
import { requireUserOrganization } from "@/lib/auth/session";
import { getSubscription } from "@/lib/data/subscription";
import { PageHeader } from "@/components/layout/page-header";
import { PlanCard, UsageMeters, UsageUnavailable } from "@/components/usage";

export const metadata: Metadata = { title: "Usage" };

export default async function UsagePage() {
  await requireUserOrganization();
  // Shared with the layout's sidebar card via React cache().
  const subscription = await getSubscription();

  return (
    <>
      <PageHeader title="Usage" description="Your plan and the resources it limits." />
      {subscription.ok ? (
        <>
          <PlanCard subscription={subscription.data} />
          <UsageMeters subscription={subscription.data} />
        </>
      ) : (
        <UsageUnavailable result={subscription} />
      )}
    </>
  );
}
