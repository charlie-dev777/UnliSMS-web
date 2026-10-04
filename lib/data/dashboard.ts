// Data access for the dashboards. Phase 1 serves typed mock data; swap each
// function body for the UnliSMS API client when it exists. Pages and
// components only depend on the return types in `@/lib/types`.
import type { AdminDashboardData, UserDashboardData } from "@/lib/types";
import {
  applyScenario,
  createAdminDashboardMock,
  createEmptyAdminDashboardMock,
  createEmptyUserDashboardMock,
  createUserDashboardMock,
  type MockScenario,
} from "@/lib/mock-data";

type LoadOptions = { scenario?: MockScenario };

export async function getUserDashboard(_userId: string, { scenario = "default" }: LoadOptions = {}): Promise<UserDashboardData> {
  await applyScenario(scenario);
  const now = new Date();
  return scenario === "empty" ? createEmptyUserDashboardMock(now) : createUserDashboardMock(now);
}

export async function getAdminDashboard({ scenario = "default" }: LoadOptions = {}): Promise<AdminDashboardData> {
  await applyScenario(scenario);
  const now = new Date();
  return scenario === "empty" ? createEmptyAdminDashboardMock(now) : createAdminDashboardMock(now);
}
