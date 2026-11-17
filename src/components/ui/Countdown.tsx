"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function label(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();

  if (diff <= 0) {
    return "";
  }

  const totalMinutes = Math.floor(diff / MINUTE);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}

/** Time left until kick-off ("2h 14m"); renders nothing on the server so cached pages never go stale. */
export function Countdown({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => label(iso),
    () => "",
  );

  return text ? (
    <span suppressHydrationWarning>
      <span aria-hidden="true"> · </span>
      {text}
    </span>
  ) : null;
}
