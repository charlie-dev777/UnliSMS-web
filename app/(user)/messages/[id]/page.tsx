import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import type { MessageErrorClassification, MessageStatus } from "@/lib/types";
import { requireUser } from "@/lib/auth/session";
import { getMessage } from "@/lib/data/messages";
import { formatDateTime, formatNumber } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { MESSAGE_STATUS, MessageStatusBadge } from "@/components/status";
import { AutoRefresh, Field, FieldList, Mono } from "@/components/gateways";
import { CancelScheduledButton, formatRecurrence, formatSchedule, isCancellable, MessagesForbidden, MessagesUnavailable } from "@/components/messages";

export const metadata: Metadata = { title: "Message" };

/** States that can still change, refreshed every 15 seconds. */
const IN_FLIGHT: readonly MessageStatus[] = ["queued", "claimed", "sending", "retry_waiting"];
/** States that only change on a schedule or a carrier report, refreshed every 30 seconds. */
const WAITING: readonly MessageStatus[] = ["scheduled", "sent", "unknown"];

/** The API's public failure categories (`PUBLIC_ERROR_CLASSIFICATIONS`). */
const FAILURE: Record<MessageErrorClassification, string> = {
  TRANSIENT_NETWORK: "Temporary network problem",
  TRANSIENT_MODEM: "Temporary modem problem on the phone",
  BLOCKED_CONFIGURATION: "Blocked by the phone’s configuration",
  PERMANENT: "Permanent failure",
  UNKNOWN_SEND_OUTCOME: "Unknown — the phone couldn’t confirm whether it was sent",
  UNKNOWN: "Unknown",
};

const at = (iso: string | null) => (iso ? formatDateTime(iso) : null);

export default async function MessagePage({ params }: PageProps<"/messages/[id]">) {
  await requireUser();
  const { id } = await params;
  const result = await getMessage(id);
  if (!result.ok && result.reason === "not_found") notFound();

  const back = (
    <Link href="/messages" className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" aria-hidden />
      Messages
    </Link>
  );

  if (!result.ok) {
    return (
      <>
        {back}
        <PageHeader title="Message" description="Status and delivery details." />
        <Card>{result.reason === "forbidden" ? <MessagesForbidden /> : <MessagesUnavailable title="Couldn’t load this message" />}</Card>
      </>
    );
  }

  const { status: s, message: m } = result.data;
  const now = new Date();
  const refresh = IN_FLIGHT.includes(s.status) ? 15 : WAITING.includes(s.status) ? 30 : null;
  const cancellable = m && s.status === "scheduled" && m.schedule && isCancellable({ status: s.status, schedule: m.schedule }, now);

  return (
    <>
      {back}
      <PageHeader
        title={m ? `SMS to ${m.to}` : "Message"}
        description={MESSAGE_STATUS[s.status].description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <MessageStatusBadge status={s.status} />
            {cancellable && m.schedule && (
              <CancelScheduledButton messageId={s.id} recipient={m.to} when={formatSchedule(m.schedule)} recurring={!!m.recurrence} size="default" />
            )}
          </div>
        }
      />
      {refresh && <AutoRefresh seconds={refresh} />}

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        <Card className="min-[900px]:col-span-2">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            {m ? (
              <div className="flex flex-col gap-4">
                <p className="m-0 rounded-lg border border-border bg-muted px-4 py-3 text-[13px] break-words whitespace-pre-wrap">{m.body}</p>
                <FieldList className="min-[900px]:grid-cols-3">
                  <Field label="Recipient">
                    <Mono>{m.to}</Mono>
                  </Field>
                  <Field label="SIM">SIM {m.simSlot}</Field>
                  <Field label="Created">{formatDateTime(m.createdAt)}</Field>
                </FieldList>
              </div>
            ) : (
              <p className="m-0 flex gap-2 text-[13px] text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                The recipient and text aren’t available for this message. UnliSMS only returns them for your 100 most recent SMS, and not for
                messages removed from history in the app.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Status</CardTitle>
              <CardDescription>{refresh ? `Updates every ${refresh} seconds while this page is open.` : "Final status."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FieldList>
              <Field label="Current status">
                <MessageStatusBadge status={s.status} />
              </Field>
              <Field label="Delivery">{deliveryText(s.status)}</Field>
              <Field label="Queued">{at(s.queuedAt) ?? (s.status === "scheduled" ? "Not yet" : s.status === "cancelled" ? "Never" : null)}</Field>
              {(s.sentAt || notYet(s.status)) && <Field label="Sent">{at(s.sentAt) ?? notYet(s.status)}</Field>}
              {(s.deliveredAt || notYet(s.status)) && <Field label="Delivered">{at(s.deliveredAt) ?? notYet(s.status)}</Field>}
              {s.failedAt && <Field label="Failed">{formatDateTime(s.failedAt)}</Field>}
              <Field label="Send attempts">{formatNumber(s.attemptCount)}</Field>
              <Field label="Last updated">{formatDateTime(s.updatedAt)}</Field>
              {s.errorClassification && (
                <Field label="Failure reason" wide>
                  {FAILURE[s.errorClassification]}
                </Field>
              )}
            </FieldList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {m?.schedule ? (
              <FieldList className="min-[480px]:grid-cols-1">
                <Field label="Scheduled for">{formatSchedule(m.schedule)}</Field>
                {m.recurrence && <Field label="Repeats">{formatRecurrence(m.recurrence)}</Field>}
              </FieldList>
            ) : (
              <p className="m-0 text-[13px] text-muted-foreground">{m ? "Sent immediately; not scheduled." : "Not available for this message."}</p>
            )}
          </CardContent>
        </Card>

        <Card className="min-[900px]:col-span-2">
          <CardContent className="pt-4">
            <FieldList>
              <Field label="Message ID" wide>
                <Mono>{s.id}</Mono>
              </Field>
            </FieldList>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/** What's known about delivery, without implying success the carrier hasn't reported. */
function deliveryText(status: MessageStatus) {
  switch (status) {
    case "delivered":
      return "Delivered — confirmed by the carrier";
    case "sent":
      return "Pending — no delivery report from the carrier yet";
    case "failed":
    case "expired":
    case "blocked":
      return "Not delivered";
    case "cancelled":
      return "Not sent — cancelled";
    case "unknown":
      return "Unknown";
    default:
      return "Pending — not sent yet";
  }
}

/** "Not yet" while the message can still get there; Unknown (null) otherwise. */
const notYet = (status: MessageStatus) =>
  ["scheduled", "queued", "claimed", "sending", "retry_waiting", "sent"].includes(status) ? "Not yet" : null;
