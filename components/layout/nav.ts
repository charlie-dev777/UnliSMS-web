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

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Muted count on the right, e.g. "3/4". */
  meta?: string;
  /** Red pill count on the right, e.g. failed webhooks. */
  alert?: string;
  /** Small amber dot on the right (degraded service). */
  warnDot?: string;
};

export type NavGroup = { label: string; items: NavItem[] };

export const userNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Messages", href: "/messages", icon: MessageSquare },
      { label: "Gateways", href: "/gateways", icon: Smartphone, meta: "3/4" },
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
];

export const adminNav: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Gateways", href: "/admin/gateways", icon: Smartphone },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare },
      { label: "Webhooks", href: "/admin/webhooks", icon: Webhook, alert: "312" },
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
      { label: "System", href: "/admin/system", icon: Server, warnDot: "1 service degraded" },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
