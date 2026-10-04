import type { SignalLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const HEIGHTS = [4, 6, 9, 12];

/** Four-bar SIM signal meter; one bar or fewer shows amber. */
export function SignalBars({ level }: { level: SignalLevel }) {
  const weak = level <= 1;
  return (
    <div className="flex h-3 items-end gap-0.5" aria-hidden>
      {HEIGHTS.map((h, i) => (
        <span
          key={h}
          className={cn("w-[3px] rounded-[1px]", i < level ? (weak ? "bg-warning-strong" : "bg-foreground") : "bg-input")}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}
