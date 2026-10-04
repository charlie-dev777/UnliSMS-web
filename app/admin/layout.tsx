import { requireAdmin } from "@/lib/auth/session";
import { getAdminShell } from "@/lib/data/shell";
import type { NavBadges } from "@/components/layout/nav";
import { AppShell } from "@/components/layout/app-shell";
import { formatNumber } from "@/lib/format";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const shell = await getAdminShell(user);

  const badges: NavBadges = {};
  if (shell.failedWebhooks24h > 0) badges["/admin/webhooks"] = { kind: "alert", text: formatNumber(shell.failedWebhooks24h) };
  if (shell.degradedServices > 0) {
    badges["/admin/system"] = { kind: "warning", label: `${shell.degradedServices} service${shell.degradedServices === 1 ? "" : "s"} degraded` };
  }

  return (
    <AppShell portal="admin" user={user} badges={badges}>
      {children}
    </AppShell>
  );
}
