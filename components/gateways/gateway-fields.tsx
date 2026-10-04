import type { Gateway } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Shown for any value the device or API didn't report (null). */
export const UNKNOWN = "Unknown";

export const gatewayLabel = (g: Pick<Gateway, "name" | "deviceModel">) => g.name ?? g.deviceModel ?? "Unnamed gateway";

/** "Pixel 7 · Android 14"; the model is omitted when it's already the label. */
export function gatewaySubtitle(g: Pick<Gateway, "name" | "deviceModel" | "androidVersion">) {
  const android = `Android ${g.androidVersion ?? "version unknown"}`;
  return g.name ? `${g.deviceModel ?? "Unknown device"} · ${android}` : android;
}

/** null stays null so `Field` renders it as a muted Unknown. */
export const yesNo = (value: boolean | null) => (value === null ? null : value ? "Yes" : "No");

/** Relative time with the absolute PHT time on hover; Unknown when null. */
export function Timestamp({ iso, now }: { iso: string | null; now: Date }) {
  if (!iso) return <span className="text-muted-foreground">{UNKNOWN}</span>;
  return (
    <time dateTime={iso} title={formatDateTime(iso)}>
      {formatRelativeTime(iso, now)}
    </time>
  );
}

/** Label/value pairs: stacked on phones, two columns from 480px. */
export function FieldList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn("m-0 grid grid-cols-1 gap-x-6 gap-y-3 min-[480px]:grid-cols-2", className)}>{children}</dl>;
}

export function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  // `null`/`undefined` renders as Unknown so missing values never look like blanks.
  const empty = children === null || children === undefined || children === "";
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", wide && "min-[480px]:col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("m-0 min-w-0 text-[13px] font-medium break-words", empty && "font-normal text-muted-foreground")}>
        {empty ? UNKNOWN : children}
      </dd>
    </div>
  );
}

/** Monospace identifier that wraps instead of widening the page. */
export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[12px] break-all">{children}</span>;
}
