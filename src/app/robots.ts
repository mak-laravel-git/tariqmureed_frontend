import type { MetadataRoute } from "next";

import { getSeo } from "@/lib/api/endpoints";
import { resolveSiteUrl } from "@/lib/seo";

/**
 * /robots.txt, built from the admin SEO screen: switching "Allow search engines" off asks every crawler to stay
 * away; otherwise the public pages are open, the dashboard and search results are not, and the sitemap is listed.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo();

  if (!seo.settings.seoIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const site = resolveSiteUrl(seo);

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/search"] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
