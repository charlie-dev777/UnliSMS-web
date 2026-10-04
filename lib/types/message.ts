export type MessageDirection = "outbound" | "inbound";

export type MessageStatus = "delivered" | "sent" | "pending" | "scheduled" | "received" | "failed";

export interface Message {
  id: string;
  direction: MessageDirection;
  /** The other party's number, e.g. "+63 917 555 0142". */
  phoneNumber: string;
  body: string;
  gatewayId: string;
  gatewayName: string;
  simSlot: 1 | 2;
  status: MessageStatus;
  createdAt: string; // ISO 8601
}
