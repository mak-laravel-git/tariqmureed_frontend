"use client";

import { useSyncExternalStore } from "react";

interface TimeAgoProps {
  /** ISO 8601 timestamp. */
  iso: string;
  className?: string;
}

const MINUTE = 60_000;

function relativeLabel(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / MINUTE);

  if (minutes < 2) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

/** Stable label used for server rendering and the first client render. */
function staticLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
}

/**
 * Relative timestamp ("4h ago") that stays correct after the page was cached:
 * the server renders a static date and the browser upgrades it to a live label.
 */
export function TimeAgo({ iso, className }: TimeAgoProps) {
  const label = useSyncExternalStore(
    subscribe,
    () => relativeLabel(iso),
    () => staticLabel(iso),
  );

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
