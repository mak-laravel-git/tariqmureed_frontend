import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { CountryName } from "@/components/ui/CountryName";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageIntro } from "@/components/ui/PageIntro";
import { PlayerPhoto } from "@/components/ui/PlayerPhoto";
import { getPlayers } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

const DESCRIPTION = "Profiles and career statistics for cricketers from around the world.";

const roles = [
  { value: "", label: "All" },
  { value: "batter", label: "Batters" },
  { value: "bowler", label: "Bowlers" },
  { value: "allrounder", label: "All-rounders" },
  { value: "wicketkeeper", label: "Wicketkeepers" },
];

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/players", { title: "Players", description: DESCRIPTION });
}

const pageLinkClass =
  "flex h-11 items-center rounded-[4px] border border-[#09090b] px-5 text-xs font-black tracking-[0.6px] text-[#09090b] uppercase transition-colors hover:bg-[#09090b] hover:text-white";

async function PlayersBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const search = (firstParam(params.search) ?? "").trim().slice(0, 100);
  const role = roles.find((entry) => entry.value === firstParam(params.role))?.value ?? "";
  const requestedPage = Number(firstParam(params.page));
  const page = Number.isInteger(requestedPage) && requestedPage > 1 ? requestedPage : 1;

  const list = await getPlayers(search, role, page).catch(() => null);
  const href = (target: number) => pageHref(params, { page: target > 1 ? String(target) : null }, undefined, "/players");

  return (
    <Container className="pt-8 pb-16">
      {/* The key puts the current search back in the box after moving between results. */}
      <Form key={search} action="/players" className="flex max-w-[520px] gap-2">
        <input
          type="search"
          name="search"
          defaultValue={search}
          maxLength={100}
          placeholder="Search players by name"
          aria-label="Search players by name"
          className="h-11 min-w-0 flex-1 rounded-[4px] border border-[#d4d4d8] bg-white px-4 text-sm text-[#09090b] outline-none focus-visible:border-[#09090b]"
        />
        {role && <input type="hidden" name="role" value={role} />}
        <button type="submit" className="h-11 cursor-pointer rounded-[4px] bg-[#09090b] px-5 text-xs font-black tracking-[0.6px] text-white uppercase">
          Search
        </button>
      </Form>

      <FilterTabs
        label="Player roles"
        className="mt-4"
        tabs={roles.map((entry) => ({
          label: entry.label,
          active: entry.value === role,
          href: pageHref(params, { role: entry.value || null, page: null }, undefined, "/players"),
        }))}
      />

      {!list && (
        <p role="alert" className="mt-8 rounded-[4px] border border-line bg-white px-5 py-14 text-center text-sm text-muted">
          Players could not be loaded right now. Please refresh the page in a moment.
        </p>
      )}

      {list && (
        <>
          <p aria-live="polite" className="mt-6 text-sm text-muted">
            {list.total.toLocaleString("en-US")} {list.total === 1 ? "player" : "players"}
          </p>

          {list.players.length === 0 ? (
            <p className="mt-4 rounded-[4px] border border-line bg-white px-5 py-14 text-center text-sm text-muted">
              No players match your search.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {list.players.map((player) => (
                // Not prefetched: a page of cards would ask the API for every profile at once.
                <Link key={player.id} href={`/players/${player.slug}`} prefetch={false} className="group block min-w-0">
                  <div className="relative aspect-[314/372] overflow-hidden rounded-[4px] border border-line">
                    <PlayerPhoto src={player.image} alt={player.name} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                  </div>
                  <p className="min-h-[30px] pt-3 text-[10px] leading-[15px] font-black text-[#d08700] uppercase">
                    <CountryName name={player.country || player.team} />
                  </p>
                  <h2 className="pt-1 text-base leading-6 font-black break-words text-[#09090b] group-hover:underline">{player.name}</h2>
                  <p className="text-sm leading-5 text-[#71717b]">{player.role}</p>
                </Link>
              ))}
            </div>
          )}

          {list.lastPage > 1 && (
            <nav aria-label="Player pages" className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {list.page > 1 && (
                <Link href={href(Math.min(list.page - 1, list.lastPage))} className={pageLinkClass}>
                  ← Previous
                </Link>
              )}
              <span className="text-sm font-bold text-[#09090b]">
                Page {list.page} of {list.lastPage}
              </span>
              {list.page < list.lastPage && (
                <Link href={href(list.page + 1)} className={pageLinkClass}>
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </Container>
  );
}

export default function PlayersPage(props: PageProps<"/players">) {
  return (
    <>
      <PageIntro title="Players" description={DESCRIPTION} />
      <Suspense fallback={<div role="status" aria-label="Loading players" className="min-h-[600px]" />}>
        <PlayersBody searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
