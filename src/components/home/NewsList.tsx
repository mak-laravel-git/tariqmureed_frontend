"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { loadMoreNews } from "@/app/actions/news";
import { Photo } from "@/components/ui/Photo";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Article } from "@/lib/api/types";

function NewsListItem({ article }: { article: Article }) {
  return (
    <article className="flex items-center justify-between gap-4 border-b border-line py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[10.5px] leading-[15px] font-bold tracking-[0.6px] text-muted uppercase">
          {article.category} · <TimeAgo iso={article.publishedAt} />
        </p>
        <h3 className="text-base leading-[22px] font-bold text-ink">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-1 text-[13px] leading-5 text-muted">{article.excerpt}</p>
      </div>

      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block size-[76px] shrink-0 overflow-hidden rounded-[4px] sm:size-24"
      >
        <Photo src={article.image} alt={article.imageAlt ?? ""} sizes="96px" />
      </Link>
    </article>
  );
}

interface NewsListProps {
  initialArticles: Article[];
  /** Stories already on screen, including the cards above this list. */
  shownCount: number;
  initialHasMore: boolean;
}

/** The latest news rows, with a button that adds older stories below without leaving the page. */
export function NewsList({ initialArticles, shownCount, initialHasMore }: NewsListProps) {
  const [loaded, setLoaded] = useState<Article[]>([]);
  const [offset, setOffset] = useState(shownCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  // A story published in the meantime shifts the older ones down, so skip any already listed.
  const listed = new Set(initialArticles.map((article) => article.id));
  const articles = [...initialArticles, ...loaded.filter((article) => !listed.has(article.id))];

  function handleLoadMore() {
    setFailed(false);
    startTransition(async () => {
      try {
        const next = await loadMoreNews(offset);

        setOffset(offset + next.articles.length);
        setLoaded((current) => {
          const known = new Set(current.map((article) => article.id));
          return [...current, ...next.articles.filter((article) => !known.has(article.id))];
        });
        setHasMore(next.hasMore);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <>
      <div className="border-t border-line">
        {articles.map((article) => (
          <NewsListItem key={article.id} article={article} />
        ))}
      </div>

      {failed && (
        <p role="alert" className="text-center text-sm text-live">
          Could not load more news. Please try again.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={pending}
            className="cursor-pointer rounded-[4px] border border-line bg-white px-5 py-3 text-sm leading-5 font-semibold text-ink transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Loading…" : "Load more news"}
          </button>
        </div>
      )}
    </>
  );
}
