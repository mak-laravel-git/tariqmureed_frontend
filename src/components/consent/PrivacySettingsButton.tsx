"use client";

import { getConsentMode, openConsentSettings } from "@/lib/consent";

/**
 * Reopens the visitor's cookie choices. With Google's own message in charge (consent mode "google" in Website Settings)
 * it asks Google's Funding Choices script to show its revocation message instead.
 */
function openPrivacySettings(): void {
  if (getConsentMode() === "google") {
    const googlefc = (window as unknown as { googlefc?: { showRevocationMessage?: () => void } }).googlefc;

    googlefc?.showRevocationMessage?.();

    return;
  }

  openConsentSettings();
}

export function PrivacySettingsButton({ className, children = "Privacy settings" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={openPrivacySettings} className={className}>
      {children}
    </button>
  );
}
