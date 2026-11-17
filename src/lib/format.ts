import { apiConfig } from "@/lib/api/config";

const dayMonthFormat = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone });

const timeFormat = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone });

/** "Thu 12 Nov" */
export function formatMatchDate(iso: string): string {
  return dayMonthFormat(apiConfig.timezone).format(new Date(iso)).replace(",", "");
}

/** "13:30" */
export function formatMatchTime(iso: string): string {
  return timeFormat(apiConfig.timezone).format(new Date(iso));
}

/** "3:00 PM" */
export function formatMatchTime12(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: apiConfig.timezone,
  }).format(new Date(iso));
}

/** "Wednesday, 18 June 2026" */
export function formatLongDate(iso: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: apiConfig.timezone,
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );

  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;
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
