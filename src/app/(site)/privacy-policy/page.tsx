import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/privacy-policy", {
    title: "Privacy Policy",
    description: "What TMN Sport collects, why we collect it, and the choices available to readers.",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="privacy-policy" />
    </Suspense>
  );
}
