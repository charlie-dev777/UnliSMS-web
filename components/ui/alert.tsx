import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Alerts sit inline at the top of the affected card or page.
const alertVariants = cva("flex gap-3 rounded-[10px] border px-4 py-3 text-[13px] [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      success: "border-success-border bg-success-soft text-success-ink",
      warning: "border-warning-border bg-warning-soft text-warning-ink",
      danger: "border-danger-border bg-danger-soft text-danger-ink",
    },
  },
  defaultVariants: { variant: "warning" },
});

export function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("[&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline", className)} {...props} />;
}
