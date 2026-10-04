export type ServiceStatus = "operational" | "degraded" | "outage";

export interface ServiceHealth {
  id: string;
  name: string;
  /** Short live detail, e.g. "p95 84 ms" or "42 retries queued". */
  detail: string;
  status: ServiceStatus;
  uptimePct: number;
  /** Worst status per day, oldest first. */
  daily: ServiceStatus[];
}

export interface SystemHealth {
  windowDays: number;
  services: ServiceHealth[];
}

export type FailureKind = "webhook" | "sms" | "fcm" | "gateway";

export interface FailureEvent {
  id: string;
  kind: FailureKind;
  detail: string;
  userId: string;
  userName: string;
  errorCode: string;
  occurredAt: string; // ISO 8601
}
