import { AlertTriangle, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/feedback";
import { RetryButton } from "@/components/gateways";

/**
 * The API rejected the request with 403: the session is valid, but API keys are limited
 * to organization owners and admins. Not an auth failure, so the user stays signed in.
 */
export function ApiKeysForbidden({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="No access to API keys"
      description="Your role in this organization can’t view or manage API keys. Ask an organization owner or admin for access."
      className={className}
    />
  );
}

/** The API couldn't be reached, timed out, failed, or returned an unexpected response. */
export function ApiKeysUnavailable({ className }: { className?: string }) {
  return (
    <ErrorState
      icon={AlertTriangle}
      title="Couldn’t load API keys"
      description="The UnliSMS service didn’t respond. Try again in a moment."
      action={<RetryButton />}
      className={className}
    />
  );
}
