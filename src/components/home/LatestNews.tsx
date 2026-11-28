import Link from "next/link";
import type { ReactNode } from "react";

import { AuthorLink } from "@/components/news/AuthorLink";
import { AdSlot } from "@/components/ui/AdSlot";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { getLatestNews, getStatHighlights, getTopHeadlines } from "@/lib/api/endpoints";
import type { Article, StatHighlight } from "@/lib/api/types";

import { NewsList } from "./NewsList";

/** Stories shown before "Load more news" is used: four cards and five rows. */
const SHOWN_STORIES = 9;

function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-xs leading-[18px] text-muted">
      <AuthorLink author={article.author} className="font-semibold text-ink" />
      <span aria-hidden="true">·</span>
      <TimeAgo iso={article.publishedAt} />
      <span aria-hidden="true">·</span>
      <span>{article.readMinutes} min read</span>
    </p>
  );
}

function NewsCard({ article }: { article: Article }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block aspect-[374/196]"
      >
        <Photo
          src={article.image}
          alt={article.imageAlt ?? ""}
          sizes="(min-width: 1320px) 474px, (min-width: 640px) 45vw, 100vw"
        />
        <Tag tone="dark" className="absolute top-3 left-3">
          {article.category}
        </Tag>
      </Link>

      <div className="flex flex-col gap-2 border-t border-line p-4">
        <h3 className="text-base leading-[22px] font-bold text-ink">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[13px] leading-5 text-muted">{article.excerpt}</p>
        <div className="pt-1.5">
          <ArticleMeta article={article} />
        </div>
      </div>
    </article>
  );
}

function AsideHeading({ children, display }: { children: ReactNode; display?: boolean }) {
  return (
    <div className="flex items-center gap-2 border-b-2 border-ink pb-2.5">
      <span aria-hidden="true" className="h-4 w-1 rounded-full bg-gold" />
      <h2
        className={
          display
            ? "font-display text-lg leading-6 font-bold tracking-[0.5px] text-ink uppercase"
            : "text-lg leading-6 font-bold tracking-[-0.5px] text-ink capitalize"
        }
      >
        {children}
      </h2>
    </div>
  );
}

export function HeadlineItem({ article, titleSize = "base" }: { article: Article; titleSize?: "base" | "lg" }) {
  return (
    <article className="min-w-0 border-b border-line pb-5">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block aspect-[320/149] overflow-hidden rounded-[4px]"
      >
        <Photo src={article.image} alt={article.imageAlt ?? ""} sizes="320px" />
      </Link>
      <p className="mt-3 text-[10px] leading-[15px] font-bold tracking-[1.2px] text-muted uppercase">
        {article.category} · <TimeAgo iso={article.publishedAt} />
      </p>
      <h3
        className={
          titleSize === "lg"
            ? "mt-1 text-[17px] leading-[22px] font-bold text-ink"
            : "mt-1 text-[15px] leading-[21px] font-bold text-ink"
        }
      >
        <Link href={`/news/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </h3>
      <p className="mt-1.5 truncate text-[13px] leading-5 text-muted">{article.excerpt}</p>
    </article>
  );
}

function FactCard({ fact }: { fact: StatHighlight }) {
  return (
    <div className="rounded-lg border border-line bg-surface/50 px-4 py-3.5">
      <p className="text-[30px] leading-9 font-extrabold tracking-[-0.5px] text-ink">{fact.value}</p>
      <p className="mt-0.5 text-[13px] leading-[19.5px] font-bold text-ink">{fact.label}</p>
      <p className="text-[11px] leading-[16.5px] text-muted">{fact.context}</p>
    </div>
  );
}

export async function LatestNews() {
  const [articles, headlines, facts] = await Promise.all([
    // One more than is shown, to know whether "Load more news" has anything to add.
    getLatestNews(SHOWN_STORIES + 1),
    getTopHeadlines(),
    getStatHighlights(),
  ]);

  const shown = articles.slice(0, SHOWN_STORIES);
  const cards = shown.slice(0, 4);
  const list = shown.slice(4);

  return (
    <Section aria-labelledby="latest-news-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,968fr)_minmax(0,320fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionHeading
            id="latest-news-title"
            title="Latest News"
            description="Newest first, across every competition."
            action={{ href: "/news", label: "View all" }}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {cards.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          <NewsList initialArticles={list} shownCount={shown.length} initialHasMore={articles.length > SHOWN_STORIES} />
        </div>

        <aside aria-label="Headlines and statistics" className="flex min-w-0 flex-col gap-8">
          <section aria-label="Top headlines">
            <AsideHeading>Top Headlines</AsideHeading>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {headlines.map((article) => (
                <HeadlineItem key={article.id} article={article} />
              ))}
            </div>
          </section>

          <AdSlot placement="home-sidebar-top" />

          {facts.length > 0 && (
            <section aria-label="Number crunching">
              <AsideHeading>Number Crunching</AsideHeading>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {facts.map((fact) => (
                  <FactCard key={fact.label} fact={fact} />
                ))}
              </div>
              <Link href="/stats" className="mt-4 inline-block text-[13px] leading-[19.5px] font-bold text-ink hover:underline">
                Full statistics centre →
              </Link>
            </section>
          )}

          <AdSlot placement="home-sidebar-bottom" />
        </aside>
      </div>
    </Section>
  );
}

export { AsideHeading };
