import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";

export const metadata: Metadata = {
  title: "Cookie Preferences",
  description: "How TMN Sports uses cookies and how you can control them.",
};

export default function CookiePreferencesPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="cookie-preferences" />
    </Suspense>
  );
}
