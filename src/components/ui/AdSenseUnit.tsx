"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseUnitProps {
  /** Publisher ID ("ca-pub-…") from the website settings. */
  clientId: string;
  /** Ad unit (slot) ID from the AdSense account. */
  slot: string;
}

/**
 * A Google AdSense display unit. The AdSense script is only loaded once the visitor allows advertising (see
 * GoogleTags), so until then this stays an empty box; the request is queued and answered when the script arrives.
 */
export function AdSenseUnit({ clientId, slot }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense refuses a second request for the same box; nothing to do.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block w-full"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
