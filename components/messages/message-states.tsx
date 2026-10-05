import { AlertTriangle, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/feedback";
import { RetryButton } from "@/components/gateways";

/**
 * The API rejected the request with 403: the session is valid, but messages are limited
 * to organization owners and admins. Not an auth failure, so the user stays signed in.
 */
export function MessagesForbidden({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="No access to messages"
      description="Your role in this organization can’t view or send messages. Ask an organization owner or admin for access."
      className={className}
    />
  );
}

/** The API couldn't be reached, timed out, failed, or returned an unexpected response. */
export function MessagesUnavailable({ className, title = "Couldn’t load messages" }: { className?: string; title?: string }) {
  return (
    <ErrorState
      icon={AlertTriangle}
      title={title}
      description="The UnliSMS service didn’t respond. Try again in a moment."
      action={<RetryButton />}
      className={className}
    />
  );
}
