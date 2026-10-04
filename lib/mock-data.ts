// Mock data copied from the design canvas. Replace these with calls to the
// UnliSMS Laravel API when wiring the screens up.
import type { BadgeVariant } from "@/components/ui/badge";

export type DailyVolume = { label: string; a: number; b: number };

const dayLabels = ["Sep 19", "Sep 20", "Sep 21", "Sep 22", "Sep 23", "Sep 24", "Sep 25", "Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 1", "Oct 2"];

const zip = (a: number[], b: number[]): DailyVolume[] => dayLabels.map((label, i) => ({ label, a: a[i], b: b[i] }));

/* ---------------------------------- User --------------------------------- */

export const currentUser = { name: "Maria Reyes", subtitle: "maria@acme.ph", initials: "MR" };

export const plan = { name: "Starter plan", used: 12480, limit: 20000 };

export const userStats = {
  sent: { value: 12480, change: "+8.2%" },
  delivered: { value: 12031, rate: "96.4%" },
  received: { value: 3214, change: "+3.1%" },
  webhook: { rate: "99.6%", ok: 5987, total: 6010 },
  answeredCalls: 842,
  missedCalls: 57,
  failedSms: { value: 181, pct: "1.5%" },
  failedWebhooks: { value: 23, pct: "0.4%" },
};

export const userActivity = zip(
  [1620, 1710, 1580, 1840, 1920, 1490, 1380, 1690, 1760, 1810, 1950, 2040, 1720, 1560],
  [410, 460, 390, 520, 480, 350, 300, 440, 470, 510, 530, 560, 420, 380],
);

export const deliveryBreakdown = {
  rate: "96.4%",
  change: "+0.6 pts",
  segments: [
    { label: "Delivered", value: 12031, pct: 96.4, color: "var(--primary)" },
    { label: "Pending", value: 268, pct: 2.1, color: "var(--accent)" },
    { label: "Failed", value: 181, pct: 1.5, color: "var(--danger)" },
  ],
};

export type Sim = { carrier: string; number: string; signal: number } | null;
export type Gateway = { name: string; model: string; online: boolean; sim1: Sim; sim2: Sim; lastSeen: string };

export const gateways: Gateway[] = [
  { name: "Office Pixel 7", model: "Pixel 7 · Android 14", online: true, sim1: { carrier: "Globe", number: "+63 917 ••• 4821", signal: 4 }, sim2: { carrier: "Smart", number: "+63 918 ••• 1907", signal: 3 }, lastSeen: "Just now" },
  { name: "Warehouse A54", model: "Galaxy A54 · Android 14", online: true, sim1: { carrier: "Smart", number: "+63 919 ••• 3310", signal: 4 }, sim2: null, lastSeen: "12 sec ago" },
  { name: "Cebu Branch", model: "Redmi Note 12 · Android 13", online: true, sim1: { carrier: "DITO", number: "+63 991 ••• 6624", signal: 1 }, sim2: { carrier: "Globe", number: "+63 927 ••• 0458", signal: 3 }, lastSeen: "48 sec ago" },
  { name: "Backup Moto", model: "Moto G54 · Android 13", online: false, sim1: { carrier: "Globe", number: "+63 905 ••• 7712", signal: 0 }, sim2: null, lastSeen: "3 hr ago" },
];

export type WebhookEvent = { event: string; host: string; time: string; code: string; state: "ok" | "retry" | "fail" };

export const webhookEvents: WebhookEvent[] = [
  { event: "message.delivered", host: "api.acme.ph/hooks/sms", time: "2 min ago", code: "200", state: "ok" },
  { event: "message.received", host: "api.acme.ph/hooks/sms", time: "4 min ago", code: "200", state: "ok" },
  { event: "call.missed", host: "crm.acme.ph/webhooks", time: "9 min ago", code: "503", state: "retry" },
  { event: "message.failed", host: "api.acme.ph/hooks/sms", time: "18 min ago", code: "200", state: "ok" },
  { event: "gateway.offline", host: "crm.acme.ph/webhooks", time: "3 hr ago", code: "500", state: "fail" },
  { event: "message.delivered", host: "api.acme.ph/hooks/sms", time: "3 hr ago", code: "200", state: "ok" },
];

export type MessageStatus = "Delivered" | "Received" | "Sent" | "Pending" | "Failed";
export const messageStatusVariant: Record<MessageStatus, BadgeVariant> = {
  Delivered: "success",
  Received: "info",
  Sent: "neutral",
  Pending: "warning",
  Failed: "danger",
};

export type Message = { number: string; direction: "Outbound" | "Inbound"; body: string; gateway: string; sim: string; status: MessageStatus; time: string };

export const recentMessages: Message[] = [
  { number: "+63 917 555 0142", direction: "Outbound", body: "Your verification code is 482913. It expires in 5 minutes.", gateway: "Office Pixel 7", sim: "SIM 1", status: "Delivered", time: "10:42 AM" },
  { number: "+63 918 555 0199", direction: "Inbound", body: "Yes, please confirm my appointment for Friday.", gateway: "Office Pixel 7", sim: "SIM 2", status: "Received", time: "10:39 AM" },
  { number: "+63 999 555 0117", direction: "Outbound", body: "Hi Ana, your order #10482 has been shipped and arrives tomorrow.", gateway: "Warehouse A54", sim: "SIM 1", status: "Sent", time: "10:37 AM" },
  { number: "+63 991 555 0163", direction: "Outbound", body: "Reminder: your payment of ₱1,250 is due on Oct 5.", gateway: "Cebu Branch", sim: "SIM 1", status: "Pending", time: "10:31 AM" },
  { number: "+63 905 555 0128", direction: "Outbound", body: "Your verification code is 113027. It expires in 5 minutes.", gateway: "Cebu Branch", sim: "SIM 2", status: "Failed", time: "10:24 AM" },
  { number: "+63 927 555 0171", direction: "Outbound", body: "Thanks for visiting! Reply STOP to unsubscribe from updates.", gateway: "Warehouse A54", sim: "SIM 1", status: "Delivered", time: "10:18 AM" },
];

/* --------------------------------- Admin --------------------------------- */

export const adminUser = { name: "Jun Cruz", subtitle: "Platform admin", initials: "JC" };

export const adminStats = {
  totalUsers: { value: 4812, change: "+64" },
  activeUsers: { value: 2904, note: "60.3% active in last 30 days" },
  messagesToday: { value: 186240, change: "+5.4%" },
  deliveryRate: { value: "97.1%", change: "−0.3 pts" },
  onlineGateways: 1248,
  offlineGateways: 86,
  failedWebhooks24h: 312,
  activeSubscriptions: 1106,
};

/** Values in thousands. */
export const platformActivity = zip(
  [158, 164, 151, 172, 181, 149, 138, 166, 174, 179, 188, 196, 170, 162],
  [38, 41, 36, 44, 46, 33, 29, 40, 43, 45, 48, 51, 42, 39],
);

export type Service = { name: string; meta: string; status: "Operational" | "Degraded" | "Outage"; uptime: string; bad: number[]; warn: number[] };

export const services: Service[] = [
  { name: "API", meta: "p95 84 ms", status: "Operational", uptime: "99.99%", bad: [], warn: [] },
  { name: "Database", meta: "p95 6 ms", status: "Operational", uptime: "99.98%", bad: [], warn: [17] },
  { name: "FCM", meta: "elevated latency", status: "Degraded", uptime: "99.71%", bad: [], warn: [26, 28, 29] },
  { name: "Webhook worker", meta: "42 retries queued", status: "Operational", uptime: "99.95%", bad: [9], warn: [] },
  { name: "Queue", meta: "1,284 pending", status: "Operational", uptime: "99.99%", bad: [], warn: [] },
];

export type Signup = { initials: string; name: string; email: string; plan: "Free" | "Starter" | "Business"; verified: boolean; gateways: number; joined: string };

export const recentSignups: Signup[] = [
  { initials: "AS", name: "Andrea Santos", email: "andrea@kapehan.ph", plan: "Business", verified: true, gateways: 3, joined: "12 min ago" },
  { initials: "RD", name: "Rafael Dizon", email: "rafael.dizon@gmail.com", plan: "Free", verified: false, gateways: 0, joined: "1 hr ago" },
  { initials: "LT", name: "Lea Tan", email: "lea@clinicaverde.com", plan: "Starter", verified: true, gateways: 1, joined: "3 hr ago" },
  { initials: "MB", name: "Marco Bautista", email: "ops@fastcourier.ph", plan: "Business", verified: true, gateways: 8, joined: "Yesterday" },
  { initials: "KG", name: "Kim Garcia", email: "kim.garcia@outlook.com", plan: "Free", verified: false, gateways: 0, joined: "Yesterday" },
];

export const gatewayHealth = {
  registered: 1334,
  onlinePct: "93.6%",
  segments: [
    { label: "Online", value: 1248, pct: 93.6, color: "var(--success)" },
    { label: "Offline < 24h", value: 45, pct: 3.4, color: "var(--accent)" },
    { label: "Offline > 24h", value: 41, pct: 3.0, color: "var(--offline)" },
  ],
  avgHeartbeat: "28 s",
  fcmSuccess: "98.7%",
};

export type Failure = { type: "Webhook" | "SMS" | "FCM" | "Gateway"; detail: string; user: string; code: string; time: string };

export const recentFailures: Failure[] = [
  { type: "Webhook", detail: "POST crm.fastcourier.ph/hooks timed out after 10s (attempt 3 of 5)", user: "Marco Bautista", code: "ETIMEDOUT", time: "10:41 AM" },
  { type: "SMS", detail: "Send to +63 905 555 0128 rejected by carrier", user: "Maria Reyes", code: "RESULT_ERROR_GENERIC_FAILURE", time: "10:24 AM" },
  { type: "FCM", detail: "Push to gateway gw_8f2k…a91 not acknowledged", user: "Lea Tan", code: "UNAVAILABLE", time: "10:19 AM" },
  { type: "Gateway", detail: "Backup Moto missed 6 consecutive heartbeats", user: "Maria Reyes", code: "HEARTBEAT_LOST", time: "10:02 AM" },
  { type: "Webhook", detail: "POST api.kapehan.ph/sms returned 500", user: "Andrea Santos", code: "HTTP_500", time: "9:58 AM" },
];

export const fmt = (n: number) => n.toLocaleString("en-US");
