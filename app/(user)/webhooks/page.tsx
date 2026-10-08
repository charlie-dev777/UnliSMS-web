import type { Metadata } from "next";
import { CheckCircle2, Info, Smartphone } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listGateways } from "@/lib/data/gateways";
import { getGatewayWebhook } from "@/lib/data/webhooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { gatewayLabel, GatewaysForbidden, GatewaysUnavailable } from "@/components/gateways";
import {
  GatewayPicker,
  WebhookForm,
  WebhookGatewayMissing,
  WebhooksForbidden,
  WebhookStateBadge,
  WebhookSummary,
  WebhookUnavailable,
} from "@/components/webhooks";

export const metadata: Metadata = { title: "Webhooks" };

/**
 * Each gateway's webhook, read from and saved to the OnSim API
 * (`/v1/gateways/{gateway_id}/webhook`). It's the same configuration the Android app syncs
 * with its device credential, so the API is the only copy: every render reads it fresh,
 * and a save reloads the page from it.
 */
export default async function WebhooksPage({ searchParams }: PageProps<"/webhooks">) {
  await requireUser();
  const params = await searchParams;
  const gateways = await listGateways();

  const header = <PageHeader title="Webhooks" description="Send SMS and call events from your gateways to your own HTTPS endpoint." />;

  if (!gateways.ok) {
    return (
      <>
        {header}
        <Card>{gateways.reason === "forbidden" ? <GatewaysForbidden /> : <GatewaysUnavailable />}</Card>
      </>
    );
  }
  if (gateways.data.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={Smartphone}
            title="No gateways yet"
            description="Webhooks are set up per gateway. Pair an Android phone with the UnliSMS app first."
          />
        </Card>
      </>
    );
  }

  const requested = typeof params.gateway === "string" ? params.gateway : undefined;
  const selectedId = requested ?? gateways.data[0].id;
  const selected = gateways.data.find((g) => g.id === selectedId);
  const webhook = selected ? await getGatewayWebhook(selected.id) : null;
  const saved = typeof params.saved === "string" && /^\d{1,9}$/.test(params.saved) ? Number(params.saved) : null;
  const now = new Date();

  return (
    <>
      {header}

      <GatewayPicker
        gateways={gateways.data.map((g) => ({ id: g.id, label: gatewayLabel(g), detail: g.publicGatewayId }))}
        selectedId={selected?.id ?? ""}
      />

      {/* Only right after this page's own save: the version the API returned is still current. */}
      {saved !== null && webhook?.ok && webhook.data.version === saved && (
        <Alert variant="success">
          <CheckCircle2 aria-hidden />
          <AlertDescription>
            {webhook.data.configured
              ? `Webhook saved (version ${saved}). Your gateway app will receive the updated configuration on its next sync.`
              : `Webhook removed (version ${saved}). Your gateway app will stop sending events after its next sync.`}
          </AlertDescription>
        </Alert>
      )}

      {!selected || (webhook && !webhook.ok && webhook.reason === "not_found") ? (
        <Card>
          <WebhookGatewayMissing />
        </Card>
      ) : !webhook?.ok ? (
        <Card>{webhook?.reason === "forbidden" ? <WebhooksForbidden /> : <WebhookUnavailable />}</Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 min-[1024px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <h2 className="m-0 text-sm leading-5 font-semibold">Current configuration</h2>
              <WebhookStateBadge webhook={webhook.data} />
            </div>
            <div className="border-t border-border px-5 py-4">
              <WebhookSummary webhook={webhook.data} now={now} />
            </div>
          </Card>
          <Card>
            <div className="px-5 py-4">
              <h2 className="m-0 text-sm leading-5 font-semibold">{webhook.data.configured ? "Edit webhook" : "Set up webhook"}</h2>
              <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground">for {gatewayLabel(selected)}</p>
            </div>
            <div className="border-t border-border px-5 py-5">
              <WebhookForm key={`${webhook.data.gatewayId}:${webhook.data.version}:${webhook.data.updatedAt}`} webhook={webhook.data} />
            </div>
          </Card>
        </div>
      )}

      <p className="m-0 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          Webhook settings are stored in your UnliSMS account and shared with the UnliSMS app on the gateway phone. The app picks up changes when it
          starts and about every 15 minutes. Changes saved in the app show here when you reload this page.
        </span>
      </p>
    </>
  );
}
