import "server-only";

import type { Metadata } from "next";

import { getSeo } from "@/lib/api/endpoints";
import type { SeoData } from "@/lib/api/types";

const FALLBACK_SITE_URL = "http://localhost:3000";

/** The website's public address: the SEO screen first, then SITE_URL, then localhost while developing. */
export function resolveSiteUrl(seo: SeoData): string {
  const address = seo.settings.seoSiteUrl || process.env.SITE_URL || FALLBACK_SITE_URL;

  try {
    return new URL(address.trim()).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

/** Picture shown when a page is shared and neither the page nor the SEO screen has one. */
const BUILT_IN_SHARE_IMAGE = "/images/brand/og-default.png";

/** The website's public address, read from the SEO screen (cached with the rest of the SEO data). */
export async function getSiteUrl(): Promise<string> {
  return resolveSiteUrl(await getSeo());
}

/** Makes "/images/a.jpg" a full address; addresses that already start with http are left alone. */
export function absoluteUrl(site: string, address: string): string {
  return address.startsWith("http") ? address : `${site}${address.startsWith("/") ? "" : "/"}${address}`;
}

/** A short sentence for the search result: spaces collapsed, cut at a word before 160 characters. */
export function summarize(text: string, limit = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();

  if (clean.length <= limit) {
    return clean;
  }

  const cut = clean.slice(0, limit - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), limit - 30))}…`;
}

/** schema.org BreadcrumbList; the last crumb is the page itself. */
export function breadcrumbSchema(site: string, crumbs: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(site, crumb.path),
    })),
  };
}

/** Open Graph / X (Twitter) details every page shares; a page adds its own title, text and picture on top. */
export function sharingMetadata(
  seo: SeoData,
  page: { title: string; description?: string; image?: string; path?: string; type?: "website" | "article" },
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = page.image || seo.settings.seoDefaultImage || BUILT_IN_SHARE_IMAGE;
  const handle = seo.settings.seoTwitterHandle ? `@${seo.settings.seoTwitterHandle.replace(/^@/, "")}` : undefined;

  return {
    openGraph: {
      type: page.type ?? "website",
      siteName: seo.settings.websiteName || "TMN Sport",
      locale: "en_US",
      title: page.title,
      description: page.description,
      url: page.path,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: page.title,
      description: page.description,
      images: image ? [image] : undefined,
      site: handle,
    },
  };
}

/**
 * Metadata of one team, player, series, match or video page: the page's own title and description, the canonical
 * address (without "?tab=...") and share previews. Closing the whole site to search is handled in the root layout.
 */
export async function profileMetadata(page: {
  path: string;
  title: string;
  description: string;
  image?: string | null;
}): Promise<Metadata> {
  const seo = await getSeo();
  const description = summarize(page.description);

  return {
    title: page.title,
    description,
    alternates: { canonical: page.path },
    ...sharingMetadata(seo, { title: page.title, description, image: page.image || undefined, path: page.path }),
  };
}

/**
 * Metadata of a fixed website page ("/news", "/live-scores"...): the text edited in the admin SEO screen wins,
 * the page's own title and description fill the gaps. Adds the canonical address, share previews and the
 * "do not index" switch.
 */
export async function pageMetadata(path: string, fallback: { title: string; description: string }): Promise<Metadata> {
  const seo = await getSeo();
  const page = seo.pages[path];
  const title = page?.title || fallback.title;
  const description = page?.description || fallback.description;

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    ...sharingMetadata(seo, { title, description, image: page?.image, path }),
    robots: page?.noindex ? { index: false, follow: true } : undefined,
  };
}
