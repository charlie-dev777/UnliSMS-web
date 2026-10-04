import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Pill, 22px, soft tint + 1px border + optional dot. One mapping across
// messages, gateways, webhooks and services.
export const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "border-[#C9EFD5] bg-success-soft text-success-fg",
        warning: "border-[#F4E1A6] bg-warning-soft text-warning-fg",
        danger: "border-[#FBD0CB] bg-danger-soft text-danger-fg",
        info: "border-[#CFE5FC] bg-primary-soft text-info-fg",
        neutral: "border-border bg-muted text-neutral-fg",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotClassName?: string;
}

export function Badge({ className, variant, dot, dotClassName, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full bg-current", dotClassName)} />}
      {children}
    </span>
  );
}
