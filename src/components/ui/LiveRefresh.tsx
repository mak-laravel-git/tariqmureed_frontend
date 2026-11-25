"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

interface LiveRefreshProps {
  /** Seconds between refreshes. */
  seconds?: number;
}

/** A visitor counts as busy for this long after the last touch, click, key press or scroll. */
const BUSY_MS = 4000;
/** A refresh slower than this means a slow connection; the next ones are spread out. */
const SLOW_MS = 1500;
/** Longest wait between refreshes on a slow connection. */
const MAX_WAIT_MS = 60_000;
/** Wait between refreshes on a data saver or 2G connection. */
const SAVER_WAIT_MS = 60_000;

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function isLowBandwidth(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

  return Boolean(connection?.saveData) || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
}

/**
 * Keeps a live page up to date: re-renders the page's server data every few seconds while the tab is in
 * front, and once more as soon as the visitor comes back to the tab. It draws nothing and does not reload
 * the page, so scroll position and open menus stay as they are.
 *
 * A refresh holds up navigation until it finishes, so it is kept out of the visitor's way: it never starts
 * while the previous one is still running or while the visitor is touching or scrolling the page, and it
 * backs off on slow connections, so the Back button and links answer straight away.
 */
export function LiveRefresh({ seconds = 10 }: LiveRefreshProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const startedAt = useRef(0);
  const baseDelay = useRef(Math.max(5, seconds) * 1000);
  const delay = useRef(Math.max(5, seconds) * 1000);
  const lastActivity = useRef(0);

  useEffect(() => {
    pendingRef.current = pending;

    if (!pending && startedAt.current > 0) {
      const took = performance.now() - startedAt.current;
      startedAt.current = 0;
      delay.current = took > SLOW_MS ? Math.min(MAX_WAIT_MS, Math.max(baseDelay.current, took * 6)) : baseDelay.current;
    }
  }, [pending]);

  useEffect(() => {
    baseDelay.current = Math.max(5, seconds) * 1000;
    delay.current = baseDelay.current;

    let timer = 0;
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, ms);
    };

    const refresh = () => {
      startedAt.current = performance.now();
      startTransition(() => router.refresh());
    };

    function tick() {
      if (document.visibilityState !== "visible") {
        schedule(delay.current);

        return;
      }

      if (Date.now() - lastActivity.current < BUSY_MS || pendingRef.current) {
        schedule(1500);

        return;
      }

      refresh();
      schedule(isLowBandwidth() ? Math.max(delay.current, SAVER_WAIT_MS) : delay.current);
    }

    const markBusy = () => {
      lastActivity.current = Date.now();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible" && !pendingRef.current) {
        refresh();
        schedule(delay.current);
      }
    };

    const busyEvents = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
    busyEvents.forEach((name) => window.addEventListener(name, markBusy, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    schedule(delay.current);

    return () => {
      window.clearTimeout(timer);
      busyEvents.forEach((name) => window.removeEventListener(name, markBusy));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, seconds, startTransition]);

  return null;
}
