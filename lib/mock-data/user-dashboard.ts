import type { DailyVolume, DashboardMetrics, Message, UserDashboardData, WebhookDelivery } from "@/lib/types";
import { ago, lastDays } from "./time";

const SENT = [1620, 1710, 1580, 1840, 1920, 1490, 1380, 1690, 1760, 1810, 1950, 2040, 1720, 1560];
const RECEIVED = [410, 460, 390, 520, 480, 350, 300, 440, 470, 510, 530, 560, 420, 380];

const metrics: DashboardMetrics = {
  periodDays: 7,
  smsSent: 12_480,
  smsSentChangePct: 8.2,
  smsDelivered: 12_031,
  smsPending: 268,
  smsFailed: 181,
  deliveryRateChangePts: 0.6,
  smsReceived: 3_214,
  smsReceivedChangePct: 3.1,
  webhookDeliveries: 6_010,
  webhookFailures: 23,
  callsAnswered: 842,
  callsMissed: 57,
};

function messages(now: Date): Message[] {
  const m = (
    id: string,
    direction: Message["direction"],
    phoneNumber: string,
    body: string,
    [gatewayId, gatewayName]: [string, string],
    simSlot: 1 | 2,
    status: Message["status"],
    minAgo: number,
  ): Message => ({ id, direction, phoneNumber, body, gatewayId, gatewayName, simSlot, status, createdAt: ago(now, { min: minAgo }) });
  const office: [string, string] = ["gw_8f2k3x91a", "Office Pixel 7"];
  const warehouse: [string, string] = ["gw_2m7q4c0dz", "Warehouse A54"];
  const cebu: [string, string] = ["gw_5r1t8v6kb", "Cebu Branch"];
  return [
    m("msg_01", "outbound", "+63 917 555 0142", "Your verification code is 482913. It expires in 5 minutes.", office, 1, "delivered", 2),
    m("msg_02", "inbound", "+63 918 555 0199", "Yes, please confirm my appointment for Friday.", office, 2, "received", 5),
    m("msg_03", "outbound", "+63 999 555 0117", "Hi Ana, your order #10482 has been shipped and arrives tomorrow.", warehouse, 1, "sent", 7),
    m("msg_04", "outbound", "+63 991 555 0163", "Reminder: your payment of ₱1,250 is due on Oct 5.", cebu, 1, "pending", 13),
    m("msg_05", "outbound", "+63 905 555 0128", "Your verification code is 113027. It expires in 5 minutes.", cebu, 2, "failed", 20),
    m("msg_06", "outbound", "+63 927 555 0171", "Thanks for visiting! Reply STOP to unsubscribe from updates.", warehouse, 1, "delivered", 26),
  ];
}

function webhookDeliveries(now: Date): WebhookDelivery[] {
  const sms = { webhookId: "wh_api", url: "https://api.acme.ph/hooks/sms" };
  const crm = { webhookId: "wh_crm", url: "https://crm.acme.ph/webhooks" };
  return [
    { id: "whd_06", ...sms, event: "message.delivered", responseStatus: 200, state: "succeeded", attemptedAt: ago(now, { min: 2 }) },
    { id: "whd_05", ...sms, event: "message.received", responseStatus: 200, state: "succeeded", attemptedAt: ago(now, { min: 4 }) },
    { id: "whd_04", ...crm, event: "call.missed", responseStatus: 503, state: "retrying", attemptedAt: ago(now, { min: 9 }) },
    { id: "whd_03", ...sms, event: "message.failed", responseStatus: 200, state: "succeeded", attemptedAt: ago(now, { min: 18 }) },
    { id: "whd_02", ...crm, event: "gateway.offline", responseStatus: 500, state: "failed", attemptedAt: ago(now, { hr: 3 }) },
    { id: "whd_01", ...sms, event: "message.delivered", responseStatus: 200, state: "succeeded", attemptedAt: ago(now, { hr: 3, min: 6 }) },
  ];
}

const activity = (now: Date): DailyVolume[] =>
  lastDays(now, SENT.length).map((date, i) => ({ date, outbound: SENT[i], inbound: RECEIVED[i] }));

export function createUserDashboardMock(now: Date): UserDashboardData {
  return {
    generatedAt: now.toISOString(),
    metrics,
    activity: activity(now),
    messages: messages(now),
    webhookDeliveries: webhookDeliveries(now),
  };
}

/** A brand-new account: nothing paired, nothing sent. */
export function createEmptyUserDashboardMock(now: Date): UserDashboardData {
  return {
    generatedAt: now.toISOString(),
    metrics: null,
    activity: lastDays(now, 14).map((date) => ({ date, outbound: 0, inbound: 0 })),
    messages: [],
    webhookDeliveries: [],
  };
}

