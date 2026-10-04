import * as React from "react";
import { cn } from "@/lib/utils";
import { inputClassName } from "./input";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(inputClassName, "h-[88px] resize-none py-2.5", className)} {...props} />;
}
