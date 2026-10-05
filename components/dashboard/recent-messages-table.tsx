import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { ApiResult, OutboundMessage } from "@/lib/types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { MessageStatusBadge } from "@/components/status";
import { Timestamp } from "@/components/gateways";
import { formatSchedule, MessagesForbidden, MessagesUnavailable, messagePreview } from "@/components/messages";
import { ViewAllLink } from "./view-all-link";

const LIMIT = 6;

/** The latest outbound SMS, live from the OnSim API. */
export function RecentMessagesTable({ result, now }: { result: ApiResult<OutboundMessage[]>; now: Date }) {
  const messages = result.ok ? result.data.slice(0, LIMIT) : [];

  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <CardTitle>Recent messages</CardTitle>
          <CardDescription>Latest outbound SMS, scheduled first</CardDescription>
        </div>
        <CardAction>
          <ViewAllLink href="/messages" outline>
            View all messages
          </ViewAllLink>
        </CardAction>
      </CardHeader>

      {!result.ok ? (
        result.reason === "forbidden" ? (
          <MessagesForbidden />
        ) : (
          <MessagesUnavailable />
        )
      ) : messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="SMS you send or schedule through your gateways will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>SIM</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-[12.5px]">
                  <Link href={`/messages/${m.id}`} className="hover:underline">
                    {m.to}
                  </Link>
                </TableCell>
                <TableCell className="max-w-80 overflow-hidden text-ellipsis text-foreground-2" title={m.body}>
                  {messagePreview(m.body)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">SIM {m.simSlot}</TableCell>
                <TableCell>
                  <MessageStatusBadge status={m.status} />
                </TableCell>
                <TableCell className="num text-right text-xs text-muted-foreground">
                  {m.status === "scheduled" && m.schedule ? (
                    formatSchedule(m.schedule)
                  ) : (
                    <Timestamp iso={m.sentAt ?? m.createdAt} now={now} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
