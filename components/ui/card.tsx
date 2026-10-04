import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 rounded-xl border border-border bg-white", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 py-4", className)}>
      <div>
        <h2 className="m-0 text-sm leading-5 font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted-fg">{description}</p>}
      </div>
      {action}
    </div>
  );
}
