import { AlertTriangle, SearchX, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/feedback";
import { RetryButton } from "@/components/gateways";

/** 403: the session is valid, but webhooks are limited to organization owners and admins. */
export function WebhooksForbidden() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="No access to webhooks"
      description="Your role in this organization can’t view or change webhooks. Ask an organization owner or admin for access."
    />
  );
}

/** 404: not an allocated gateway of this organization (or a malformed id). */
export function WebhookGatewayMissing() {
  return (
    <EmptyState
      icon={SearchX}
      title="Gateway not found"
      description="This gateway isn’t available to your organization. It may have been removed. Choose another gateway above."
    />
  );
}

export function WebhookUnavailable() {
  return (
    <ErrorState
      icon={AlertTriangle}
      title="Couldn’t load this webhook"
      description="The UnliSMS service didn’t respond. Try again in a moment."
      action={<RetryButton />}
    />
  );
}
