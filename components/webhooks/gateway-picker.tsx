"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PickerGateway = { id: string; label: string; detail: string };

/** Switches the page to another gateway's webhook via `?gateway=`. */
export function GatewayPicker({ gateways, selectedId }: { gateways: PickerGateway[]; selectedId: string }) {
  const router = useRouter();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor="webhook-gateway">Gateway</Label>
      <Select value={selectedId} onValueChange={(id) => router.push(`/webhooks?gateway=${encodeURIComponent(id)}`)}>
        <SelectTrigger id="webhook-gateway" className="h-10 w-full min-[641px]:w-[360px]">
          <SelectValue placeholder="Choose a gateway" />
        </SelectTrigger>
        <SelectContent>
          {gateways.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              <span className="flex min-w-0 flex-col items-start">
                <span className="truncate">{g.label}</span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">{g.detail}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
