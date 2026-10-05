/**
 * Rules for composing an SMS, mirrored from the OnSim API (`app/schemas/messages.py`,
 * `MessageCreateRequest` / `MessageSchedule`). Shared by the compose form (instant
 * feedback) and the server action (authoritative check before calling the API). The API
 * still validates everything; these only catch mistakes before a round trip.
 *
 * No imports, so it runs in the browser, on the server and under `node --test`.
 */

/** `MessageCreateRequest.message` max_length; Python counts code points, not UTF-16 units. */
export const MAX_MESSAGE_LENGTH = 1600;

/** The API's `E164_PATTERN`. It doesn't normalize numbers; it only accepts this form. */
export const E164 = /^\+[1-9][0-9]{6,14}$/;

/** `MessageCreateRequest.sim` accepts only these, even though gateways report slots 1–8. */
export const SENDABLE_SIM_SLOTS = [1, 2] as const;
export type SimValue = "sim1" | "sim2";

export const isSendableSlot = (slot: number): slot is 1 | 2 => slot === 1 || slot === 2;
export const simValue = (slot: 1 | 2): SimValue => (slot === 1 ? "sim1" : "sim2");
export const isSimValue = (value: string): value is SimValue => value === "sim1" || value === "sim2";

/** Length as the API counts it (code points), so emoji count once. */
export const messageLength = (message: string) => [...message].length;

/**
 * Strips the separators people type or paste ("+63 917-555 (0142)") without changing any
 * digit. The API rejects anything that isn't strict E.164 afterwards; a missing country
 * code is never guessed.
 */
export const normalizePhone = (raw: string) => raw.trim().replace(/[\s\-().]/g, "");

export function phoneError(raw: string): string | null {
  const phone = normalizePhone(raw);
  if (!phone) return "Enter the recipient’s phone number.";
  if (E164.test(phone)) return null;
  if (/^0\d+$/.test(phone)) return "Start with + and the country code instead of 0, e.g. +63 917 555 0142.";
  if (/^\d+$/.test(phone)) return "Start with + and the country code, e.g. +63 917 555 0142.";
  return "Enter a number in international format, e.g. +63 917 555 0142.";
}

export function messageError(message: string): string | null {
  if (!message.trim()) return "Enter a message.";
  if (messageLength(message) > MAX_MESSAGE_LENGTH) return `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`;
  return null;
}

// ---------------------------------------------------------------------------
// Scheduling. The API takes the wall-clock time the user chose plus an IANA timezone
// (`scheduled_at: { local_time: "2026-10-06T09:00:00", timezone: "Asia/Manila" }`, no
// UTC offset) and converts it to an instant itself. Times that don't exist (DST gap) or
// occur twice (DST overlap) in that timezone are rejected, as is any time not in the
// future. These helpers reproduce that so the form can explain it before submitting.
// ---------------------------------------------------------------------------

export type WallTime = { year: number; month: number; day: number; hour: number; minute: number };

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2})$/;

/** `<input type="date">` + `<input type="time">` values → wall time, or null if malformed. */
export function parseWallTime(date: string, time: string): WallTime | null {
  const d = DATE.exec(date);
  const t = TIME.exec(time);
  if (!d || !t) return null;
  const wall = { year: +d[1], month: +d[2], day: +d[3], hour: +t[1], minute: +t[2] };
  // Reject impossible calendar dates (Feb 30) and clock times (25:00).
  const check = new Date(Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute));
  const valid =
    check.getUTCFullYear() === wall.year &&
    check.getUTCMonth() === wall.month - 1 &&
    check.getUTCDate() === wall.day &&
    check.getUTCHours() === wall.hour &&
    check.getUTCMinutes() === wall.minute;
  return valid ? wall : null;
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** The API's `local_time`: naive ISO 8601 with seconds, e.g. "2026-10-06T09:00:00". */
export const toLocalTimeString = (w: WallTime) =>
  `${pad(w.year, 4)}-${pad(w.month)}-${pad(w.day)}T${pad(w.hour)}:${pad(w.minute)}:00`;

/** Parses the API's naive `local_time` ("2026-10-06T09:00:00", seconds optional). */
export function parseLocalTimeString(value: string): WallTime | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value);
  return m ? { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] } : null;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone || timeZone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

const wallFormatters = new Map<string, Intl.DateTimeFormat>();

/** The wall time an instant shows in `timeZone` (seconds dropped). */
function wallTimeAt(epochMs: number, timeZone: string): WallTime {
  let f = wallFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    wallFormatters.set(timeZone, f);
  }
  const parts = Object.fromEntries(f.formatToParts(new Date(epochMs)).map((p) => [p.type, p.value]));
  return { year: +parts.year, month: +parts.month, day: +parts.day, hour: +parts.hour % 24, minute: +parts.minute };
}

const wallAsUtc = (w: WallTime) => Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);

export type ZonedResult = { ok: true; epochMs: number } | { ok: false; reason: "nonexistent" | "ambiguous" };

/**
 * The instant a wall time denotes in `timeZone`, with the API's rules: exactly one
 * instant must map back to that wall time (`MessageSchedule.validate_wall_clock_time`).
 */
export function zonedWallTimeToEpoch(wall: WallTime, timeZone: string): ZonedResult {
  const guess = wallAsUtc(wall);
  // Offsets in effect around the guess; a day either side covers any DST transition.
  const offsets = new Set([-86_400_000, 0, 86_400_000].map((d) => wallAsUtc(wallTimeAt(guess + d, timeZone)) - (guess + d)));
  const matches = new Set<number>();
  for (const offset of offsets) {
    const candidate = guess - offset;
    if (wallAsUtc(wallTimeAt(candidate, timeZone)) === guess) matches.add(candidate);
  }
  if (matches.size === 0) return { ok: false, reason: "nonexistent" };
  if (matches.size > 1) return { ok: false, reason: "ambiguous" };
  return { ok: true, epochMs: [...matches][0] };
}

export type ScheduleCheck =
  | { ok: true; localTime: string; epochMs: number }
  | { ok: false; field: "date" | "time" | "timeZone"; error: string };

/** Validates the schedule controls the way the API will, relative to `now`. */
export function checkSchedule(date: string, time: string, timeZone: string, now: number = Date.now()): ScheduleCheck {
  if (!date) return { ok: false, field: "date", error: "Choose a date." };
  if (!time) return { ok: false, field: "time", error: "Choose a time." };
  if (!isValidTimeZone(timeZone)) {
    return { ok: false, field: "timeZone", error: "Your device’s timezone couldn’t be determined, so this SMS can’t be scheduled." };
  }
  const wall = parseWallTime(date, time);
  if (!wall) return { ok: false, field: "date", error: "Choose a valid date and time." };
  const zoned = zonedWallTimeToEpoch(wall, timeZone);
  if (!zoned.ok) {
    return {
      ok: false,
      field: "time",
      error:
        zoned.reason === "nonexistent"
          ? "That time is skipped by a daylight-saving change in your timezone. Choose another time."
          : "That time happens twice because of a daylight-saving change in your timezone. Choose another time.",
    };
  }
  if (zoned.epochMs <= now) return { ok: false, field: "time", error: "Choose a time in the future." };
  return { ok: true, localTime: toLocalTimeString(wall), epochMs: zoned.epochMs };
}

/** Today's date in `timeZone` as YYYY-MM-DD (the date picker's minimum). */
export function todayIn(timeZone: string, now: number = Date.now()) {
  const w = wallTimeAt(now, timeZone);
  return `${pad(w.year, 4)}-${pad(w.month)}-${pad(w.day)}`;
}
