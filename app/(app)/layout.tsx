import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentUser, fmt, plan } from "@/lib/mock-data";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pct = Math.round((plan.used / plan.limit) * 100);
  return (
    <AppShell
      user={currentUser}
      homeHref="/dashboard"
      searchPlaceholder="Search messages, numbers, gateways…"
      unreadNotifications
      topbarActions={
        <Link href="/docs" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-fg-2" })}>
          API docs
        </Link>
      }
      sidebarFooter={
        <Card className="mt-2 flex flex-col gap-2.5 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">{plan.name}</span>
            <Link href="/billing" className="text-xs font-medium text-primary-solid hover:text-primary-dark">
              Upgrade
            </Link>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-[3px] bg-[#EEF0F3]"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Monthly SMS usage"
          >
            <div className="h-full rounded-[3px] bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="num text-xs text-muted-fg">
            {fmt(plan.used)} of {fmt(plan.limit)} SMS this month
          </span>
        </Card>
      }
    >
      {children}
    </AppShell>
  );
}
