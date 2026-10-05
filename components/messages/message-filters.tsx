import Link from "next/link";
import type { MessageFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: MessageFilter; label: string; href: string }[] = [
  { value: "all", label: "All", href: "/messages" },
  { value: "scheduled", label: "Scheduled", href: "/messages?state=scheduled" },
  // The API's `state=sent` returns sent and delivered messages.
  { value: "sent", label: "Sent & delivered", href: "/messages?state=sent" },
];

/** History filters; each maps to the API's `?state=` query. */
export function MessageFilters({ active }: { active: MessageFilter }) {
  return (
    <nav aria-label="Filter messages" className="flex flex-wrap gap-1">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={f.href}
          aria-current={f.value === active ? "page" : undefined}
          className={cn(
            "inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            f.value === active && "bg-muted text-foreground",
          )}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
}
