import type { ApiKey, ApiKeyStatus } from "@/lib/types";
import { scopeLabel } from "@/lib/api-keys/scopes";
import { StatusBadge } from "@/components/status";
import { Timestamp } from "@/components/gateways";
import type { BadgeVariant } from "@/components/ui/badge";
import { RevokeKeyButton, RotateKeyButton } from "./key-actions";

const STATUS: Record<ApiKeyStatus, { tone: BadgeVariant; label: string }> = {
  active: { tone: "success", label: "Active" },
  expired: { tone: "warning", label: "Expired" },
  revoked: { tone: "neutral", label: "Revoked" },
};

/** API keys as rows: name, status, prefix, scopes and usage. Active keys get Rotate and Revoke. */
export function ApiKeyList({ keys, now }: { keys: ApiKey[]; now: Date }) {
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
      {keys.map((k) => (
        <li key={k.id} className="flex flex-col gap-3 px-5 py-3.5 min-[641px]:flex-row min-[641px]:items-center min-[641px]:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <span className="min-w-0 text-sm font-semibold break-words">{k.name}</span>
              <StatusBadge tone={STATUS[k.status].tone} label={STATUS[k.status].label} dot />
              {k.environment !== "live" && <StatusBadge tone="info" label={`${k.environment[0]?.toUpperCase() ?? ""}${k.environment.slice(1)}`} />}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <code className="font-mono text-[13px] break-all text-foreground-2" title="The key’s first characters. The rest is never shown again.">
                {k.prefix}
                <span aria-hidden>••••••••</span>
              </code>
              {k.scopes.map((scope) => (
                <StatusBadge key={scope} tone="neutral" label={scopeLabel(scope)} className="h-5 text-[11px]" />
              ))}
            </div>
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>
                Created <Timestamp iso={k.createdAt} now={now} />
              </span>
              <span aria-hidden>·</span>
              <span>
                {k.lastUsedAt ? (
                  <>
                    Last used <Timestamp iso={k.lastUsedAt} now={now} />
                  </>
                ) : (
                  "Never used"
                )}
              </span>
              {k.revokedAt ? (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    Revoked <Timestamp iso={k.revokedAt} now={now} />
                  </span>
                </>
              ) : (
                k.expiresAt && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      {k.status === "expired" ? "Expired" : "Expires"} <Timestamp iso={k.expiresAt} now={now} />
                    </span>
                  </>
                )
              )}
            </p>
          </div>
          {k.status === "active" && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <RotateKeyButton apiKey={k} />
              <RevokeKeyButton apiKey={k} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
