import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// One primary action per view. Outline for secondary, ghost inside cards and
// toolbars, destructive only in confirmation dialogs.
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-input bg-background text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        link: "bg-transparent text-primary hover:bg-muted",
        destructive: "bg-destructive-solid text-white hover:bg-destructive",
      },
      size: {
        default: "h-9 px-3.5 text-sm",
        sm: "h-8 px-2.5 text-[13px]",
        lg: "h-10 px-4 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a `<Link>`) with button styles. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
