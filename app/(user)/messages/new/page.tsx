import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { ChevronLeft, Smartphone } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listGateways } from "@/lib/data/gateways";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { gatewayLabel, GatewaysForbidden, GatewaysUnavailable } from "@/components/gateways";
import { ComposeForm, type ComposeGateway } from "@/components/messages";

export const metadata: Metadata = { title: "New message" };

export default async function NewMessagePage({ searchParams }: PageProps<"/messages/new">) {
  await requireUser();
  const mode = (await searchParams).mode === "schedule" ? "schedule" : "now";
  const gateways = await listGateways();

  const back = (
    <Link href="/messages" className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" aria-hidden />
      Messages
    </Link>
  );
  const header = <PageHeader title="New message" description="Send an SMS now or schedule it, from the gateway and SIM you pick." />;

  if (!gateways.ok || gateways.data.length === 0) {
    return (
      <>
        {back}
        {header}
        <Card>
          {!gateways.ok ? (
            gateways.reason === "forbidden" ? (
              <GatewaysForbidden />
            ) : (
              <GatewaysUnavailable />
            )
          ) : (
            <EmptyState
              icon={Smartphone}
              title="No gateways yet"
              description="Pair an Android phone with the UnliSMS app before sending SMS."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/gateways">Go to gateways</Link>
                </Button>
              }
            />
          )}
        </Card>
      </>
    );
  }

  // Only what the form needs; `public_gateway_id` is what `POST /v1/messages` takes.
  const options: ComposeGateway[] = gateways.data.map((g) => ({
    publicGatewayId: g.publicGatewayId,
    label: gatewayLabel(g),
    presence: g.presence,
    sims: g.sims.map(({ slotNumber, phoneNumber, carrierName, isDefaultOutbound }) => ({ slotNumber, phoneNumber, carrierName, isDefaultOutbound })),
  }));

  return (
    <>
      {back}
      {header}
      <Card className="mx-auto w-full max-w-[720px] p-5 min-[641px]:p-6">
        <ComposeForm gateways={options} initialMode={mode} initialIdempotencyKey={randomUUID()} />
      </Card>
    </>
  );
}
