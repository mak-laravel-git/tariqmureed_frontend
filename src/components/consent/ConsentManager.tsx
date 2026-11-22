"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  closeConsentSettings,
  CONSENT_UNKNOWN,
  isConsentSettingsOpen,
  openConsentSettings,
  parseConsent,
  readConsentCookie,
  saveConsent,
  setConsentMode,
  subscribeToConsent,
  type ConsentChoice,
  type ConsentMode,
} from "@/lib/consent";

const ACCEPT_ALL: ConsentChoice = { analytics: true, advertising: true };
const DECLINE_ALL: ConsentChoice = { analytics: false, advertising: false };

/** Accept and decline carry the same size and weight so neither is easier to pick than the other. */
const choiceButton =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-[4px] px-5 text-sm font-semibold transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none";

interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function ToggleRow({ id, title, description, checked, disabled = false, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-line py-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {title}
        </label>
        <p id={`${id}-description`} className="mt-1 text-[13px] leading-5 text-muted">
          {description}
        </p>
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-describedby={`${id}-description`}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-0.5 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-[#c7ccd4] transition-colors checked:bg-win disabled:cursor-not-allowed disabled:opacity-60 relative before:absolute before:top-0.5 before:left-0.5 before:size-5 before:rounded-full before:bg-white before:transition-transform before:content-[''] checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </div>
  );
}

/** The "Privacy settings" dialog. Mounted only while open so its toggles start from the saved choice. */
function SettingsDialog({ saved }: { saved: ConsentChoice | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(saved?.analytics ?? false);
  const [advertising, setAdvertising] = useState(saved?.advertising ?? false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="privacy-settings-title"
      onClose={closeConsentSettings}
      className="m-auto w-[calc(100%-32px)] max-w-[520px] rounded-lg bg-white p-0 text-ink shadow-2xl backdrop:bg-black/60"
    >
      <div className="max-h-[calc(100dvh-32px)] overflow-y-auto p-5 sm:p-6">
        <h2 id="privacy-settings-title" className="text-lg font-bold">
          Privacy settings
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-muted">
          Choose which cookies TMN Sport may use. You can change this at any time from the “Privacy settings” link at the
          bottom of every page. Read the{" "}
          <Link href="/privacy-policy" className="text-ink underline" onClick={closeConsentSettings}>
            Privacy Policy
          </Link>{" "}
          for details.
        </p>

        <div className="mt-4">
          <ToggleRow
            id="consent-essential"
            title="Essential"
            description="Remembers this choice and keeps the site secure. Always on."
            checked
            disabled
          />
          <ToggleRow
            id="consent-analytics"
            title="Analytics"
            description="Google Analytics shows us which pages are read so we can improve the site."
            checked={analytics}
            onChange={setAnalytics}
          />
          <ToggleRow
            id="consent-advertising"
            title="Advertising"
            description="Google AdSense and its advertising partners show ads and may use cookies, IP addresses and similar identifiers."
            checked={advertising}
            onChange={setAdvertising}
          />
        </div>

        <div className="mt-2 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row">
          <button
            type="button"
            onClick={() => saveConsent({ analytics, advertising })}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[4px] bg-ink px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-125"
          >
            Save my choices
          </button>
          <button
            type="button"
            onClick={() => saveConsent(ACCEPT_ALL)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[4px] bg-gold px-5 text-sm font-semibold text-black transition-[filter] hover:brightness-95"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => saveConsent(DECLINE_ALL)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[4px] border border-ink bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Decline all
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Cookie banner and "Privacy settings" dialog. The banner shows until the visitor accepts, declines
 * or saves their own mix, and the footer link reopens the dialog later.
 */
export function ConsentManager({ mode }: { mode: ConsentMode }) {
  const raw = useSyncExternalStore(subscribeToConsent, readConsentCookie, () => CONSENT_UNKNOWN);
  const settingsOpen = useSyncExternalStore(subscribeToConsent, isConsentSettingsOpen, () => false);

  useEffect(() => {
    setConsentMode(mode);
  }, [mode]);

  // With Google's own "Privacy & messaging" message in charge, this site's banner stays out of the way.
  if (mode === "google") {
    return null;
  }

  const saved = parseConsent(raw);
  const showBanner = raw !== CONSENT_UNKNOWN && saved === null && !settingsOpen;

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-tuna bg-ink text-white shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="mx-auto flex w-full max-w-site flex-col gap-4 px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6 lg:flex-row lg:items-center lg:gap-8 xl:px-8">
            <p className="text-[13px] leading-5 text-white/80 lg:flex-1">
              We use cookies for analytics and to show ads. Google and its advertising partners may use cookies and IP
              addresses for this. You decide which ones we may use. See our{" "}
              <Link href="/privacy-policy" className="text-white underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => saveConsent(DECLINE_ALL)} className={`${choiceButton} bg-white text-black`}>
                Decline all
              </button>
              <button type="button" onClick={() => saveConsent(ACCEPT_ALL)} className={`${choiceButton} bg-gold text-black`}>
                Accept all
              </button>
              <button
                type="button"
                onClick={openConsentSettings}
                className="inline-flex min-h-11 w-full items-center justify-center px-2 text-sm font-semibold text-white underline underline-offset-4 hover:text-gold sm:w-auto"
              >
                Manage choices
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && <SettingsDialog saved={saved} />}
    </>
  );
}
