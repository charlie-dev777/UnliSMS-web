import Link from "next/link";
import { ChevronRight, Smartphone } from "lucide-react";
import type { Gateway } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { GatewayHealthBadge, GatewayStatusBadge } from "@/components/status";
import { Field, FieldList, gatewayLabel, gatewaySubtitle, Mono, Timestamp } from "./gateway-fields";
import { SimList } from "./sim-list";

/** One gateway on /gateways: identity, presence, last report and active SIMs. */
export function GatewayCard({ gateway: g, now }: { gateway: Gateway; now: Date }) {
  const label = gatewayLabel(g);
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2">
            <Smartphone className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="m-0 truncate text-sm leading-5 font-semibold">
              <Link href={`/gateways/${g.id}`} className="hover:underline">
                {label}
              </Link>
            </h2>
            <span className="truncate text-xs text-muted-foreground">
              {gatewaySubtitle(g)}
            </span>
          </div>
        </div>
        <GatewayStatusBadge status={g.presence} />
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4">
        <FieldList>
          <Field label="Last seen">
            <Timestamp iso={g.lastSeenAt} now={now} />
          </Field>
          <Field label="Last reported health">
            <GatewayHealthBadge status={g.healthStatus} />
          </Field>
          <Field label="App version">{g.appVersion}</Field>
          <Field label="Android version">{g.androidVersion}</Field>
          <Field label="Gateway ID" wide>
            <Mono>{g.publicGatewayId}</Mono>
          </Field>
        </FieldList>

        <section aria-label={`Active SIMs on ${label}`} className="flex flex-col gap-2">
          <h3 className="m-0 text-xs font-medium text-muted-foreground">Active SIMs (last reported)</h3>
          <SimList sims={g.sims} />
        </section>
      </div>

      <Link
        href={`/gateways/${g.id}`}
        className="mt-auto flex items-center justify-between border-t border-border px-5 py-3 text-[13px] font-medium text-primary hover:bg-row-hover"
      >
        View details
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </Card>
  );
}
