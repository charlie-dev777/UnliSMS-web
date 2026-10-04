// Data for the portal shells (sidebar badges, plan usage). Mock in Phase 1.
import type { AdminShellData, User, UserShellData } from "@/lib/types";
import { createAdminDashboardMock, createMockGateways, mockSubscription, mockSystemHealth } from "@/lib/mock-data";

export async function getUserShell(user: User): Promise<UserShellData> {
  const gateways = createMockGateways(new Date());
  return {
    user,
    subscription: mockSubscription(user.id),
    gatewaysOnline: gateways.filter((g) => g.status === "online").length,
    gatewaysTotal: gateways.length,
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
