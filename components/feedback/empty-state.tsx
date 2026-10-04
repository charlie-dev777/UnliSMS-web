import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

function StateTile({ icon: Icon, danger }: { icon: LucideIcon; danger?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-[42px] shrink-0 items-center justify-center rounded-[10px] border",
        danger ? "border-danger-border bg-danger-soft text-destructive" : "border-border bg-muted text-foreground-2",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

function StateBody({ icon, title, description, action, className, danger }: StateProps & { danger?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-5 py-8 text-center", className)}>
      <StateTile icon={icon} danger={danger} />
      <div className="mt-1 font-semibold">{title}</div>
      <p className="m-0 max-w-[240px] text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Nothing to show yet, with an optional next step. Place inside a card. */
export function EmptyState(props: StateProps) {
  return <StateBody {...props} />;
}

/** A load failed; pass a "Try again" button as `action`. */
export function ErrorState(props: StateProps) {
  return (
    <div role="alert">
      <StateBody {...props} danger />
    </div>
  );
}
