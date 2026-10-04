import Link from "next/link";
import { Smartphone } from "lucide-react";
import type { Gateway, SimSlot } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { GatewayStatusBadge } from "@/components/status";
import { SignalBars } from "./signal-bars";
import { ViewAllLink } from "./view-all-link";

/** The user's paired Android gateways with per-SIM carrier and signal. */
export function GatewayStatusPanel({ gateways, now }: { gateways: Gateway[]; now: Date }) {
  const online = gateways.filter((g) => g.status === "online").length;
  const sims = gateways.reduce((n, g) => n + g.sims.filter(Boolean).length, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Gateways</CardTitle>
          <CardDescription>
            {gateways.length === 0 ? "No devices paired" : `${online} of ${gateways.length} devices online · ${sims} active SIMs`}
          </CardDescription>
        </div>
        {gateways.length > 0 && (
          <CardAction>
            <ViewAllLink href="/gateways" />
          </CardAction>
        )}
      </CardHeader>

      {gateways.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No gateways yet"
          description="Install the UnliSMS app on an Android phone and pair it to start sending."
          action={
            <Button asChild size="sm">
              <Link href="/gateways">Add gateway</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SIM 1</TableHead>
              <TableHead>SIM 2</TableHead>
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
                      <Link href="/gateways" className="font-medium text-foreground hover:underline">
                        {g.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {g.deviceModel} · Android {g.androidVersion}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <GatewayStatusBadge status={g.status} />
                </TableCell>
                <TableCell>
                  <SimCell sim={g.sims[0]} />
                </TableCell>
                <TableCell>
                  <SimCell sim={g.sims[1]} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(g.lastSeenAt, now)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function SimCell({ sim }: { sim: SimSlot | null }) {
  return (
    <div className="flex items-center gap-2">
      <SignalBars level={sim?.signal ?? 0} />
      <div className="flex flex-col leading-[18px]">
        <span className="font-medium">{sim ? sim.carrier : "Empty slot"}</span>
        <span className="font-mono text-[11.5px] text-muted-foreground">{sim ? sim.maskedNumber : "—"}</span>
      </div>
      {sim && sim.signal <= 1 && <span className="sr-only">Weak signal</span>}
    </div>
  );
}
