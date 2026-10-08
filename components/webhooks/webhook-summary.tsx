import { KeyRound } from "lucide-react";
import type { GatewayWebhook } from "@/lib/types";
import { WEBHOOK_EVENTS } from "@/lib/webhooks/config";
import { formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { Field, FieldList, Timestamp } from "@/components/gateways";

const eventLabel = (name: string) => WEBHOOK_EVENTS.find((e) => e.name === name)?.label ?? name;

export function WebhookStateBadge({ webhook }: { webhook: GatewayWebhook }) {
  if (!webhook.configured) return <StatusBadge tone="neutral" label="Not set up" />;
  return webhook.enabled ? <StatusBadge tone="success" label="On" dot /> : <StatusBadge tone="neutral" label="Off" dot dotClassName="bg-offline" />;
}

/** The configuration exactly as the API returned it. The signing secret is only ever "set" or "not set". */
export function WebhookSummary({ webhook, now }: { webhook: GatewayWebhook; now: Date }) {
  if (!webhook.configured) {
    return (
      <p className="m-0 text-[13px] text-muted-foreground">
        No webhook is set up for this gateway. Add a URL to start receiving events.
      </p>
    );
  }
  return (
    <FieldList>
      <Field label="URL" wide>
        {webhook.url ? <span className="font-mono text-[13px] break-all">{webhook.url}</span> : null}
      </Field>
      <Field label="Events" wide>
        <span className="flex flex-wrap gap-1.5">
          {webhook.events.map((name) => (
            <span key={name} className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs">
              {eventLabel(name)} <span className="font-mono text-muted-foreground">{name}</span>
            </span>
          ))}
        </span>
      </Field>
      <Field label="Signing secret">
        <span className="inline-flex items-center gap-1.5">
          <KeyRound className="size-3.5 text-muted-foreground" aria-hidden />
          {webhook.hasSigningSecret ? "Set (hidden)" : "Not set"}
        </span>
      </Field>
      <Field label="Configuration version">{formatNumber(webhook.version)}</Field>
      <Field label="Created">
        <Timestamp iso={webhook.createdAt} now={now} />
      </Field>
      <Field label="Last updated">
        <Timestamp iso={webhook.updatedAt} now={now} />
      </Field>
    </FieldList>
  );
}
