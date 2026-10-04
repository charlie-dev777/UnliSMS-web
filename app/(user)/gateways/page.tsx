import type { Metadata } from "next";
import { Info, Smartphone } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listGateways } from "@/lib/data/gateways";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { AutoRefresh, GatewayCard, GatewaysForbidden, GatewaysUnavailable } from "@/components/gateways";

export const metadata: Metadata = { title: "Gateways" };

export default async function GatewaysPage() {
  await requireUser();
  const result = await listGateways();
  const now = new Date();

  return (
    <>
      <PageHeader title="Gateways" description="Android phones paired to your organization." />
      <AutoRefresh />

      {!result.ok ? (
        <Card>{result.reason === "forbidden" ? <GatewaysForbidden /> : <GatewaysUnavailable />}</Card>
      ) : result.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Smartphone}
            title="No gateways yet"
            description="Install the UnliSMS app on an Android phone and sign in to pair it with your organization."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[13px] font-medium" aria-live="polite">
              {summarize(result.data.map((g) => g.presence))}
            </p>
            <p className="m-0 flex gap-2 text-xs text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>
                Online status reflects each phone’s most recent contact with UnliSMS. Health and SIM details are what the phone
                last reported and may be out of date.
              </span>
            </p>
          </div>
          <section aria-label="Gateways" className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
            {result.data.map((g) => (
              <GatewayCard key={g.id} gateway={g} now={now} />
            ))}
          </section>
        </>
      )}
    </>
  );
}

function summarize(presences: string[]) {
  const count = (p: string) => presences.filter((x) => x === p).length;
  const parts = [`${presences.length} ${presences.length === 1 ? "gateway" : "gateways"}`, `${count("online")} online`, `${count("offline")} offline`];
  if (count("unknown")) parts.push(`${count("unknown")} not yet seen`);
  return parts.join(" · ");
}
