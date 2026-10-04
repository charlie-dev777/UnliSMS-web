/**
 * Gateways as the portal renders them, mapped from the OnSim gateway read API
 * (`GET /v1/gateways`, `GET /v1/gateways/{id}`; wire shapes in `lib/onsim/schemas.ts`).
 * Every field comes from the API. Null means the device never reported it.
 *
 * The API's stored `connection_status` and `allocation_status` are left out on purpose:
 * the device only ever stores "online", so `presence` is the liveness signal, and the API
 * returns allocated gateways only.
 */

/** Derived by the API from the device's most recent authenticated contact. */
export type GatewayPresence = "online" | "offline" | "unknown";

/** The device's last reported health; not a live reading. */
export type GatewayHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/** An active SIM as last reported by the device. */
export interface GatewaySim {
  slotNumber: number; // 1–8
  phoneNumber: string | null; // E.164
  carrierName: string | null;
  countryIso: string | null;
  isDefaultOutbound: boolean;
  firstSeenAt: string; // ISO 8601
  lastSeenAt: string | null;
}

/** An Android phone paired as an SMS gateway. */
export interface Gateway {
  /** Internal UUID; used in portal URLs and the detail API. */
  id: string;
  /** What `POST /v1/messages` takes as `gateway_id`. */
  publicGatewayId: string;
  name: string | null;
  presence: GatewayPresence;
  healthStatus: GatewayHealthStatus;
  appVersion: string | null;
  androidVersion: string | null;
  deviceModel: string | null;
  lastSeenAt: string | null; // ISO 8601
  registeredAt: string;
  createdAt: string;
  sims: GatewaySim[];
}

/** Capabilities reported by the gateway's active installation. */
export interface GatewayCapabilities {
  canSendSms: boolean | null;
  canReceiveSms: boolean | null;
  canReportCalls: boolean | null;
  reportedSimCount: number | null;
  supportsEncryptedFcmSmsV1: boolean | null;
}

/** One gateway with its last health snapshot and capabilities. */
export interface GatewayDetail extends Gateway {
  batteryPercent: number | null;
  networkType: string | null;
  smsPermission: boolean | null;
  phonePermission: boolean | null;
  queueDepth: number | null;
  storageAvailableMb: number | null;
  /** Null when the gateway has no active installation. */
  capabilities: GatewayCapabilities | null;
}

/**
 * Outcome of an authenticated OnSim read. A 401 never reaches callers: it ends the web
 * session and redirects to /login (see `lib/onsim/client.ts`).
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "forbidden" | "not_found" | "unavailable" };
