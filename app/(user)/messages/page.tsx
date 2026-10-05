import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronRight, Info, MessageSquare, Send } from "lucide-react";
import type { MessageFilter } from "@/lib/types";
import { requireUser } from "@/lib/auth/session";
import { getMessageStatus, isMessageId, listMessages } from "@/lib/data/messages";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { AutoRefresh } from "@/components/gateways";
import { MESSAGE_STATUS } from "@/components/status";
import { MessageFilters, MessageHistory, MessagesForbidden, MessagesUnavailable } from "@/components/messages";

export const metadata: Metadata = { title: "Messages" };

const FILTERS: readonly string[] = ["scheduled", "sent"];
const EMPTY: Record<MessageFilter, { title: string; description: string }> = {
  all: { title: "No messages yet", description: "SMS you send or schedule from the portal or the UnliSMS app will appear here." },
  scheduled: { title: "No scheduled SMS", description: "SMS waiting for their scheduled time will appear here." },
  sent: { title: "Nothing sent yet", description: "SMS your gateways have sent or delivered will appear here." },
};

export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  await requireUser();
  const params = await searchParams;
  const filter = (typeof params.state === "string" && FILTERS.includes(params.state) ? params.state : "all") as MessageFilter;
  const submittedId = typeof params.submitted === "string" && isMessageId(params.submitted) ? params.submitted : undefined;

  const [result, submitted] = await Promise.all([listMessages(filter), submittedId ? getMessageStatus(submittedId) : null]);
  const now = new Date();

  return (
    <>
      <PageHeader title="Messages" description="Send, schedule and track SMS from your gateways." />
      <AutoRefresh seconds={30} />

      {submitted?.ok && (
        <Alert variant="success">
          <CheckCircle2 aria-hidden />
          <AlertDescription>
            {submitted.data.status === "scheduled" ? "Your SMS is scheduled." : "Your SMS was submitted."} Current status:{" "}
            <span className="font-semibold">{MESSAGE_STATUS[submitted.data.status].label}</span> —{" "}
            {MESSAGE_STATUS[submitted.data.status].description} <Link href={`/messages/${submitted.data.id}`}>View message</Link>
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="New message" className="grid grid-cols-1 gap-3 min-[641px]:grid-cols-2">
        <ActionCard href="/messages/new" icon={Send} title="Send SMS Now" description="Send right away from one of your gateways." primary />
        <ActionCard href="/messages/new?mode=schedule" icon={CalendarClock} title="Schedule SMS" description="Pick a date and time to send it later." />
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="m-0 text-sm leading-5 font-semibold">Message history</h2>
            <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground">Your 100 most recent outbound SMS. Updates every 30 seconds.</p>
          </div>
          <MessageFilters active={filter} />
        </div>
        <div className="border-t border-border">
          {!result.ok ? (
            result.reason === "forbidden" ? (
              <MessagesForbidden />
            ) : (
              <MessagesUnavailable />
            )
          ) : result.data.length === 0 ? (
            <EmptyState icon={MessageSquare} {...EMPTY[filter]} />
          ) : (
            <MessageHistory messages={result.data} now={now} highlightId={submittedId} />
          )}
        </div>
      </Card>

      {result.ok && result.data.some((m) => m.status === "sent") && (
        <p className="m-0 flex gap-2 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>“Sent” means the gateway sent the SMS but the carrier hasn’t reported delivery. Not every carrier sends delivery reports.</span>
        </p>
      )}
    </>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  primary,
}: {
  href: string;
  icon: typeof Send;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-4 hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span
        aria-hidden
        className={
          primary
            ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            : "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground-2"
        }
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
    </Link>
  );
}
