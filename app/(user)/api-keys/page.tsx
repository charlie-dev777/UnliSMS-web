import type { Metadata } from "next";
import { ChevronDown, Info, KeyRound } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listApiKeys } from "@/lib/data/api-keys";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { ApiKeyList, ApiKeysForbidden, ApiKeysUnavailable, CreateApiKeyDialog } from "@/components/api-keys";

export const metadata: Metadata = { title: "API Keys" };

export default async function ApiKeysPage() {
  await requireUser();
  const result = await listApiKeys();
  const now = new Date();

  const active = result.ok ? result.data.filter((k) => k.status === "active") : [];
  const inactive = result.ok ? result.data.filter((k) => k.status !== "active") : [];

  return (
    <>
      <PageHeader
        title="API Keys"
        description="Authenticate your applications with the UnliSMS API."
        actions={result.ok && active.length > 0 ? <CreateApiKeyDialog /> : undefined}
      />

      <Card>
        <div className="px-5 py-4">
          <h2 className="m-0 text-sm leading-5 font-semibold">Active keys</h2>
          <p className="mt-0.5 mb-0 text-[13px] text-muted-foreground">
            Keys are shown once, when they’re created. Here you only see each key’s first characters.
          </p>
        </div>
        <div className="border-t border-border">
          {!result.ok ? (
            result.reason === "forbidden" ? (
              <ApiKeysForbidden />
            ) : (
              <ApiKeysUnavailable />
            )
          ) : active.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title={inactive.length > 0 ? "No active API keys" : "No API keys yet"}
              description="Create a key to send SMS from your own applications."
              action={<CreateApiKeyDialog label="Create your first key" />}
            />
          ) : (
            <ApiKeyList keys={active} now={now} />
          )}
        </div>
      </Card>

      {inactive.length > 0 && (
        <Card>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-sm leading-5 font-semibold">Revoked and expired keys ({inactive.length})</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">These keys can’t authenticate anymore.</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="border-t border-border">
              <ApiKeyList keys={inactive} now={now} />
            </div>
          </details>
        </Card>
      )}

      <p className="m-0 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          API keys are for your applications. Your gateway phones don’t use them: each phone signs in with its own device credential, so creating,
          rotating or revoking keys never affects your gateways.
        </span>
      </p>
    </>
  );
}
