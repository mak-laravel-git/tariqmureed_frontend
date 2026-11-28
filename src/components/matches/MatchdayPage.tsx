import Link from "next/link";
import { Suspense } from "react";

import { TimezoneSync } from "@/components/matches/TimezoneSync";
import { CalendarIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { FixtureCard } from "@/components/ui/FixtureCard";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { PageIntro } from "@/components/ui/PageIntro";
import { getMatchday } from "@/lib/api/endpoints";
import type { Match, MatchdayView } from "@/lib/api/types";
import { formatCalendarDate, formatCalendarMonth } from "@/lib/format";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";
import { visitorTimezone } from "@/lib/visitor-timezone";

/** Matches the month and year views show at first, and add with each "Load more". */
const PAGE_SIZE = 60;

export interface MatchdayTab {
  key: MatchdayView;
  label: string;
}

interface MatchdayPageProps {
  title: string;
  description: string;
  basePath: string;
  tabs: MatchdayTab[];
  /** Tab shown when no ?view= is given. */
  defaultView: MatchdayView;
  searchParams: Promise<SearchParams>;
  /** Adds the "All teams" drop-down. */
  teamFilter?: boolean;
}

function FixtureGrid({ matches }: { matches: Match[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <FixtureCard key={match.id} match={match} />
      ))}
    </div>
  );
}

async function MatchdayBody({
  basePath,
  tabs,
  defaultView,
  searchParams,
  teamFilter,
}: Omit<MatchdayPageProps, "title" | "description">) {
  const params = await searchParams;
  const requested = firstParam(params.view);
  const view = tabs.find((tab) => tab.key === requested)?.key ?? defaultView;
  const competition = firstParam(params.competition);
  const team = teamFilter ? firstParam(params.team) : undefined;
  const show = Number(firstParam(params.show));
  const limit = Number.isInteger(show) && show > PAGE_SIZE ? show : undefined;

  // "Today" and "Tomorrow" are the visitor's, not the server's.
  const timezone = await visitorTimezone();
  const day = await getMatchday(view, competition, timezone, team, limit);
  const matches = day.days ? day.days.flatMap((entry) => entry.matches) : day.groups.flatMap((group) => group.matches);
  const anyLive = matches.some((match) => match.state === "live" || match.state === "break");
  const heading = view === "month" ? formatCalendarMonth(day.date) : view === "year" ? day.date.slice(0, 4) : formatCalendarDate(day.date);

  return (
    <Container className="pb-16">
      <TimezoneSync used={timezone} />
      {/* Scores move every few seconds while a match is on; the Live tab also watches for a match starting.
          The long month and year lists are refreshed less often. */}
      {(anyLive || view === "live") && <LiveRefresh seconds={anyLive && !day.days ? 10 : 30} />}
      <FilterTabs
        className="py-6"
        label="Match view"
        tabs={tabs.map((tab) => ({
          label: tab.label,
          active: tab.key === view,
          href: pageHref(params, { view: tab.key === defaultView ? null : tab.key, show: null }, undefined, basePath),
        }))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#e4e4e7] bg-white p-4">
        <p className="flex items-center gap-3 text-sm leading-5 font-bold text-[#09090b]">
          <CalendarIcon width={20} height={20} />
          {heading}
        </p>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <FilterSelect param="competition" label="Filter by tournament" allLabel="All tournaments" options={day.competitions} value={competition} />
          {teamFilter && <FilterSelect param="team" label="Filter by team" allLabel="All teams" options={day.teams ?? []} value={team} />}
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="mt-8 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-muted">
          No matches found for this selection.
        </p>
      ) : day.days ? (
        <>
          {day.days.map((entry) => (
            <section key={entry.date} aria-labelledby={`day-${entry.date}`} className="pt-8">
              <h2
                id={`day-${entry.date}`}
                className="flex flex-wrap items-center gap-3 border-b border-[#e4e4e7] pb-4 text-xl leading-7 font-bold text-[#09090b]"
              >
                {formatCalendarDate(entry.date)}
                {entry.date === day.date && (
                  <span className="rounded-[4px] bg-brand px-2 py-0.5 text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase">Today</span>
                )}
              </h2>
              <FixtureGrid matches={entry.matches} />
            </section>
          ))}

          {day.total !== undefined && (
            <div className="flex flex-col items-center gap-3 pt-10">
              <p className="text-xs leading-4 text-muted">
                Showing {matches.length} of {day.total} matches
              </p>
              {matches.length < day.total && (
                <Link
                  href={pageHref(params, { show: String(matches.length + PAGE_SIZE) }, undefined, basePath)}
                  replace
                  scroll={false}
                  className="rounded-[4px] border border-ink bg-white px-6 py-3 text-xs leading-4 font-black tracking-[0.6px] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
                >
                  Load more matches
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        day.groups.map((group) => (
          <section key={group.competition.slug} aria-labelledby={`group-${group.competition.slug}`} className="pt-8">
            <div className="border-b border-[#e4e4e7] pb-4">
              {group.competition.category && (
                <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-brand uppercase">
                  {group.competition.category}
                </p>
              )}
              <h2
                id={`group-${group.competition.slug}`}
                className="pt-2 text-[30px] leading-9 font-bold text-[#09090b]"
              >
                {group.competition.name}
              </h2>
            </div>

            <FixtureGrid matches={group.matches} />
          </section>
        ))
      )}
    </Container>
  );
}

/** Shared layout of the Live Scores and Match Schedule pages. */
export function MatchdayPage({ title, description, ...body }: MatchdayPageProps) {
  return (
    <>
      <PageIntro title={title} description={description} />
      <Suspense fallback={<div role="status" aria-label="Loading fixtures" className="min-h-[640px]" />}>
        <MatchdayBody {...body} />
      </Suspense>
    </>
  );
}
