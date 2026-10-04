/** Every UnliSMS customer is in the Philippines; times render in PHT. */
export const TIME_ZONE = "Asia/Manila";

const MINUS = "−";

export const formatNumber = (n: number) => n.toLocaleString("en-US");

/** 96.4 → "96.4%". */
export const formatPercent = (pct: number, digits = 1) => `${pct.toFixed(digits)}%`;

/** part / whole as a percentage; 0 when there is no whole. */
export const ratioPct = (part: number, whole: number) => (whole === 0 ? 0 : (part / whole) * 100);

const signed = (n: number, digits: number) => `${n < 0 ? MINUS : "+"}${Math.abs(n).toFixed(digits)}`;

/** 8.2 → "+8.2%", -0.3 → "−0.3%". */
export const formatChangePct = (pct: number) => `${signed(pct, 1)}%`;

/** 0.6 → "+0.6 pts". */
export const formatChangePts = (pts: number) => `${signed(pts, 1)} pts`;

/** 2400 → "2.4k", 600 → "600", 240000 → "240k". */
export function formatCompact(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** "https://api.acme.ph/hooks/sms" → "api.acme.ph/hooks/sms". */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Calendar day in PHT as YYYY-MM-DD. */
export const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);

const clock = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });
const monthDay = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, month: "short", day: "numeric" });

/** "10:42 AM". */
export const formatClockTime = (iso: string) => clock.format(new Date(iso));

/** "Oct 2". */
export const formatMonthDay = (iso: string) => monthDay.format(new Date(iso));

const dateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Oct 4, 2026, 10:42 AM" (PHT). */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** 512 → "512 MB", 41230 → "40.3 GB". */
export const formatMegabytes = (mb: number) => (mb >= 1024 ? `${+(mb / 1024).toFixed(1)} GB` : `${formatNumber(mb)} MB`);

/** "Just now", "12 sec ago", "2 min ago", "3 hr ago", "Yesterday", "Sep 28". */
export function formatRelativeTime(iso: string, now: Date = new Date()) {
  const then = new Date(iso);
  const sec = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24 && dayKey(then) === dayKey(now)) return `${hr} hr ago`;
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (dayKey(then) === dayKey(yesterday)) return "Yesterday";
  if (hr < 24) return `${hr} hr ago`;
  return monthDay.format(then);
}
