import type {
  AdminDashboardData,
  DailyVolume,
  FailureEvent,
  GatewayFleetHealth,
  PlatformMetrics,
  Registration,
  ServiceHealth,
  ServiceStatus,
  SystemHealth,
} from "@/lib/types";
import { ago, lastDays } from "./time";

const OUTBOUND = [158, 164, 151, 172, 181, 149, 138, 166, 174, 179, 188, 196, 170, 162].map((k) => k * 1000);
const INBOUND = [38, 41, 36, 44, 46, 33, 29, 40, 43, 45, 48, 51, 42, 39].map((k) => k * 1000);

const metrics: PlatformMetrics = {
  totalUsers: 4_812,
  newUsersThisWeek: 64,
  activeUsers30d: 2_904,
  activeSubscriptions: 1_106,
  messagesToday: 186_240,
  messagesTodayChangePct: 5.4,
  deliveryRatePct: 97.1,
  deliveryRateChangePts: -0.3,
  failedSms24h: 2_918,
  failedWebhooks24h: 312,
};

const fleet: GatewayFleetHealth = {
  online: 1_248,
  offlineUnder24h: 45,
  offlineOver24h: 41,
  avgHeartbeatSec: 28,
  fcmSuccessPct: 98.7,
};

const WINDOW_DAYS = 30;

/** 30 daily statuses, operational except the given day indexes (0 = oldest). */
function daily(outage: number[] = [], degraded: number[] = []): ServiceStatus[] {
  return Array.from({ length: WINDOW_DAYS }, (_, i) =>
    outage.includes(i) ? "outage" : degraded.includes(i) ? "degraded" : "operational",
  );
}

const services: ServiceHealth[] = [
  { id: "api", name: "API", detail: "p95 84 ms", status: "operational", uptimePct: 99.99, daily: daily() },
  { id: "db", name: "Database", detail: "p95 6 ms", status: "operational", uptimePct: 99.98, daily: daily([], [17]) },
  { id: "fcm", name: "FCM", detail: "elevated latency", status: "degraded", uptimePct: 99.71, daily: daily([], [26, 28, 29]) },
  { id: "webhooks", name: "Webhook worker", detail: "42 retries queued", status: "operational", uptimePct: 99.95, daily: daily([9]) },
  { id: "queue", name: "Queue", detail: "1,284 pending", status: "operational", uptimePct: 99.99, daily: daily() },
];

export const mockSystemHealth: SystemHealth = { windowDays: WINDOW_DAYS, services };

function registrations(now: Date): Registration[] {
  return [
    { userId: "usr_asantos", name: "Andrea Santos", email: "andrea@kapehan.ph", plan: "BUSINESS", emailVerified: true, gatewayCount: 3, createdAt: ago(now, { min: 12 }) },
    { userId: "usr_rdizon", name: "Rafael Dizon", email: "rafael.dizon@gmail.com", plan: "FREE", emailVerified: false, gatewayCount: 0, createdAt: ago(now, { hr: 1, min: 4 }) },
    { userId: "usr_ltan", name: "Lea Tan", email: "lea@clinicaverde.com", plan: "STARTER", emailVerified: true, gatewayCount: 1, createdAt: ago(now, { hr: 3, min: 10 }) },
    { userId: "usr_mbautista", name: "Marco Bautista", email: "ops@fastcourier.ph", plan: "BUSINESS", emailVerified: true, gatewayCount: 8, createdAt: ago(now, { days: 1, hr: 2 }) },
    { userId: "usr_kgarcia", name: "Kim Garcia", email: "kim.garcia@outlook.com", plan: "FREE", emailVerified: false, gatewayCount: 0, createdAt: ago(now, { days: 1, hr: 5 }) },
  ];
}

function failures(now: Date): FailureEvent[] {
  return [
    { id: "fail_05", kind: "webhook", detail: "POST crm.fastcourier.ph/hooks timed out after 10s (attempt 3 of 5)", userId: "usr_mbautista", userName: "Marco Bautista", errorCode: "ETIMEDOUT", occurredAt: ago(now, { min: 1 }) },
    { id: "fail_04", kind: "sms", detail: "Send to +63 905 555 0128 rejected by carrier", userId: "usr_mreyes", userName: "Maria Reyes", errorCode: "RESULT_ERROR_GENERIC_FAILURE", occurredAt: ago(now, { min: 18 }) },
    { id: "fail_03", kind: "fcm", detail: "Push to gateway gw_8f2k…a91 not acknowledged", userId: "usr_ltan", userName: "Lea Tan", errorCode: "UNAVAILABLE", occurredAt: ago(now, { min: 23 }) },
    { id: "fail_02", kind: "gateway", detail: "Backup Moto missed 6 consecutive heartbeats", userId: "usr_mreyes", userName: "Maria Reyes", errorCode: "HEARTBEAT_LOST", occurredAt: ago(now, { min: 40 }) },
    { id: "fail_01", kind: "webhook", detail: "POST api.kapehan.ph/sms returned 500", userId: "usr_asantos", userName: "Andrea Santos", errorCode: "HTTP_500", occurredAt: ago(now, { min: 44 }) },
  ];
}

const activity = (now: Date): DailyVolume[] =>
  lastDays(now, OUTBOUND.length).map((date, i) => ({ date, outbound: OUTBOUND[i], inbound: INBOUND[i] }));

export function createAdminDashboardMock(now: Date): AdminDashboardData {
  return {
    generatedAt: now.toISOString(),
    metrics,
    activity: activity(now),
    system: mockSystemHealth,
    registrations: registrations(now),
    fleet,
    failures: failures(now),
  };
}

/** A fresh install: no users, no traffic, services healthy. */
export function createEmptyAdminDashboardMock(now: Date): AdminDashboardData {
  return {
    generatedAt: now.toISOString(),
    metrics: null,
    activity: lastDays(now, 14).map((date) => ({ date, outbound: 0, inbound: 0 })),
    system: mockSystemHealth,
    registrations: [],
    fleet: null,
    failures: [],
  };
}
