import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// One primary action per view. Outline for secondary, ghost inside cards and
// toolbars, destructive only in confirmation dialogs.
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-solid text-white hover:bg-primary-dark hover:text-white",
        outline: "border-border-strong bg-white text-fg hover:bg-muted",
        ghost: "bg-transparent text-fg hover:bg-muted",
        link: "bg-transparent text-primary-solid hover:bg-muted",
        destructive: "bg-danger text-white hover:bg-danger-fg",
      },
      size: {
        default: "h-9 px-3.5 text-sm",
        lg: "h-10 px-4 text-sm",
        sm: "h-8 px-2.5 text-[13px]",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
