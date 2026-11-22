/**
 * Visitor consent for analytics and advertising.
 *
 * The choice lives in one first-party cookie (`tmn_consent`) on this site's own domain. Nothing is
 * ever written to, read from or removed from a Google-owned domain: the browser does not allow it
 * from our code, and the AdSense policy forbids trying.
 */

export const CONSENT_COOKIE = "tmn_consent";

/** How long a saved choice is remembered before the banner asks again. */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

/** Shown by `readConsentCookie` on the server, where cookies are unknown. */
export const CONSENT_UNKNOWN = "unknown";

export interface ConsentChoice {
  analytics: boolean;
  advertising: boolean;
}

/** Cookie value format: `v1-a<0|1>-d<0|1>` (a = analytics, d = advertising). */
export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
  const match = /^v1-a([01])-d([01])$/.exec(raw ?? "");

  return match ? { analytics: match[1] === "1", advertising: match[2] === "1" } : null;
}

function serializeConsent(choice: ConsentChoice): string {
  return `v1-a${choice.analytics ? 1 : 0}-d${choice.advertising ? 1 : 0}`;
}

export function readConsentCookie(): string {
  const match = new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`).exec(document.cookie);

  return match ? decodeURIComponent(match[1]) : "";
}

export type ConsentMode = "builtin" | "google";

const listeners = new Set<() => void>();
let consentMode: ConsentMode = "builtin";

/** Set by the consent banner from the Website Settings so the footer link knows which flow to open. */
export function setConsentMode(mode: ConsentMode): void {
  consentMode = mode;
}

export function getConsentMode(): ConsentMode {
  return consentMode;
}

let settingsOpen = false;

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeToConsent(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function isConsentSettingsOpen(): boolean {
  return settingsOpen;
}

/** Opens the "Privacy settings" dialog. Used by the footer link and the cookie page. */
export function openConsentSettings(): void {
  settingsOpen = true;
  emit();
}

export function closeConsentSettings(): void {
  settingsOpen = false;
  emit();
}

const ANALYTICS_COOKIES = /^(_ga|_gid|_gat)/;
const ADVERTISING_COOKIES = /^(__gads|__gpi|_gcl_)/;

/**
 * Removes Google cookies that sit on this site's own domain for categories the visitor has not
 * allowed (for example after withdrawing consent). Cookies on Google's domains are never touched.
 */
export function removeOwnDomainGoogleCookies({ analytics, advertising }: ConsentChoice): void {
  const hostParts = window.location.hostname.split(".");
  const domains = [undefined, ...hostParts.slice(0, -1).map((_, index) => `.${hostParts.slice(index).join(".")}`)];

  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();

    const stale = (!analytics && ANALYTICS_COOKIES.test(name)) || (!advertising && ADVERTISING_COOKIES.test(name));

    if (!name || !stale) {
      continue;
    }

    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

/**
 * Stores the visitor's choice. When a category that was on is switched off, the Google scripts that
 * are already running are discarded by reloading the page, so nothing keeps collecting. Leftover
 * cookies on our own domain are then removed by `GoogleTags` on the fresh page.
 */
export function saveConsent(choice: ConsentChoice): void {
  const previous = parseConsent(readConsentCookie());
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(choice)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  settingsOpen = false;

  const withdrew =
    (previous?.analytics === true && !choice.analytics) || (previous?.advertising === true && !choice.advertising);

  if (withdrew) {
    window.location.reload();

    return;
  }

  emit();
}
