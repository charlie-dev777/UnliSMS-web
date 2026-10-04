import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Pill, 24px tall as rendered on the canvas (22px + border), soft tint + 1px border + optional dot. One mapping across
// messages, gateways, webhooks and services.
export const badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap border font-medium", {
  variants: {
    variant: {
      success: "border-success-border bg-success-soft text-success-foreground",
      warning: "border-warning-border bg-warning-soft text-warning-foreground",
      danger: "border-danger-border bg-danger-soft text-destructive",
      info: "border-info-border bg-accent text-info-foreground",
      neutral: "border-border bg-muted text-neutral-foreground",
    },
    shape: {
      pill: "h-6 rounded-full px-2 text-xs",
      /** Square-ish tag, e.g. the "Admin" label next to the wordmark. */
      tag: "h-[22px] rounded-md px-1.5 text-[11px]",
    },
  },
  defaultVariants: { variant: "neutral", shape: "pill" },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
    dotClassName?: string;
  };

export function Badge({ className, variant, shape, dot, dotClassName, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant, shape }), className)} {...props}>
      {dot && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full bg-current", dotClassName)} />}
      {children}
    </span>
  );
}
