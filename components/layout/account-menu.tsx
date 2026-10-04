"use client";

import { useTransition } from "react";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import type { User } from "@/lib/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Sidebar account button, or an avatar-only trigger (`compact`) for the
 * mobile header.
 */
export function AccountMenu({ user, className, compact }: { user: User; className?: string; compact?: boolean }) {
  const [pending, startTransition] = useTransition();
  const admin = user.role === "ADMIN";
  const subtitle = admin ? "Platform admin" : user.email;
  const avatar = <Avatar initials={initials(user.name)} variant={admin ? "admin" : "default"} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className={cn("rounded-full", className)} aria-label="Account menu">
            {avatar}
          </Button>
        ) : (
          <Button variant="ghost" className={cn("h-12 justify-start gap-2.5 px-2 text-left", className)} aria-label="Account menu">
            {avatar}
            <span className="flex min-w-0 flex-col leading-[18px]">
              <span className="truncate text-[13px] font-medium">{user.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{subtitle}</span>
            </span>
            <ChevronsUpDown className="ml-auto text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={compact ? "bottom" : "top"}
        align={compact ? "end" : "start"}
        collisionPadding={8}
        className={cn("max-w-[calc(100vw-16px)]", !compact && "w-(--radix-dropdown-menu-trigger-width)")}
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-[13px] text-foreground">{user.name}</span>
          <span className="truncate font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={pending} onSelect={() => startTransition(() => signOut())}>
          <LogOut />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
