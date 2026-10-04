import Link from "next/link";
import { Plus, Webhook } from "lucide-react";
import type { WebhookDelivery } from "@/lib/types";
import { displayUrl, formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { WebhookStatusBadge } from "@/components/status";
import { ViewAllLink } from "./view-all-link";

/** Latest webhook delivery attempts, newest first. */
export function WebhookActivityPanel({ deliveries, now }: { deliveries: WebhookDelivery[]; now: Date }) {
  const latest = deliveries[0];
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Webhook activity</CardTitle>
          <CardDescription>{latest ? `Last delivery ${formatRelativeTime(latest.attemptedAt, now).toLowerCase()}` : "No deliveries yet"}</CardDescription>
        </div>
        {latest && (
          <CardAction>
            <ViewAllLink href="/webhooks" />
          </CardAction>
        )}
      </CardHeader>

      {deliveries.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No webhooks yet"
          description="Get delivery reports and inbound SMS pushed to your server."
          action={
            <Button asChild size="sm">
              <Link href="/webhooks">
                <Plus />
                Add webhook
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="m-0 list-none p-0">
          {deliveries.map((d) => (
            <li key={d.id} className="flex items-center gap-3 border-t border-border px-5 py-3">
              <div className="flex min-w-0 flex-1 flex-col leading-[18px]">
                <span className="font-mono text-[12.5px] text-foreground">{d.event}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayUrl(d.url)} · {formatRelativeTime(d.attemptedAt, now)}
                </span>
              </div>
              <WebhookStatusBadge state={d.state} responseStatus={d.responseStatus} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
