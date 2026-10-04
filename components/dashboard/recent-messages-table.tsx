import { MessageSquare } from "lucide-react";
import type { Message } from "@/lib/types";
import { formatClockTime } from "@/lib/format";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { MessageStatusBadge } from "@/components/status";
import { ViewAllLink } from "./view-all-link";

const DIRECTION = { outbound: "Outbound", inbound: "Inbound" } as const;

export function RecentMessagesTable({ messages }: { messages: Message[] }) {
  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <CardTitle>Recent messages</CardTitle>
          <CardDescription>Latest outbound and inbound SMS</CardDescription>
        </div>
        <CardAction>
          <ViewAllLink href="/messages" outline>
            View all messages
          </ViewAllLink>
        </CardAction>
      </CardHeader>

      {messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="SMS you send or receive through your gateways will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Gateway · SIM</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-[12.5px]">{m.phoneNumber}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{DIRECTION[m.direction]}</TableCell>
                <TableCell className="max-w-80 overflow-hidden text-ellipsis text-foreground-2" title={m.body}>
                  {m.body}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{m.gatewayName}</span>
                  <span className="text-xs text-muted-foreground"> · SIM {m.simSlot}</span>
                </TableCell>
                <TableCell>
                  <MessageStatusBadge status={m.status} />
                </TableCell>
                <TableCell className="num text-right text-xs text-muted-foreground">
                  <time dateTime={m.createdAt}>{formatClockTime(m.createdAt)}</time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
