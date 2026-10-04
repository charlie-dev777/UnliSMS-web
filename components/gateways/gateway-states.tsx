import { AlertTriangle, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/feedback";
import { RetryButton } from "./client-controls";

/**
 * The API rejected the read with 403: the session is valid, but gateway data is limited
 * to organization owners and admins. Not an auth failure, so the user stays signed in.
 */
export function GatewaysForbidden({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="No access to gateways"
      description="Your role in this organization can’t view gateway data. Ask an organization owner or admin for access."
      className={className}
    />
  );
}

/** The API couldn't be reached, timed out, failed, or returned an unexpected response. */
export function GatewaysUnavailable({ className }: { className?: string }) {
  return (
    <ErrorState
      icon={AlertTriangle}
      title="Couldn’t load gateways"
      description="The UnliSMS service didn’t respond. Try again in a moment."
      action={<RetryButton />}
      className={className}
    />
  );
}
