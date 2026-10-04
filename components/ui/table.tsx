import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-[13px]", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-y border-border bg-muted px-5 py-[9px] text-left text-xs font-medium whitespace-nowrap text-muted-fg",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("group [&:last-child>td]:border-b-0", className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-border px-5 py-3 align-middle whitespace-nowrap group-hover:bg-[#FAFBFC]",
        className,
      )}
      {...props}
    />
  );
}
