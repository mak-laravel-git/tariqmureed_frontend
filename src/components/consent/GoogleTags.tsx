"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import {
  CONSENT_UNKNOWN,
  parseConsent,
  readConsentCookie,
  removeOwnDomainGoogleCookies,
  subscribeToConsent,
} from "@/lib/consent";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Defines `gtag()` the way Google's snippet does (it queues `arguments` objects, not arrays). */
function ensureGtag(): Gtag {
  const dataLayer = (window.dataLayer ??= []);

  window.gtag ??= function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };

  return window.gtag;
}

function signal(allowed: boolean): "granted" | "denied" {
  return allowed ? "granted" : "denied";
}

interface GoogleTagsProps {
  /** GA4 Measurement ID ("G-…") from Website Settings; empty loads no analytics. */
  gaMeasurementId: string;
  /** AdSense publisher ID ("ca-pub-…") from Website Settings; empty loads no ads. */
  adsenseClientId: string;
  /**
   * "builtin": this site's own banner decides, and no Google script is requested until the visitor
   * has said yes to that category. "google": the Google-certified "Privacy & messaging" message from
   * the AdSense account decides; the tags then load straight away in "denied" mode.
   */
  mode: "builtin" | "google";
}

/** Loads Google Analytics and AdSense only for the categories the visitor has allowed. */
export function GoogleTags({ gaMeasurementId, adsenseClientId, mode }: GoogleTagsProps) {
  const googleManaged = mode === "google";
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribeToConsent, readConsentCookie, () => CONSENT_UNKNOWN);
  const consent = useMemo(() => parseConsent(raw), [raw]);

  const analyticsAllowed = googleManaged || consent?.analytics === true;
  const advertisingAllowed = googleManaged || consent?.advertising === true;
  const loadAnalytics = gaMeasurementId !== "" && analyticsAllowed;
  // Ad code reads the full page address, and on search pages that address holds what the visitor typed.
  const queryPage = pathname.startsWith("/search");
  const loadAdvertising = adsenseClientId !== "" && advertisingAllowed && !queryPage;

  // After a withdrawal the page reloads without the scripts; clear what they left on our own domain.
  useEffect(() => {
    if (!googleManaged && consent) {
      removeOwnDomainGoogleCookies(consent);
    }
  }, [consent, googleManaged]);

  const started = useRef({ consentMode: false, analytics: false });

  useEffect(() => {
    if (!loadAnalytics && !loadAdvertising) {
      return;
    }

    const gtag = ensureGtag();
    const adsGranted = !googleManaged && consent?.advertising === true;
    const analyticsGranted = !googleManaged && consent?.analytics === true;

    // Consent Mode: the default must be queued before any other Google command.
    if (!started.current.consentMode) {
      gtag("consent", "default", {
        analytics_storage: signal(analyticsGranted),
        ad_storage: signal(adsGranted),
        ad_user_data: signal(adsGranted),
        ad_personalization: signal(adsGranted),
      });
      gtag("set", "ads_data_redaction", true);
      started.current.consentMode = true;
    } else if (!googleManaged) {
      gtag("consent", "update", {
        analytics_storage: signal(analyticsGranted),
        ad_storage: signal(adsGranted),
        ad_user_data: signal(adsGranted),
        ad_personalization: signal(adsGranted),
      });
    }

    if (loadAnalytics && !started.current.analytics) {
      gtag("js", new Date());
      gtag("config", gaMeasurementId, {
        send_page_view: false,
        allow_google_signals: adsGranted,
        allow_ad_personalization_signals: adsGranted,
      });
      started.current.analytics = true;
    }
  }, [consent, loadAnalytics, loadAdvertising, googleManaged, gaMeasurementId]);

  // Page views carry origin + path only: query strings (search terms) and the referrer stay out.
  useEffect(() => {
    if (!loadAnalytics || !started.current.analytics) {
      return;
    }

    ensureGtag()("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_referrer: "",
      page_title: document.title,
    });
  }, [loadAnalytics, pathname]);

  return (
    <>
      {loadAnalytics && (
        <Script
          id="google-analytics-library"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
          strategy="afterInteractive"
        />
      )}
      {loadAdvertising && (
        <Script
          id="google-adsense-library"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
