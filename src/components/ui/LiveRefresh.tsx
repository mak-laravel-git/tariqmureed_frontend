"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LiveRefreshProps {
  /** Seconds between refreshes. */
  seconds?: number;
}

/**
 * Keeps a live page up to date: re-renders the page's server data every few seconds while the tab is in
 * front, and once more as soon as the visitor comes back to the tab. It draws nothing and does not reload
 * the page, so scroll position and open menus stay as they are.
 */
export function LiveRefresh({ seconds = 10 }: LiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const timer = window.setInterval(refresh, Math.max(5, seconds) * 1000);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, seconds]);

  return null;
}
