import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { FailureEvent, FailureKind } from "@/lib/types";
import { formatClockTime } from "@/lib/format";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { StatusBadge } from "@/components/status";
import { ViewAllLink } from "./view-all-link";

const KIND: Record<FailureKind, string> = { webhook: "Webhook", sms: "SMS", fcm: "FCM", gateway: "Gateway" };

export function RecentFailuresTable({ failures }: { failures: FailureEvent[] }) {
  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <CardTitle>Recent failures</CardTitle>
          <CardDescription>SMS, webhook, gateway and push errors in the last hour</CardDescription>
        </div>
        <CardAction>
          <ViewAllLink href="/admin/system" outline>
            View system log
          </ViewAllLink>
        </CardAction>
      </CardHeader>

      {failures.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No failures in the last hour" description="Errors from SMS sends, webhooks, gateways and FCM pushes will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failures.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <StatusBadge tone="neutral" label={KIND[f.kind]} />
                </TableCell>
                <TableCell className="max-w-[360px] overflow-hidden text-ellipsis text-foreground-2" title={f.detail}>
                  {f.detail}
                </TableCell>
                <TableCell>
                  <Link href="/admin/users" className="text-foreground hover:underline">
                    {f.userName}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-[12.5px] text-destructive">{f.errorCode}</span>
                </TableCell>
                <TableCell className="num text-right text-xs text-muted-foreground">
                  <time dateTime={f.occurredAt}>{formatClockTime(f.occurredAt)}</time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
