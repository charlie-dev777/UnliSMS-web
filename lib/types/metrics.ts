import type { PlanTier } from "./subscription";

/** One day of message volume for the activity chart. */
export interface DailyVolume {
  date: string; // YYYY-MM-DD, Asia/Manila
  outbound: number;
  inbound: number;
}

/** User portal headline numbers for the selected period. */
export interface DashboardMetrics {
  periodDays: number;
  smsSent: number;
  smsSentChangePct: number;
  smsDelivered: number;
  smsPending: number;
  smsFailed: number;
  deliveryRateChangePts: number;
  smsReceived: number;
  smsReceivedChangePct: number;
  webhookDeliveries: number;
  webhookFailures: number;
  callsAnswered: number;
  callsMissed: number;
}

/** Admin portal platform-wide numbers. */
export interface PlatformMetrics {
  totalUsers: number;
  newUsersThisWeek: number;
  activeUsers30d: number;
  activeSubscriptions: number;
  messagesToday: number;
  messagesTodayChangePct: number;
  deliveryRatePct: number;
  deliveryRateChangePts: number;
  failedSms24h: number;
  failedWebhooks24h: number;
}

export interface GatewayFleetHealth {
  online: number;
  offlineUnder24h: number;
  offlineOver24h: number;
  avgHeartbeatSec: number;
  fcmSuccessPct: number;
}

export interface Registration {
  userId: string;
  name: string;
  email: string;
  plan: PlanTier;
  emailVerified: boolean;
  gatewayCount: number;
  createdAt: string; // ISO 8601
}
