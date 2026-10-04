"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronsUpDown, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "./logo";
import { adminNav, userNav } from "./nav";

export type ShellUser = { name: string; subtitle: string; initials: string };

type AppShellProps = {
  user: ShellUser;
  homeHref: string;
  /** Shows the "Admin" tag next to the wordmark and the dark avatar. */
  admin?: boolean;
  searchPlaceholder: string;
  /** Extra sidebar content above the account button (e.g. plan usage card). */
  sidebarFooter?: React.ReactNode;
  /** Extra top-bar actions left of the notifications bell. */
  topbarActions?: React.ReactNode;
  unreadNotifications?: boolean;
  children: React.ReactNode;
};

export function AppShell(props: AppShellProps) {
  const { admin, homeHref, searchPlaceholder, topbarActions, unreadNotifications, children } = props;
  const pathname = usePathname();
  // The sheet is tied to the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = React.useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border bg-sidebar lg:block">
        <Sidebar {...props} />
      </aside>

      {/* Mobile sheet (below 1024px) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-fg/40" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto border-r border-border bg-sidebar shadow-xl">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X />
            </Button>
            <Sidebar {...props} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        {/* Mobile header */}
        <div className="flex h-14 items-center gap-2 border-b border-border bg-white px-3 lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <Link href={homeHref} className="flex items-center gap-2 text-fg">
            <LogoMark width={48} height={30} />
            <span className="text-[15px] font-semibold">UnliSMS</span>
          </Link>
          {admin && <AdminTag />}
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="Notifications">
            <Bell />
          </Button>
        </div>

        {/* Desktop top bar */}
        <header className="sticky top-0 z-20 hidden h-14 items-center gap-3 border-b border-border bg-white px-6 lg:flex">
          <label className="flex h-9 w-80 max-w-full items-center gap-2 rounded-lg border border-border bg-muted px-2.5 text-muted-fg">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              aria-label="Search"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-fg outline-none placeholder:text-placeholder"
            />
            <kbd className="rounded border border-border-strong bg-white px-[5px] font-mono text-[11px] text-muted-fg">⌘K</kbd>
          </label>
          <div className="ml-auto flex items-center gap-1">
            {topbarActions}
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell />
              {unreadNotifications && (
                <span className="absolute top-2 right-[9px] size-[7px] box-content rounded-full border-2 border-white bg-primary" />
              )}
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-5 pb-10 sm:gap-6 sm:px-10 sm:pt-8 sm:pb-14">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminTag() {
  return (
    <Badge variant="neutral" className="h-5 rounded-md px-1.5 text-[11px]">
      Admin
    </Badge>
  );
}

function Sidebar({ user, homeHref, admin, sidebarFooter }: AppShellProps) {
  const pathname = usePathname();
  const nav = admin ? adminNav : userNav;
  return (
    <div className="sticky top-0 flex flex-col gap-5 px-3 pt-4 pb-5">
      <Link href={homeHref} className="flex items-center gap-1.5 px-1.5 py-0.5 text-fg" aria-label={admin ? "UnliSMS admin home" : "UnliSMS home"}>
        <LogoMark width={54} height={34} />
        <span className="text-base font-semibold tracking-[-0.01em]">UnliSMS</span>
        {admin && <AdminTag />}
      </Link>

      {nav.map((group) => (
        <nav key={group.label} aria-label={group.label} className="flex flex-col gap-0.5">
          <div className="mb-1 px-2.5 text-xs font-medium text-muted-fg">{group.label}</div>
          {group.items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active ? "bg-primary-soft text-primary-dark" : "text-fg-2 hover:bg-[#F1F3F6] hover:text-fg",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                {item.label}
                {item.meta && <span className="num ml-auto text-xs text-muted-fg">{item.meta}</span>}
                {item.alert && (
                  <Badge variant="danger" className="num ml-auto h-5 px-1.5 text-[11px]">
                    {item.alert}
                  </Badge>
                )}
                {item.warnDot && <span className="ml-auto size-1.5 rounded-full bg-warning" role="img" aria-label={item.warnDot} />}
              </Link>
            );
          })}
        </nav>
      ))}

      {sidebarFooter}

      <Button variant="ghost" className={cn("h-12 justify-start gap-2.5 px-2 text-left", admin && "mt-2")} aria-label="Account menu">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            admin ? "bg-fg text-white" : "bg-[#E8F1FB] text-primary-dark",
          )}
        >
          {user.initials}
        </span>
        <span className="flex min-w-0 flex-col leading-[18px]">
          <span className="text-[13px] font-medium">{user.name}</span>
          <span className="text-xs font-normal text-muted-fg">{user.subtitle}</span>
        </span>
        <ChevronsUpDown className="ml-auto text-muted-fg" />
      </Button>
    </div>
  );
}
