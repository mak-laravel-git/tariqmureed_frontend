import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/cookie-preferences", {
    title: "Cookie Preferences",
    description: "How TMN Sport uses cookies and how you can control them.",
  });
}

export default function CookiePreferencesPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="cookie-preferences" />
    </Suspense>
  );
}
