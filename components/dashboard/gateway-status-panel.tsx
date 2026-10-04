import Link from "next/link";
import { Smartphone } from "lucide-react";
import type { ApiResult, Gateway, GatewaySim } from "@/lib/types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { GatewayStatusBadge } from "@/components/status";
import { gatewayLabel, gatewaySubtitle, GatewaysForbidden, GatewaysUnavailable, Timestamp } from "@/components/gateways";
import { ViewAllLink } from "./view-all-link";

/** The organization's paired Android gateways, live from the OnSim API. */
export function GatewayStatusPanel({ result, now }: { result: ApiResult<Gateway[]>; now: Date }) {
  const gateways = result.ok ? result.data : [];
  const online = gateways.filter((g) => g.presence === "online").length;
  const sims = gateways.reduce((n, g) => n + g.sims.length, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Gateways</CardTitle>
          <CardDescription>
            {!result.ok
              ? "Paired Android devices"
              : gateways.length === 0
                ? "No devices paired"
                : `${online} of ${gateways.length} ${gateways.length === 1 ? "device" : "devices"} online · ${sims} active ${sims === 1 ? "SIM" : "SIMs"}`}
          </CardDescription>
        </div>
        {gateways.length > 0 && (
          <CardAction>
            <ViewAllLink href="/gateways" />
          </CardAction>
        )}
      </CardHeader>

      {!result.ok ? (
        result.reason === "forbidden" ? <GatewaysForbidden /> : <GatewaysUnavailable />
      ) : gateways.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No gateways yet"
          description="Install the UnliSMS app on an Android phone and sign in to pair it."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active SIMs</TableHead>
              <TableHead>Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gateways.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden className="flex size-[30px] shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2">
                      <Smartphone className="size-3.5" />
                    </span>
                    <div className="flex flex-col leading-[18px]">
                      <Link href={`/gateways/${g.id}`} className="font-medium text-foreground hover:underline">
                        {gatewayLabel(g)}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {gatewaySubtitle(g)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <GatewayStatusBadge status={g.presence} />
                </TableCell>
                <TableCell>
                  <SimSummary sims={g.sims} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <Timestamp iso={g.lastSeenAt} now={now} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function SimSummary({ sims }: { sims: GatewaySim[] }) {
  if (sims.length === 0) return <span className="text-muted-foreground">None reported</span>;
  return (
    <div className="flex flex-col gap-1">
      {sims.map((sim) => (
        <div key={sim.slotNumber} className="flex flex-col leading-[18px]">
          <span className="font-medium">
            SIM {sim.slotNumber} · {sim.carrierName ?? "Unknown carrier"}
          </span>
          <span className="font-mono text-[11.5px] text-muted-foreground">{sim.phoneNumber ?? "Number unknown"}</span>
        </div>
      ))}
    </div>
  );
}
