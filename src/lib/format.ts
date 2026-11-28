import { apiConfig } from "@/lib/api/config";
import { formatMoment } from "@/lib/moment";

// Match times are shown in the visitor's own time zone: use <MatchTime> for those.

/** "Friday, 27 November 2026" for a calendar date such as "2026-11-27", which belongs to no time zone. */
export function formatCalendarDate(date: string): string {
  return formatMoment(date, "longDate", "UTC");
}

/** "June 2026", from an ISO date. */
export function formatCalendarMonth(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}

/** "18 June 2026" */
export function formatPublishedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: apiConfig.timezone,
  }).format(new Date(iso));
}
