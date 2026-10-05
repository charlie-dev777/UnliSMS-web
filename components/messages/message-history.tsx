import Link from "next/link";
import { ChevronRight, Repeat } from "lucide-react";
import type { OutboundMessage } from "@/lib/types";
import { parseLocalTimeString, zonedWallTimeToEpoch } from "@/lib/messages/compose";
import { MessageStatusBadge } from "@/components/status";
import { Timestamp } from "@/components/gateways";
import { CancelScheduledButton } from "./cancel-scheduled-button";
import { formatRecurrence, formatSchedule, messagePreview } from "./message-format";

/** Whether the API will still accept a cancel: `scheduled` and its time hasn't passed. */
export function isCancellable(m: Pick<OutboundMessage, "status" | "schedule">, now: Date) {
  if (m.status !== "scheduled" || !m.schedule) return false;
  const wall = parseLocalTimeString(m.schedule.localTime);
  const at = wall && zonedWallTimeToEpoch(wall, m.schedule.timeZone);
  // If the instant can't be computed here, let the API decide.
  return !at || !at.ok || at.epochMs > now.getTime();
}

/** The one timestamp that best describes where a message is. */
function RowTime({ m, now }: { m: OutboundMessage; now: Date }) {
  if (m.status === "scheduled" && m.schedule) return <>Scheduled for {formatSchedule(m.schedule)}</>;
  if (m.sentAt) {
    return (
      <>
        Sent <Timestamp iso={m.sentAt} now={now} />
      </>
    );
  }
  if (m.queuedAt) {
    return (
      <>
        Queued <Timestamp iso={m.queuedAt} now={now} />
      </>
    );
  }
  return (
    <>
      Created <Timestamp iso={m.createdAt} now={now} />
    </>
  );
}

/** The organization's recent outbound SMS as rows linking to their detail page. */
export function MessageHistory({ messages, now, highlightId }: { messages: OutboundMessage[]; now: Date; highlightId?: string }) {
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
      {messages.map((m) => (
        <li
          key={m.id}
          className={
            m.id === highlightId ? "relative bg-accent/60 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary" : undefined
          }
        >
          <div className="flex flex-col gap-2 px-5 py-3.5 min-[641px]:flex-row min-[641px]:items-center min-[641px]:gap-4">
            <Link href={`/messages/${m.id}`} className="group flex min-w-0 flex-1 flex-col gap-1 focus-visible:outline-none">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[13px] font-medium break-all group-hover:underline group-focus-visible:underline">{m.to}</span>
                <MessageStatusBadge status={m.status} />
              </div>
              <p className="m-0 truncate text-[13px] text-foreground-2" title={m.body}>
                {messagePreview(m.body)}
              </p>
              <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span>SIM {m.simSlot}</span>
                <span aria-hidden>·</span>
                <span>
                  <RowTime m={m} now={now} />
                </span>
                {m.recurrence && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Repeat className="size-3" aria-hidden />
                      {formatRecurrence(m.recurrence)}
                    </span>
                  </>
                )}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              {isCancellable(m, now) && m.schedule && (
                <CancelScheduledButton messageId={m.id} recipient={m.to} when={formatSchedule(m.schedule)} recurring={!!m.recurrence} />
              )}
              <ChevronRight className="hidden size-4 text-muted-foreground min-[641px]:block" aria-hidden />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
