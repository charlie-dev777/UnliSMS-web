import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("min-w-0 rounded-xl border border-border bg-card text-card-foreground", className)} {...props} />;
}

/** Title block on the left, optional `CardAction` on the right. */
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex items-start justify-between gap-3 px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="card-title" className={cn("m-0 text-sm leading-5 font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("mt-0.5 text-[13px] text-muted-foreground", className)} {...props} />;
}

export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("shrink-0", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-5 pt-1 pb-5", className)} {...props} />;
}
