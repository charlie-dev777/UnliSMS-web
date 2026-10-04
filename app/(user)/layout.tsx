import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getUserShell } from "@/lib/data/shell";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { PlanUsageCard } from "@/components/layout/plan-usage-card";

export default async function UserPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("USER");
  const shell = await getUserShell(user);

  return (
    <AppShell
      portal="user"
      user={user}
      badges={{ "/gateways": { kind: "count", text: `${shell.gatewaysOnline}/${shell.gatewaysTotal}` } }}
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
