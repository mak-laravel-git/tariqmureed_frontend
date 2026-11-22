import type { ReactNode } from "react";
import { Suspense } from "react";

import { SiteTracking } from "@/components/consent/SiteTracking";
import { AlertTicker, AlertTickerFallback } from "@/components/layout/AlertTicker";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SeriesStrip, SeriesStripFallback } from "@/components/layout/SeriesStrip";
import { TopBar } from "@/components/layout/TopBar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <Suspense fallback={<SeriesStripFallback />}>
        <SeriesStrip />
      </Suspense>
      <Suspense fallback={<AlertTickerFallback />}>
        <AlertTicker />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <SiteTracking />
      </Suspense>
    </>
  );
}
