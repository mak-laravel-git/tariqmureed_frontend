import type { MetadataRoute } from "next";

import { getSeo, getSitemap } from "@/lib/api/endpoints";
import { resolveSiteUrl } from "@/lib/seo";

/** The fixed pages, with how often each one changes. */
const pages: { path: string; changeFrequency: "always" | "hourly" | "daily" | "weekly"; priority: number }[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/news", changeFrequency: "hourly", priority: 0.9 },
  { path: "/live-scores", changeFrequency: "always", priority: 0.9 },
  { path: "/schedule", changeFrequency: "daily", priority: 0.8 },
  { path: "/series", changeFrequency: "daily", priority: 0.7 },
  { path: "/teams", changeFrequency: "weekly", priority: 0.6 },
  { path: "/players", changeFrequency: "weekly", priority: 0.6 },
  { path: "/stats", changeFrequency: "daily", priority: 0.6 },
  { path: "/records", changeFrequency: "weekly", priority: 0.5 },
  { path: "/videos", changeFrequency: "daily", priority: 0.6 },
];

/**
 * /sitemap.xml: the fixed pages (except those marked "do not index" in the SEO screen), every story that may be
 * indexed, and the team, player, series, writer and recent match pages. Empty while search engines are switched off.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, data] = await Promise.all([getSeo(), getSitemap()]);

  if (!seo.settings.seoIndexing) {
    return [];
  }

  const site = resolveSiteUrl(seo);
  const url = (path: string): string => `${site}${path}`;
  const profiles = (prefix: string, slugs: string[], priority: number): MetadataRoute.Sitemap =>
    slugs.map((slug) => ({ url: url(`${prefix}/${slug}`), changeFrequency: "weekly", priority }));

  // Home and the news list change whenever a story is published or edited, so they carry the newest story's date.
  const newestStory = data.articles.reduce<string | undefined>(
    (newest, article) => (!newest || article.updatedAt > newest ? article.updatedAt : newest),
    undefined,
  );
  const changesWithStories = new Set(["/", "/news"]);

  return [
    ...pages
      .filter((page) => !seo.pages[page.path]?.noindex)
      .map((page) => ({
        url: url(page.path),
        ...(newestStory && changesWithStories.has(page.path) ? { lastModified: newestStory } : {}),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })),
    ...data.articles.map((article) => ({
      url: url(`/news/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...profiles("/series", data.series, 0.6),
    ...profiles("/teams", data.teams, 0.5),
    ...profiles("/players", data.players, 0.5),
    ...profiles("/writers", data.writers, 0.4),
    ...data.matches.map((slug) => ({ url: url(`/matches/${slug}`), changeFrequency: "hourly" as const, priority: 0.5 })),
  ];
}
