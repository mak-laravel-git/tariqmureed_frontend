import { Suspense } from "react";

import { CalendarIcon } from "@/components/ui/icons";
import { CompetitionSelect } from "@/components/ui/CompetitionSelect";
import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { FixtureCard } from "@/components/ui/FixtureCard";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { PageIntro } from "@/components/ui/PageIntro";
import { getMatchday } from "@/lib/api/endpoints";
import type { MatchdayView } from "@/lib/api/types";
import { formatLongDate } from "@/lib/format";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

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
}

async function MatchdayBody({
  basePath,
  tabs,
  defaultView,
  searchParams,
}: Omit<MatchdayPageProps, "title" | "description">) {
  const params = await searchParams;
  const requested = firstParam(params.view);
  const view = tabs.find((tab) => tab.key === requested)?.key ?? defaultView;
  const competition = firstParam(params.competition);

  const day = await getMatchday(view, competition);
  const anyLive = day.groups.some((group) => group.matches.some((match) => match.state === "live" || match.state === "break"));

  return (
    <Container className="pb-16">
      {/* Scores move every few seconds while a match is on; the Live tab also watches for a match starting. */}
      {(anyLive || view === "live") && <LiveRefresh seconds={anyLive ? 10 : 30} />}
      <FilterTabs
        className="py-6"
        label="Match view"
        tabs={tabs.map((tab) => ({
          label: tab.label,
          active: tab.key === view,
          href: pageHref(params, { view: tab.key === defaultView ? null : tab.key }, undefined, basePath),
        }))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#e4e4e7] bg-white p-4">
        <p className="flex items-center gap-3 text-sm leading-5 font-bold text-[#09090b]">
          <CalendarIcon width={20} height={20} />
          {formatLongDate(day.date)}
        </p>
        <CompetitionSelect competitions={day.competitions} value={competition} />
      </div>

      {day.groups.length > 0 ? (
        day.groups.map((group) => (
          <section key={group.competition.slug} aria-labelledby={`group-${group.competition.slug}`} className="pt-8">
            <div className="border-b border-[#e4e4e7] pb-4">
              {group.competition.category && (
                <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-[#d08700] uppercase">
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

            <div className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-3">
              {group.matches.map((match) => (
                <FixtureCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="mt-8 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-muted">
          No matches found for this selection.
        </p>
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
