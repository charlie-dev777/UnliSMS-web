import type { User } from "@/lib/types";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";
import { portals, type NavBadges, type Portal } from "./nav";

type AppShellProps = {
  portal: Portal;
  user: User;
  badges?: NavBadges;
  sidebarFooter?: React.ReactNode;
  headerActions?: React.ReactNode;
  unreadNotifications?: boolean;
  children: React.ReactNode;
};

/** 248px sidebar + sticky top bar on desktop; mobile header + sheet below 1024px. */
export function AppShell({ portal, user, badges, sidebarFooter, headerActions, unreadNotifications, children }: AppShellProps) {
  const sidebar = { portal, user, badges, footer: sidebarFooter };
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-sidebar lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto">
          <AppSidebar {...sidebar} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <MobileNav {...sidebar} unreadNotifications={unreadNotifications} />
        <AppHeader searchPlaceholder={portals[portal].searchPlaceholder} actions={headerActions} unreadNotifications={unreadNotifications} />
        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 pt-5 pb-10 min-[641px]:gap-6 min-[641px]:px-10 min-[641px]:pt-8 min-[641px]:pb-14">
          {children}
        </main>
      </div>
    </div>
  );
}
