import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClassName = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-placeholder",
  "focus:border-brand focus:shadow-[0_0_0_3px_rgba(0,128,240,.16)] focus:outline-none",
  "aria-invalid:border-error-border disabled:cursor-not-allowed disabled:bg-muted disabled:text-placeholder",
);

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" type={type} className={cn(inputClassName, className)} {...props} />;
}
