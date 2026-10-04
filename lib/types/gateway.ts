/** Philippine mobile networks seen on gateway SIMs. */
export type Carrier = "Globe" | "Smart" | "DITO" | "TNT" | "TM";

/** 0 = no service, 4 = full bars. */
export type SignalLevel = 0 | 1 | 2 | 3 | 4;

export interface SimSlot {
  slot: 1 | 2;
  carrier: Carrier;
  /** Masked for display, e.g. "+63 917 ••• 4821". */
  maskedNumber: string;
  signal: SignalLevel;
}

export type GatewayStatus = "online" | "offline";

/** An Android phone paired as an SMS gateway. */
export interface Gateway {
  id: string;
  name: string;
  deviceModel: string;
  androidVersion: string;
  status: GatewayStatus;
  /** Physical slots 1 and 2; null when the slot is empty. */
  sims: [SimSlot | null, SimSlot | null];
  lastSeenAt: string; // ISO 8601
}
