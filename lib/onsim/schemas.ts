import "server-only";

/**
 * Wire shapes of the OnSim gateway read API, verified against the deployed OpenAPI
 * (`/openapi.json`) and onsim-api `app/schemas/gateways.py`. Every field is always
 * present; nullable fields are `null`, never omitted.
 */

export type Presence = "online" | "offline" | "unknown";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface GatewaySim {
  slot_number: number;
  phone_number: string | null;
  carrier_name: string | null;
  country_iso: string | null;
  is_default_outbound: boolean;
  first_seen_at: string;
  last_seen_at: string | null;
}

export interface GatewaySummary {
  gateway_id: string;
  public_gateway_id: string;
  name: string | null;
  allocation_status: "allocated" | "released" | "revoked";
  connection_status: "online" | "offline" | "unknown";
  presence: Presence;
  health_status: HealthStatus;
  app_version: string | null;
  android_version: string | null;
  device_model: string | null;
  last_seen_at: string | null;
  registered_at: string;
  created_at: string;
  sims: GatewaySim[];
}

export interface GatewayListResponse {
  gateways: GatewaySummary[];
}

export interface GatewayCapabilities {
  can_send_sms: boolean | null;
  can_receive_sms: boolean | null;
  can_report_calls: boolean | null;
  reported_sim_count: number | null;
  supports_encrypted_fcm_sms_v1: boolean | null;
}

export interface GatewayDetail extends GatewaySummary {
  battery_percent: number | null;
  network_type: string | null;
  sms_permission: boolean | null;
  phone_permission: boolean | null;
  queue_depth: number | null;
  storage_available_mb: number | null;
  capabilities: GatewayCapabilities | null;
}

// Structural checks: a response that doesn't match is treated as unavailable rather
// than rendered with missing data.

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string";
const optStr = (v: unknown) => v === null || typeof v === "string";
const optNum = (v: unknown) => v === null || typeof v === "number";
const optBool = (v: unknown) => v === null || typeof v === "boolean";
const oneOf = (values: readonly string[]) => (v: unknown) => typeof v === "string" && values.includes(v);

const PRESENCE = ["online", "offline", "unknown"] as const;
const HEALTH = ["healthy", "degraded", "unhealthy", "unknown"] as const;

function has(o: Obj, checks: Record<string, (v: unknown) => boolean>) {
  return Object.entries(checks).every(([key, check]) => key in o && check(o[key]));
}

function isSim(v: unknown): v is GatewaySim {
  return (
    isObj(v) &&
    has(v, {
      slot_number: (x) => typeof x === "number",
      phone_number: optStr,
      carrier_name: optStr,
      country_iso: optStr,
      is_default_outbound: (x) => typeof x === "boolean",
      first_seen_at: str,
      last_seen_at: optStr,
    })
  );
}

function isSummary(v: unknown): v is GatewaySummary {
  return (
    isObj(v) &&
    has(v, {
      gateway_id: str,
      public_gateway_id: str,
      name: optStr,
      presence: oneOf(PRESENCE),
      health_status: oneOf(HEALTH),
      app_version: optStr,
      android_version: optStr,
      device_model: optStr,
      last_seen_at: optStr,
      registered_at: str,
      created_at: str,
      sims: (x) => Array.isArray(x) && x.every(isSim),
    })
  );
}

function isCapabilities(v: unknown): v is GatewayCapabilities {
  return (
    isObj(v) &&
    has(v, {
      can_send_sms: optBool,
      can_receive_sms: optBool,
      can_report_calls: optBool,
      reported_sim_count: optNum,
      supports_encrypted_fcm_sms_v1: optBool,
    })
  );
}

export function isGatewayListResponse(v: unknown): v is GatewayListResponse {
  return isObj(v) && Array.isArray(v.gateways) && v.gateways.every(isSummary);
}

export function isGatewayDetail(v: unknown): v is GatewayDetail {
  return (
    isSummary(v) &&
    has(v as unknown as Obj, {
      battery_percent: optNum,
      network_type: optStr,
      sms_permission: optBool,
      phone_permission: optBool,
      queue_depth: optNum,
      storage_available_mb: optNum,
      capabilities: (x) => x === null || isCapabilities(x),
    })
  );
}
