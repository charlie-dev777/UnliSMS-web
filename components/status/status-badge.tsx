import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeProps = {
  tone: BadgeVariant;
  label: string;
  /** Leading dot; used for states (Delivered, Online). */
  dot?: boolean;
  dotClassName?: string;
  /** Monospace label for HTTP codes. */
  mono?: boolean;
  className?: string;
};

/** Base for every domain status badge, so tone mapping lives in one place per domain. */
export function StatusBadge({ tone, label, dot, dotClassName, mono, className }: StatusBadgeProps) {
  return (
    <Badge variant={tone} dot={dot} dotClassName={dotClassName} className={cn(mono && "font-mono text-[11.5px]", className)}>
      {label}
    </Badge>
  );
}
