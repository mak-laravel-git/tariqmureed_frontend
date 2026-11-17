import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

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

export const metadata: Metadata = {
  title: {
    default: "TMN Sport — Live cricket scores, news, stats and video",
    template: "%s | TMN Sport",
  },
  description:
    "TMN Sport is an independent cricket media house delivering live scores, news, analysis, statistics and video from every major international and franchise competition.",
};

export const viewport: Viewport = {
  themeColor: "#fed402",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${barlowCondensed.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-ink">{children}</body>
    </html>
  );
}
