import type { DailyVolume, DashboardMetrics, GatewayFleetHealth, PlatformMetrics, Registration } from "./metrics";
import type { Subscription } from "./subscription";
import type { FailureEvent, SystemHealth } from "./system";
import type { User } from "./user";
import type { WebhookDelivery } from "./webhook";

/** Everything the user /dashboard renders. */
export interface UserDashboardData {
  generatedAt: string; // ISO 8601; relative times are measured from here
  metrics: DashboardMetrics | null;
  activity: DailyVolume[];
  webhookDeliveries: WebhookDelivery[];
}

/** Everything /admin/dashboard renders. */
export interface AdminDashboardData {
  generatedAt: string;
  metrics: PlatformMetrics | null;
  activity: DailyVolume[];
  system: SystemHealth;
  registrations: Registration[];
  fleet: GatewayFleetHealth | null;
  failures: FailureEvent[];
}

/** What the user portal shell (sidebar, header) needs. */
export interface UserShellData {
  user: User;
  subscription: Subscription;
  /** Live counts for the nav badge; null when the API refused or failed the read. */
  gateways: { online: number; total: number } | null;
  hasUnreadNotifications: boolean;
}

/** What the admin portal shell needs. */
export interface AdminShellData {
  user: User;
  failedWebhooks24h: number;
  degradedServices: number;
}
