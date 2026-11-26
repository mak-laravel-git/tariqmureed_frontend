import type { Metadata } from "next";
import { Suspense } from "react";

import { LegalPageView } from "@/components/legal/LegalPageView";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/terms-of-use", {
    title: "Terms of Use",
    description: "The terms that apply when you use the TMN Sport public website.",
  });
}

export default function TermsOfUsePage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[640px]" />}>
      <LegalPageView slug="terms-of-use" />
    </Suspense>
  );
}
