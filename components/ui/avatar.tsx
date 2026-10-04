import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-avatar text-brand-dark",
      /** Platform admins get the dark avatar. */
      admin: "bg-foreground text-white",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Avatar({
  initials,
  variant,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof avatarVariants> & { initials: string }) {
  return (
    <span data-slot="avatar" aria-hidden className={cn(avatarVariants({ variant }), className)} {...props}>
      {initials}
    </span>
  );
}
