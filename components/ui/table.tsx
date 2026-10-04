import * as React from "react";
import { cn } from "@/lib/utils";

/** Scrolls horizontally on narrow screens instead of squeezing columns. */
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="overflow-x-auto">
      <table data-slot="table" className={cn("w-full border-collapse text-[13px]", className)} {...props} />
    </div>
  );
}

export function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" {...props} />;
}

export function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("group [&:last-child>td]:border-b-0", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("border-y border-border bg-muted px-5 py-[9px] text-left text-xs font-medium whitespace-nowrap text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("border-b border-border px-5 py-3 align-middle whitespace-nowrap group-hover:bg-row-hover", className)}
      {...props}
    />
  );
}
