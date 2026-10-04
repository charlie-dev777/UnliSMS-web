import type { GatewaySim } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { UNKNOWN } from "./gateway-fields";

/** Active SIMs as the device last reported them, in slot order. */
export function SimList({ sims }: { sims: GatewaySim[] }) {
  if (sims.length === 0) return <p className="m-0 text-[13px] text-muted-foreground">No active SIMs reported.</p>;

  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
      {sims.map((sim) => (
        <li key={sim.slotNumber} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">SIM {sim.slotNumber}</span>
            <span className={sim.phoneNumber ? "font-mono text-[13px] font-medium break-all" : "text-[13px] text-muted-foreground"}>
              {sim.phoneNumber ?? "Number unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {sim.carrierName ?? `Carrier ${UNKNOWN.toLowerCase()}`} · {sim.countryIso ?? `Country ${UNKNOWN.toLowerCase()}`}
            </span>
          </div>
          {sim.isDefaultOutbound && <Badge variant="info">Default for sending</Badge>}
        </li>
      ))}
    </ul>
  );
}
