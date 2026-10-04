"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AccountMenu } from "./account-menu";
import { AdminTag } from "./admin-tag";
import { AppSidebar, type AppSidebarProps } from "./app-sidebar";
import { LogoMark } from "./logo";
import { NotificationsButton } from "./notifications-button";
import { portals } from "./nav";

/** Below 1024px: sticky compact header; the sidebar opens in a sheet from the left. */
export function MobileNav({ unreadNotifications, ...sidebar }: Omit<AppSidebarProps, "onNavigate"> & { unreadNotifications?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-[57px] items-center gap-2 border-b border-border bg-background px-3 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar {...sidebar} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Link
        href={portals[sidebar.portal].homeHref}
        className="flex h-10 min-w-0 items-center gap-2 rounded-lg px-1 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={sidebar.portal === "admin" ? "UnliSMS admin home" : "UnliSMS home"}
      >
        <LogoMark width={48} height={30} />
        <span className="text-[15px] font-semibold">UnliSMS</span>
      </Link>
      {sidebar.portal === "admin" && <AdminTag />}
      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton unread={unreadNotifications} />
        <AccountMenu user={sidebar.user} compact />
      </div>
    </header>
  );
}
