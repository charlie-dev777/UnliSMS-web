import type { MessageRecurrence, MessageSchedule } from "@/lib/types";
import { parseLocalTimeString, type WallTime } from "@/lib/messages/compose";

// Wall times are formatted as UTC so the digits the user chose are shown unchanged,
// labelled with the timezone they were scheduled in.
const wallFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const longWallFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const wallDate = (w: WallTime) => new Date(Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute));

/** "Oct 6, 2026, 9:00 AM" — the scheduled wall-clock time, without the timezone. */
export function formatWallTime(localTime: string) {
  const wall = parseLocalTimeString(localTime);
  return wall ? wallFormat.format(wallDate(wall)) : localTime;
}

/** "Tuesday, October 6, 2026 at 9:00 AM". */
export const formatWallTimeLong = (wall: WallTime) => longWallFormat.format(wallDate(wall));

/** "Oct 6, 2026, 9:00 AM (Asia/Manila)". */
export const formatSchedule = (s: MessageSchedule) => `${formatWallTime(s.localTime)} (${s.timeZone})`;

/** "GMT+8" for an instant in `timeZone`; empty if the runtime can't name it. */
export function utcOffsetLabel(epochMs: number, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(epochMs);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

const DAY: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const dateOnly = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });

/** "Repeats every 2 weeks on Mon, Wed · until Oct 30, 2026". */
export function formatRecurrence(r: MessageRecurrence) {
  const unit = r.frequency === "daily" ? "day" : "week";
  let text = r.interval === 1 ? `Repeats ${r.frequency}` : `Repeats every ${r.interval} ${unit}s`;
  if (r.frequency === "weekly" && r.daysOfWeek.length > 0) text += ` on ${r.daysOfWeek.map((d) => DAY[d] ?? d).join(", ")}`;
  if (r.until) {
    const [y, m, d] = r.until.split("-").map(Number);
    text += ` · until ${y && m && d ? dateOnly.format(new Date(Date.UTC(y, m - 1, d))) : r.until}`;
  } else if (r.count) {
    text += ` · ${r.count} ${r.count === 1 ? "send" : "sends"} in total`;
  }
  return text;
}

/** First line of a message for list rows; full text stays available on the detail page. */
export const messagePreview = (body: string) => body.replace(/\s+/g, " ").trim();
