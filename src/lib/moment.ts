/**
 * Dates and times of matches, written the same way on the server and in the browser. Without a time zone the
 * one of whoever runs the code is used: in the browser, the visitor's own.
 */

export type MomentStyle =
  /** "04:00" */
  | "time"
  /** "04:00 GMT+6" */
  | "timeZone"
  /** "4:00 AM GMT+6" */
  | "time12Zone"
  /** "Fri 27 Nov" */
  | "date"
  /** "Friday, 27 November 2026" */
  | "longDate"
  /** "Fri 04:00 GMT+6" */
  | "dayTimeZone";

function parts(date: Date, options: Intl.DateTimeFormatOptions, timeZone?: string): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { ...options, timeZone })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
}

export function formatMoment(iso: string, style: MomentStyle, timeZone?: string): string {
  const date = new Date(iso);
  const clock = () => parts(date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, timeZone);
  const time = () => `${clock().hour}:${clock().minute}`;
  // "GMT+6", "GMT+5:30" or "GMT".
  const zone = () => parts(date, { timeZoneName: "shortOffset" }, timeZone).timeZoneName;

  switch (style) {
    case "time":
      return time();
    case "timeZone":
      return `${time()} ${zone()}`;
    case "time12Zone": {
      const twelve = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone }).format(date);

      return `${twelve} ${zone()}`;
    }
    case "date": {
      const day = parts(date, { weekday: "short", day: "numeric", month: "short" }, timeZone);

      return `${day.weekday} ${day.day} ${day.month}`;
    }
    case "longDate": {
      const day = parts(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }, timeZone);

      return `${day.weekday}, ${day.day} ${day.month} ${day.year}`;
    }
    case "dayTimeZone":
      return `${parts(date, { weekday: "short" }, timeZone).weekday} ${time()} ${zone()}`;
  }
}

/** "2026-11-27": the calendar day the moment falls on in the time zone. */
export function calendarDay(iso: string, timeZone: string): string {
  const day = parts(new Date(iso), { year: "numeric", month: "2-digit", day: "2-digit" }, timeZone);

  return `${day.year}-${day.month}-${day.day}`;
}

export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });

    return true;
  } catch {
    return false;
  }
}

/** The cookie in which the browser tells the server the visitor's time zone. */
export const TIMEZONE_COOKIE = "tmn_tz";
