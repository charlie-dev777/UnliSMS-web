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

export function AccountMenu({ user, className }: { user: User; className?: string }) {
  const [pending, startTransition] = useTransition();
  const admin = user.role === "ADMIN";
  const subtitle = admin ? "Platform admin" : user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-12 justify-start gap-2.5 px-2 text-left", className)} aria-label="Account menu">
          <Avatar initials={initials(user.name)} variant={admin ? "admin" : "default"} />
          <span className="flex min-w-0 flex-col leading-[18px]">
            <span className="truncate text-[13px] font-medium">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{subtitle}</span>
          </span>
          <ChevronsUpDown className="ml-auto text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-[13px] text-foreground">{user.name}</span>
          <span className="font-normal">{user.email}</span>
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
