"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { TIMEZONE_COOKIE } from "@/lib/moment";

/**
 * For pages the server arranges by day: tells it the visitor's time zone through a cookie and asks for the page
 * again when it was built for another one. Draws nothing.
 */
export function TimezoneSync({ used }: { used: string }) {
  const router = useRouter();

  useEffect(() => {
    const own = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!own || own === used) {
      return;
    }

    const cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(own)}`;

    // Already told: the server cannot use this zone, so asking again would never end.
    if (document.cookie.split("; ").includes(cookie)) {
      return;
    }

    document.cookie = `${cookie}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [router, used]);

  return null;
}
