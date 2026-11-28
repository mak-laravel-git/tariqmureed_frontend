"use client";

import { useSyncExternalStore } from "react";

import { formatMoment, type MomentStyle } from "@/lib/moment";

const subscribe = () => () => {};

interface LocalTimeProps {
  iso: string;
  show: MomentStyle;
  /** What the server wrote, in the site's own time zone: shown until the browser takes over. */
  initial: string;
}

/** A moment in the visitor's own time zone. Use `MatchTime`, which supplies `initial`. */
export function LocalTime({ iso, show, initial }: LocalTimeProps) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatMoment(iso, show),
    () => initial,
  );

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
