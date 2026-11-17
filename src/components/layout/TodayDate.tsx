"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function todayLabel(): string {
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;
}

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/** Today's date in the visitor's locale; blank during server rendering to avoid stale cached dates. */
export function TodayDate({ className }: { className?: string }) {
  const label = useSyncExternalStore(subscribe, todayLabel, () => "");

  return (
    <time className={className} suppressHydrationWarning>
      {label || " "}
    </time>
  );
}
