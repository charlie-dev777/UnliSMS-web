import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Info, Smartphone, Webhook } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listGateways } from "@/lib/data/gateways";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { GatewayStatusBadge } from "@/components/status";
import { gatewayLabel, gatewaySubtitle, GatewaysForbidden, GatewaysUnavailable } from "@/components/gateways";

export const metadata: Metadata = { title: "Webhooks" };

/**
 * Webhook configuration is stored by the OnSim API, one per gateway, but its endpoints
 * (`GET`/`PUT /v1/gateways/webhook`) only accept the gateway phone's own device
 * credential. A user session gets 401 there, which would end the web session, so this
 * page never calls them and points to the app instead. It lists the gateways (a user-session
 * read) so people know which phones to configure.
 *
 * Event names are the ones the Android app subscribes every webhook to
 * (`WebhookSubscriptionStore.DEFAULT_EVENTS`); the app has no event picker.
 */
const APP_EVENTS = [
  { name: "sms.received", label: "Incoming SMS" },
  { name: "call.missed", label: "Missed calls" },
  { name: "call.answered", label: "Answered calls" },
];

export default async function WebhooksPage() {
  await requireUser();
  const result = await listGateways();

  return (
    <>
      <PageHeader title="Webhooks" description="Receive SMS and call events from your gateways at your own HTTPS endpoint." />

      <Card>
        <div className="flex flex-col gap-4 px-5 py-5 min-[641px]:flex-row min-[641px]:gap-4">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2">
            <Webhook className="size-[18px]" />
          </span>
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <h2 className="m-0 text-sm leading-5 font-semibold">Set up webhooks in the UnliSMS app</h2>
              <p className="mt-1 mb-0 text-[13px] text-muted-foreground">
                Each gateway has one webhook, stored in your UnliSMS account. You can’t view or change it from the web portal yet — use
                the app on the gateway phone.
              </p>
            </div>
            <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-[13px]">
              <li>
                On the gateway phone, open the UnliSMS app and go to <span className="font-medium">Settings → Webhook &amp; Integrations</span>.
              </li>
              <li>Enter your webhook URL. It must start with https:// and can’t contain a username or password.</li>
              <li>
                Tap <span className="font-medium">Save webhook configuration</span>. To turn the webhook off, clear the URL and save.
              </li>
            </ol>
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-[13px] font-medium">Events sent to your webhook</p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {APP_EVENTS.map((e) => (
                  <li key={e.name} className="rounded-md border border-border bg-muted px-2 py-1 text-xs">
                    {e.label} <span className="font-mono text-muted-foreground">{e.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4">
          <h2 className="m-0 text-sm leading-5 font-semibold">Your gateways</h2>
          <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground">Each of these phones has its own webhook setting.</p>
        </div>
        <div className="border-t border-border">
          {!result.ok ? (
            result.reason === "forbidden" ? (
              <GatewaysForbidden />
            ) : (
              <GatewaysUnavailable />
            )
          ) : result.data.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="No gateways yet"
              description="Webhooks are set up per gateway. Pair an Android phone with the UnliSMS app first."
            />
          ) : (
            <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
              {result.data.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/gateways/${g.id}`}
                    className="group flex items-center gap-3 px-5 py-3.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="min-w-0 text-sm font-semibold break-words group-hover:underline">{gatewayLabel(g)}</span>
                        <GatewayStatusBadge status={g.presence} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {gatewaySubtitle(g)} · <span className="font-mono break-all">{g.publicGatewayId}</span>
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <p className="m-0 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          Webhook settings are saved to your UnliSMS account, not only on the phone. The app re-reads its gateway’s setting from UnliSMS
          when it starts and about every 15 minutes.
        </span>
      </p>
    </>
  );
}
