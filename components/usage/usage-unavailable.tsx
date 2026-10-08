import { Lock, TriangleAlert } from "lucide-react";
import type { ApiResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { RetryButton } from "@/components/gateways";

/**
 * The subscription read failed. 403 keeps the session and explains the role limit (the API
 * lets only owners and admins read it); anything else offers a retry. A 401 never gets
 * here: the API client ends the session first.
 */
export function UsageUnavailable({ result }: { result: Extract<ApiResult<unknown>, { ok: false }> }) {
  const forbidden = result.reason === "forbidden";
  const Icon = forbidden ? Lock : TriangleAlert;
  return (
    <Card className="flex flex-col items-start gap-3 px-5 py-5 min-[641px]:flex-row min-[641px]:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-muted text-foreground-2">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1" role={forbidden ? undefined : "alert"}>
        <p className="m-0 text-[13px] font-semibold">{forbidden ? "Plan and usage are visible to owners and admins" : "Couldn’t load your plan and usage"}</p>
        <p className="mt-0.5 mb-0 text-xs text-muted-foreground">
          {forbidden
            ? "Ask an owner or admin of your organization for its plan and usage."
            : "The UnliSMS API didn’t respond. Your gateways and messages aren’t affected."}
        </p>
      </div>
      {!forbidden && <RetryButton />}
    </Card>
  );
}
