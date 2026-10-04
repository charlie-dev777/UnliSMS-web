import { Smartphone } from "lucide-react";
import type { GatewayFleetHealth } from "@/lib/types";
import { formatNumber, formatPercent, ratioPct } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { BreakdownBar } from "./breakdown-bar";

/** Platform-wide gateway fleet: online share, offline age and push health. */
export function GatewayHealthPanel({ fleet }: { fleet: GatewayFleetHealth | null }) {
  const registered = fleet ? fleet.online + fleet.offlineUnder24h + fleet.offlineOver24h : 0;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Gateway health</CardTitle>
          <CardDescription>{formatNumber(registered)} registered devices</CardDescription>
        </div>
      </CardHeader>
      {!fleet || registered === 0 ? (
        <EmptyState icon={Smartphone} title="No gateways registered" description="Devices appear here once users pair the UnliSMS Android app." />
      ) : (
        <CardContent className="flex flex-col gap-5">
          <div>
            <div className="num text-4xl leading-[44px] font-semibold tracking-[-0.02em]">{formatPercent(ratioPct(fleet.online, registered))}</div>
            <div className="text-xs text-muted-foreground">online right now</div>
          </div>
          <BreakdownBar
            showPct={false}
            segments={[
              { label: "Online", value: fleet.online, colorClass: "bg-success" },
              { label: "Offline < 24h", value: fleet.offlineUnder24h, colorClass: "bg-warning" },
              { label: "Offline > 24h", value: fleet.offlineOver24h, colorClass: "bg-offline" },
            ]}
          />
          <dl className="m-0 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div className="flex flex-col">
              <dt className="text-xs text-muted-foreground">Avg. heartbeat</dt>
              <dd className="num m-0 font-semibold">{fleet.avgHeartbeatSec} s</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-muted-foreground">FCM push success</dt>
              <dd className="num m-0 font-semibold">{formatPercent(fleet.fcmSuccessPct)}</dd>
            </div>
          </dl>
        </CardContent>
      )}
    </Card>
  );
}
