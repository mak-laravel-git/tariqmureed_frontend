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

/** Open Graph / X (Twitter) details every page shares; a page adds its own title, text and picture on top. */
export function sharingMetadata(
  seo: SeoData,
  page: { title: string; description?: string; image?: string; path?: string; type?: "website" | "article" },
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = page.image || seo.settings.seoDefaultImage;
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
