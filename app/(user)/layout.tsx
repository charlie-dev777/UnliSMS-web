import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getUserShell } from "@/lib/data/shell";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { PlanUsageCard } from "@/components/layout/plan-usage-card";

export default async function UserPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const shell = await getUserShell(user);

  return (
    <AppShell
      portal="user"
      user={user}
      badges={shell.gateways ? { "/gateways": { kind: "count", text: `${shell.gateways.online}/${shell.gateways.total}` } } : undefined}
      unreadNotifications={shell.hasUnreadNotifications}
      sidebarFooter={<PlanUsageCard subscription={shell.subscription} />}
      headerActions={
        <Button asChild variant="ghost" size="sm" className="text-foreground-2">
          <Link href="/docs">API docs</Link>
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
