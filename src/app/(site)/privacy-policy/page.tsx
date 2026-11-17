import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What TMN Sports collects, why we collect it, and the choices available to readers.",
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="privacy-policy" />
    </Suspense>
  );
}
