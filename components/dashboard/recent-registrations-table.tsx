import Link from "next/link";
import { CheckCircle2, Clock, UserPlus } from "lucide-react";
import type { Registration } from "@/lib/types";
import { formatRelativeTime, initials } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback";
import { PlanBadge } from "@/components/status";
import { ViewAllLink } from "./view-all-link";

export function RecentRegistrationsTable({ registrations, newThisWeek, now }: { registrations: Registration[]; newThisWeek: number; now: Date }) {
  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <CardTitle>Recent signups</CardTitle>
          <CardDescription>
            {newThisWeek} new account{newThisWeek === 1 ? "" : "s"} this week
          </CardDescription>
        </div>
        <CardAction>
          <ViewAllLink href="/admin/users">View all users</ViewAllLink>
        </CardAction>
      </CardHeader>

      {registrations.length === 0 ? (
        <EmptyState icon={UserPlus} title="No signups yet" description="New accounts show up here as soon as they register." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Gateways</TableHead>
              <TableHead className="text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((u) => (
              <TableRow key={u.userId}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={initials(u.name)} />
                    <div className="flex flex-col leading-[18px]">
                      <Link href="/admin/users" className="font-medium text-foreground hover:underline">
                        {u.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PlanBadge tier={u.plan} />
                </TableCell>
                <TableCell>
                  {u.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-success-foreground">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell className="num text-right">{u.gatewayCount}</TableCell>
                <TableCell className="num text-right text-xs text-muted-foreground">{formatRelativeTime(u.createdAt, now)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
