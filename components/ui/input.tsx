import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-sm text-fg placeholder:text-placeholder",
        "focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,128,240,.16)] focus:outline-none",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-fg", className)} {...props} />;
}
