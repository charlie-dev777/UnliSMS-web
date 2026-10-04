import { dayKey } from "@/lib/format";

type Offset = { sec?: number; min?: number; hr?: number; days?: number };

/** ISO timestamp `offset` before `now`. */
export function ago(now: Date, { sec = 0, min = 0, hr = 0, days = 0 }: Offset) {
  return new Date(now.getTime() - ((days * 24 + hr) * 60 + min) * 60_000 - sec * 1000).toISOString();
}

/** The last `n` PHT calendar days, oldest first, ending today. */
export function lastDays(now: Date, n: number) {
  return Array.from({ length: n }, (_, i) => dayKey(new Date(now.getTime() - (n - 1 - i) * 86_400_000)));
}
