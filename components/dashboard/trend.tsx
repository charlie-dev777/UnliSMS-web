import { cn } from "@/lib/utils";

/** Green for good movement, red for bad. Pass the signed change as `value`, or force it with `positive`. */
export function Trend({ value = 0, positive = value >= 0, children }: { value?: number; positive?: boolean; children: React.ReactNode }) {
  return <span className={cn("font-medium", positive ? "text-success-foreground" : "text-destructive")}>{children}</span>;
}
