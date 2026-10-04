"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { NotificationsButton } from "./notifications-button";

/** Desktop top bar (≥1024px): search with ⌘K, page actions, notifications. */
export function AppHeader({
  searchPlaceholder,
  actions,
  unreadNotifications,
}: {
  searchPlaceholder: string;
  actions?: React.ReactNode;
  unreadNotifications?: boolean;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 hidden h-[57px] items-center gap-3 border-b border-border bg-background px-6 lg:flex">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="w-80 max-w-full">
        <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted px-2.5 text-muted-foreground focus-within:border-brand">
          <Search className="size-4 shrink-0" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
          />
          <kbd className="rounded-[4px] border border-input bg-background px-[5px] font-mono text-[11px] text-muted-foreground">⌘K</kbd>
        </label>
      </form>
      <div className="ml-auto flex items-center gap-1">
        {actions}
        <NotificationsButton unread={unreadNotifications} />
      </div>
    </header>
  );
}
