"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AccountMenu } from "./account-menu";
import { AdminTag } from "./admin-tag";
import { LogoMark } from "./logo";
import { portals, type NavBadge, type NavBadges, type Portal } from "./nav";

export type AppSidebarProps = {
  portal: Portal;
  user: User;
  badges?: NavBadges;
  /** Extra content above the account button, e.g. the plan usage card. */
  footer?: React.ReactNode;
  /** Called after a nav link is clicked (closes the mobile sheet). */
  onNavigate?: () => void;
};

export function AppSidebar({ portal, user, badges = {}, footer, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { homeHref, nav } = portals[portal];
  const admin = portal === "admin";

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 pb-5">
      <Link
        href={homeHref}
        onClick={onNavigate}
        className="flex items-center gap-1.5 self-start rounded-lg px-1.5 py-0.5 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={admin ? "UnliSMS admin home" : "UnliSMS home"}
      >
        <LogoMark width={54} height={34} />
        <span className="text-base font-semibold tracking-[-0.01em]">UnliSMS</span>
        {admin && <AdminTag className="ml-0.5" />}
      </Link>

      {nav.map((group) => (
        <nav key={group.label} aria-label={group.label} className="flex flex-col gap-0.5">
          <div className="mb-1 px-2.5 text-xs font-medium text-muted-foreground">{group.label}</div>
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active ? "bg-accent text-accent-foreground" : "text-foreground-2 hover:bg-sidebar-hover hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-brand")} aria-hidden />
                {label}
                {badges[href] && <NavItemBadge badge={badges[href]} />}
              </Link>
            );
          })}
        </nav>
      ))}

      {footer}

      <AccountMenu user={user} className={cn(admin && "mt-2")} />
    </div>
  );
}

function NavItemBadge({ badge }: { badge: NavBadge }) {
  switch (badge.kind) {
    case "count":
      return <span className="num ml-auto text-xs text-muted-foreground">{badge.text}</span>;
    case "alert":
      return (
        <Badge variant="danger" className="num ml-auto h-[22px] px-1.5 text-[11px]">
          {badge.text}
        </Badge>
      );
    case "warning":
      return <span className="ml-auto size-1.5 rounded-full bg-warning-strong" role="img" aria-label={badge.label} />;
  }
}
