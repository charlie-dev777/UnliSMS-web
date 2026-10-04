import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  KeyRound,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Server,
  Settings,
  Smartphone,
  Users,
  Webhook,
} from "lucide-react";

export type Portal = "user" | "admin";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

/** Right-hand adornment on a nav item, keyed by href. */
export type NavBadge =
  | { kind: "count"; text: string } // muted, e.g. "3/4"
  | { kind: "alert"; text: string } // red pill, e.g. failed webhooks
  | { kind: "warning"; label: string }; // amber dot, label read by screen readers

export type NavBadges = Partial<Record<string, NavBadge>>;

export const portals: Record<Portal, { homeHref: string; searchPlaceholder: string; nav: NavGroup[] }> = {
  user: {
    homeHref: "/dashboard",
    searchPlaceholder: "Search messages, numbers, gateways…",
    nav: [
      {
        label: "Overview",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Gateways", href: "/gateways", icon: Smartphone },
        ],
      },
      {
        label: "Developers",
        items: [
          { label: "Webhooks", href: "/webhooks", icon: Webhook },
          { label: "API Keys", href: "/api-keys", icon: KeyRound },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Usage", href: "/usage", icon: BarChart3 },
          { label: "Settings", href: "/settings", icon: Settings },
        ],
      },
    ],
  },
  admin: {
    homeHref: "/admin/dashboard",
    searchPlaceholder: "Search users, gateway IDs, message IDs…",
    nav: [
      {
        label: "Operations",
        items: [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Gateways", href: "/admin/gateways", icon: Smartphone },
          { label: "Messages", href: "/admin/messages", icon: MessageSquare },
          { label: "Webhooks", href: "/admin/webhooks", icon: Webhook },
        ],
      },
      {
        label: "Billing",
        items: [
          { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
          { label: "Plans", href: "/admin/plans", icon: Layers },
        ],
      },
      {
        label: "Platform",
        items: [
          { label: "System", href: "/admin/system", icon: Server },
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ],
      },
    ],
  },
};
