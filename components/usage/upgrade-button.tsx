"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * There's no plans page, checkout or billing API yet, so Upgrade only says so. It makes no
 * request and never navigates.
 */
export function UpgradeButton({
  size = "sm",
  variant = "outline",
  className,
}: {
  size?: "sm" | "default";
  /** "default" is the brand blue (`--primary`). */
  variant?: "default" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      <Button type="button" size={size} variant={variant} aria-expanded={open} onClick={() => setOpen(true)}>
        <Sparkles aria-hidden />
        Upgrade
      </Button>
      <p aria-live="polite" className="m-0 text-xs text-muted-foreground">
        {open ? "Upgrade options coming soon." : null}
      </p>
    </div>
  );
}
