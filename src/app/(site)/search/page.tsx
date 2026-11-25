import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SearchFilters, resolveSearchType } from "@/components/search/SearchFilters";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { Container } from "@/components/ui/Container";
import { getSearchResults } from "@/lib/api/endpoints";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Search",
  description: "Search TMN Sport for news, matches, teams, players and video.",
  robots: { index: false, follow: true },
};

const PAGE_SIZE = 8;
const MAX_QUERY_LENGTH = 100;

async function SearchBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = (firstParam(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const type = resolveSearchType(firstParam(params.type));
  const requestedLimit = Number(firstParam(params.limit));
  const limit = Number.isFinite(requestedLimit) && requestedLimit >= PAGE_SIZE ? Math.min(requestedLimit, 96) : PAGE_SIZE;

  const found = query ? await getSearchResults(query, type, limit) : null;

  return (
    <Container className="py-10 md:py-16">
      <p className="text-[11px] leading-[16.5px] font-black tracking-[2.26px] text-[#d08700] uppercase">
        Search TMN Sport
      </p>

      <div className="pt-4">
        <SearchForm query={query} type={type} />
      </div>

      {!found && (
        <div className="py-16 text-center md:py-20">
          <h2 className="text-2xl leading-8 font-black tracking-[0.07px] text-[#09090b]">What are you looking for?</h2>
          <p className="mt-2 text-base leading-6 tracking-[-0.31px] text-[#71717b]">
            Try a player, team, tournament or story.
          </p>
        </div>
      )}

      {found && (
        <div className="pt-8 md:pt-10">
          <p aria-live="polite" className="text-sm leading-5 tracking-[-0.15px] text-[#71717b]">
            {found.total === 0 ? (
              <>No results for </>
            ) : (
              <>
                {found.total} {found.total === 1 ? "result" : "results"} for{" "}
              </>
            )}
            <strong className="font-bold text-black">“{query}”</strong>
          </p>

          <div className="pt-8 pb-6 md:pt-14">
            <SearchFilters active={type} params={params} />
          </div>

          {found.results.length > 0 ? (
            <div className="max-w-[896px]">
              <ul className="flex flex-col gap-7 pt-4">
                {found.results.map((result) => (
                  <li key={result.id}>
                    <SearchResultItem result={result} />
                  </li>
                ))}
              </ul>

              {found.total > found.results.length && (
                <Link
                  href={pageHref(params, { limit: String(limit + PAGE_SIZE) }, undefined, "/search")}
                  replace
                  scroll={false}
                  className="mt-10 flex h-11 w-full items-center justify-center rounded-[4px] border border-[#09090b] bg-white text-[11px] font-black tracking-[0.16em] text-[#09090b] uppercase transition-colors hover:bg-[#09090b] hover:text-white"
                >
                  Load more results
                </Link>
              )}
            </div>
          ) : (
            <div className="py-16 text-center md:py-20">
              <h2 className="text-2xl leading-8 font-black tracking-[0.07px] text-[#09090b]">Nothing found</h2>
              <p className="mt-2 text-base leading-6 tracking-[-0.31px] text-[#71717b]">
                Check the spelling, or try a player, team, tournament or story.
              </p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading search" className="min-h-[560px]" />}>
      <SearchBody searchParams={props.searchParams} />
    </Suspense>
  );
}
