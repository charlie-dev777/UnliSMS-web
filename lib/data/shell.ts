// Data for the portal shells (sidebar badges, plan card). Gateway counts and the plan card's
// subscription are live; notifications and the admin shell are still mock.
import type { AdminShellData, Organization, User, UserShellData } from "@/lib/types";
import { createAdminDashboardMock, mockSystemHealth } from "@/lib/mock-data";
import { listGateways } from "./gateways";
import { getSubscription } from "./subscription";

export async function getUserShell(user: User, organization: Organization): Promise<UserShellData> {
  // Shares the page's request via React cache(), so the dashboard doesn't fetch twice.
  const [gateways, subscription] = await Promise.all([listGateways(), getSubscription()]);
  return {
    user,
    organization,
    gateways: gateways.ok
      ? { online: gateways.data.filter((g) => g.presence === "online").length, total: gateways.data.length }
      : null,
    subscription: subscription.ok ? subscription.data : null,
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
