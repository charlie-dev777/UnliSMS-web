/**
 * Scopes the portal offers when creating a key. The API accepts any strings, but only
 * these are checked anywhere (onsim-api `require_scope`), so anything else would grant
 * nothing. A "*" scope also passes every check; the portal shows it on existing keys but
 * doesn't offer it.
 */
export const API_KEY_SCOPES = [
  {
    value: "sms:send",
    label: "Send SMS",
    description: "Send, schedule, cancel and look up SMS through the messages API.",
  },
  {
    value: "gateways:write",
    label: "Register gateways",
    description: "Register gateway phones to your organization.",
  },
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number]["value"];

export const DEFAULT_SCOPES: ApiKeyScope[] = ["sms:send"];

export const isOfferedScope = (v: string): v is ApiKeyScope => API_KEY_SCOPES.some((s) => s.value === v);

/** Display label for any scope a key holds, offered or not. */
export function scopeLabel(scope: string) {
  if (scope === "*") return "All scopes";
  return API_KEY_SCOPES.find((s) => s.value === scope)?.label ?? scope;
}

/** The API's own limit (`ApiKeyCreateRequest.name`). */
export const NAME_MAX = 100;

/** The API trims and collapses whitespace, so the portal validates the same normalized value. */
export const normalizeKeyName = (name: string) => name.split(/\s+/).filter(Boolean).join(" ");
