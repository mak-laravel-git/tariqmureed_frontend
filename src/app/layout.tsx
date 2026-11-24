import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { getSeo } from "@/lib/api/endpoints";
import { resolveSiteUrl, sharingMetadata } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-barlow",
  display: "swap",
});

/** Title format, description, share previews, indexing switch and verification codes from the admin SEO screen. */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const home = seo.pages["/"];
  const title = home?.title || "TMN Sport — Live cricket scores, news, stats and video";
  const description =
    home?.description ||
    "TMN Sport is an independent cricket media house delivering live scores, news, analysis, statistics and video from every major international and franchise competition.";
  const { settings } = seo;

  return {
    metadataBase: new URL(resolveSiteUrl(seo)),
    applicationName: settings.websiteName || "TMN Sport",
    title: { default: title, template: settings.seoTitleTemplate || "%s | TMN Sport" },
    description,
    ...sharingMetadata(seo, { title, description, image: home?.image }),
    robots: settings.seoIndexing ? undefined : { index: false, follow: false },
    verification: {
      google: settings.seoGoogleVerification || undefined,
      other: settings.seoBingVerification ? { "msvalidate.01": settings.seoBingVerification } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fed402",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${barlowCondensed.variable} h-full`}>
      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans text-ink">{children}</body>
    </html>
  );
}
