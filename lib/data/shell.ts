// Data for the portal shells (sidebar badges, plan usage). Gateway counts are live;
// subscription, notifications and the admin shell are still mock.
import type { AdminShellData, User, UserShellData } from "@/lib/types";
import { createAdminDashboardMock, mockSubscription, mockSystemHealth } from "@/lib/mock-data";
import { listGateways } from "./gateways";

export async function getUserShell(user: User): Promise<UserShellData> {
  // Shares the page's request via React cache(), so the dashboard doesn't fetch twice.
  const gateways = await listGateways();
  return {
    user,
    subscription: mockSubscription(user.id),
    gateways: gateways.ok
      ? { online: gateways.data.filter((g) => g.presence === "online").length, total: gateways.data.length }
      : null,
    hasUnreadNotifications: true,
  };
}

export async function getAdminShell(user: User): Promise<AdminShellData> {
  return {
    user,
    failedWebhooks24h: createAdminDashboardMock(new Date()).metrics?.failedWebhooks24h ?? 0,
    degradedServices: mockSystemHealth.services.filter((s) => s.status !== "operational").length,
  };
}
