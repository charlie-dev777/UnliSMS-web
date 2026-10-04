import "server-only";
import { cache } from "react";
import { onsimGet } from "@/lib/onsim/client";
import * as Api from "@/lib/onsim/schemas";
import type { ApiResult, Gateway, GatewayDetail, GatewaySim } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The organization's allocated gateways, newest first. Memoized per request. */
export const listGateways = cache(async (): Promise<ApiResult<Gateway[]>> => {
  const result = await onsimGet("v1/gateways", Api.isGatewayListResponse);
  return result.ok ? { ok: true, data: result.data.gateways.map(toGateway) } : result;
});

/** One gateway by internal UUID. Non-UUIDs are `not_found` without an API call. */
export const getGateway = cache(async (gatewayId: string): Promise<ApiResult<GatewayDetail>> => {
  if (!UUID.test(gatewayId)) return { ok: false, reason: "not_found" };
  const result = await onsimGet(`v1/gateways/${encodeURIComponent(gatewayId)}`, Api.isGatewayDetail);
  return result.ok ? { ok: true, data: toGatewayDetail(result.data) } : result;
});

function toSim(sim: Api.GatewaySim): GatewaySim {
  return {
    slotNumber: sim.slot_number,
    phoneNumber: sim.phone_number,
    carrierName: sim.carrier_name,
    countryIso: sim.country_iso,
    isDefaultOutbound: sim.is_default_outbound,
    firstSeenAt: sim.first_seen_at,
    lastSeenAt: sim.last_seen_at,
  };
}

function toGateway(g: Api.GatewaySummary): Gateway {
  return {
    id: g.gateway_id,
    publicGatewayId: g.public_gateway_id,
    name: g.name,
    presence: g.presence,
    healthStatus: g.health_status,
    appVersion: g.app_version,
    androidVersion: g.android_version,
    deviceModel: g.device_model,
    lastSeenAt: g.last_seen_at,
    registeredAt: g.registered_at,
    createdAt: g.created_at,
    sims: g.sims.map(toSim),
  };
}

function toGatewayDetail(g: Api.GatewayDetail): GatewayDetail {
  const c = g.capabilities;
  return {
    ...toGateway(g),
    batteryPercent: g.battery_percent,
    networkType: g.network_type,
    smsPermission: g.sms_permission,
    phonePermission: g.phone_permission,
    queueDepth: g.queue_depth,
    storageAvailableMb: g.storage_available_mb,
    capabilities: c && {
      canSendSms: c.can_send_sms,
      canReceiveSms: c.can_receive_sms,
      canReportCalls: c.can_report_calls,
      reportedSimCount: c.reported_sim_count,
      supportsEncryptedFcmSmsV1: c.supports_encrypted_fcm_sms_v1,
    },
  };
}
