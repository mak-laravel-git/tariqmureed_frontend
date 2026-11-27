"use server";

import { getLatestNews } from "@/lib/api/endpoints";
import type { Article } from "@/lib/api/types";

/** The most stories GET /articles returns in one request. */
const MAX_STORIES = 50;
const BATCH_SIZE = 6;

export interface MoreNews {
  articles: Article[];
  hasMore: boolean;
}

/** The next batch of the home page's latest news, after the `offset` stories already on screen. */
export async function loadMoreNews(offset: number): Promise<MoreNews> {
  // Server Actions are public endpoints, so the argument is not trusted.
  const start = Number.isInteger(offset) && offset > 0 ? offset : 0;
  const stories = await getLatestNews(MAX_STORIES);
  const end = start + BATCH_SIZE;

  return { articles: stories.slice(start, end), hasMore: stories.length > end };
}
