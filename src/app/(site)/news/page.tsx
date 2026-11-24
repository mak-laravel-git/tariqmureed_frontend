import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsletterForm } from "@/components/news/NewsletterForm";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageIntro } from "@/components/ui/PageIntro";
import { getNewsPage, getTeams } from "@/lib/api/endpoints";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/news", { title: "Latest News", description: "Breaking stories, sharp analysis and original reporting from across the world of cricket." });
}

const PAGE_SIZE = 8;

async function NewsBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const category = firstParam(params.category);
  const teamSlug = firstParam(params.team);
  const requestedLimit = Number(firstParam(params.limit));
  const limit = Number.isFinite(requestedLimit) && requestedLimit >= PAGE_SIZE ? Math.min(requestedLimit, 96) : PAGE_SIZE;

  const [teams, page] = await Promise.all([getTeams(), getNewsPage(category, limit, teamSlug)]);
  const team = teams.find((entry) => entry.slug === teamSlug);
  const hasMore = page.total > page.articles.length;

  return (
    <Container className="pt-6 pb-10 md:pb-[74px]">
      <FilterTabs
        label="News categories"
        tabs={[
          { label: "All", active: !category, href: pageHref(params, { category: null, limit: null }, undefined, "/news") },
          ...page.categories.map((entry) => ({
            label: entry.name,
            active: entry.slug === category,
            href: pageHref(params, { category: entry.slug, limit: null }, undefined, "/news"),
          })),
        ]}
      />

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-[11px] leading-[16.5px] font-black tracking-[0.55px] text-[#71717b] uppercase">News by team</p>
        <FilterTabs
          label="News by team"
          tabs={[
            { label: "All teams", active: !team, href: pageHref(params, { team: null, limit: null }, undefined, "/news") },
            ...teams.map((entry) => ({
              label: entry.name,
              active: entry.slug === team?.slug,
              href: pageHref(params, { team: entry.slug, limit: null }, undefined, "/news"),
            })),
          ]}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {page.featured && <FeaturedNewsCard article={page.featured} />}

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {page.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          {page.articles.length === 0 && (
            <p className="rounded-[4px] border border-line bg-white px-5 py-14 text-center text-sm text-muted">
              {team ? `No stories about ${team.name} yet.` : "No stories in this category yet."}
            </p>
          )}

          {hasMore && (
            <Link
              href={pageHref(params, { limit: String(limit + PAGE_SIZE) }, undefined, "/news")}
              scroll={false}
              className="mt-7 flex h-[52px] w-full items-center justify-center rounded-lg border border-[#09090b] text-xs leading-4 font-black tracking-[0.6px] text-[#09090b] uppercase transition-colors hover:bg-[#09090b] hover:text-white"
            >
              Load more stories
            </Link>
          )}
        </div>

        <aside aria-label="Sidebar" className="flex flex-col gap-6 lg:self-start">
          <AdSlot placement="news-sidebar" />

          <section className="rounded-lg bg-[#f4f4f5] p-6">
            <h2 className="text-lg leading-7 font-black text-[#09090b]">Get the daily briefing</h2>
            <p className="mt-2 text-sm leading-6 text-[#71717b]">The essential stories, delivered every morning.</p>
            <NewsletterForm />
          </section>
        </aside>
      </div>
    </Container>
  );
}

export default function NewsPage(props: PageProps<"/news">) {
  return (
    <>
      <PageIntro
        title="Latest News"
        description="Breaking stories, sharp analysis and original reporting from across the world of cricket."
      />
      <Suspense fallback={<div role="status" aria-label="Loading news" className="min-h-[900px]" />}>
        <NewsBody searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
