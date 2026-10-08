/**
 * Webhook rules shared by the form and its Server Action. The OnSim API has the final say
 * (`GatewayWebhookUpdate` / `OrganizationGatewayWebhookUpdate` in onsim-api
 * `app/schemas/webhooks.py`, plus `validate_webhook_destination` before saving).
 */

/**
 * The events the portal offers: exactly the ones the Android app subscribes every webhook
 * to (`WebhookSubscriptionStore.DEFAULT_EVENTS`), so the portal and the app always agree.
 * The API accepts more (see `API_EVENT_NAMES`), but UnliSMS doesn't expose them.
 */
export const WEBHOOK_EVENTS = [
  { name: "sms.received", label: "SMS received", description: "A message arrives on the gateway." },
  { name: "call.missed", label: "Call missed", description: "An incoming call ends unanswered." },
  { name: "call.answered", label: "Call answered", description: "An incoming call is picked up." },
] as const;

export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number]["name"];

export const isWebhookEventName = (v: unknown): v is WebhookEventName =>
  typeof v === "string" && WEBHOOK_EVENTS.some((e) => e.name === v);

/** The default for a new webhook, and what the app saves: all three events. */
export const DEFAULT_EVENTS: WebhookEventName[] = WEBHOOK_EVENTS.map((e) => e.name);

/**
 * Every event name the API can return (`WebhookEventName` in onsim-api). Only used to
 * accept API responses: a configuration saved through the API directly may hold others.
 */
export const API_EVENT_NAMES = [
  "sms.received",
  "sms.sent",
  "sms.delivered",
  "sms.failed",
  "call.ringing",
  "call.missed",
  "call.answered",
  "call.ended",
] as const;

export type ApiEventName = (typeof API_EVENT_NAMES)[number];

export const isApiEventName = (v: unknown): v is ApiEventName => typeof v === "string" && (API_EVENT_NAMES as readonly string[]).includes(v);

export const SECRET_MIN = 16;
export const SECRET_MAX = 512;

/**
 * Android rejects URLs over 2,048 characters and URLs with a #fragment before delivering
 * (`validateWebhookConfiguration`), though the API would store them. The portal applies
 * those limits too, so a URL saved here never breaks delivery from the phone.
 */
export const URL_MAX = 2048;

/** Checks the browser can make. DNS and private-address checks happen on the server. */
export function webhookUrlError(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Enter your webhook URL.";
  if (value.length > URL_MAX) return `Use a URL of ${URL_MAX.toLocaleString("en-US")} characters or fewer.`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Enter a full URL, like https://example.com/webhooks/unlisms.";
  }
  if (url.protocol !== "https:") return "Use an https:// URL. UnliSMS only delivers webhooks over HTTPS.";
  if (url.username || url.password) return "Remove the username and password from the URL.";
  if (!url.hostname) return "Enter a full URL, like https://example.com/webhooks/unlisms.";
  if (url.hash) return "Remove the #fragment from the URL.";
  if (isLocalHost(url.hostname)) return PRIVATE_COPY;
  return null;
}

export const PRIVATE_COPY =
  "This URL points to a private or local network address. Use an endpoint that’s reachable from the internet.";

/** Obvious local destinations only; the API also resolves the host and rejects any non-public address. */
function isLocalHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.includes(":")) return host === "::1" || host === "::" || /^(fe[89ab]|f[cd])/.test(host);
  const octets = host.split(".");
  if (octets.length !== 4 || !octets.every((o) => /^\d{1,3}$/.test(o))) return false;
  const [a, b] = octets.map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

export function signingSecretError(secret: string): string | null {
  if (!secret) return null;
  if (secret.length < SECRET_MIN || secret.length > SECRET_MAX) return `Use ${SECRET_MIN} to ${SECRET_MAX} characters.`;
  return null;
}
