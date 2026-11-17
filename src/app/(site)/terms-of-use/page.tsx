import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use the TMN Sports public website.",
};

export default function TermsOfUsePage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="terms-of-use" />
    </Suspense>
  );
}
