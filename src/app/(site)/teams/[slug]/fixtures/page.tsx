import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { MatchCard } from "@/components/ui/MatchCard";
import { PageIntro } from "@/components/ui/PageIntro";
import { getTeamSchedule } from "@/lib/api/endpoints";
import { profileMetadata } from "@/lib/seo";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

export async function generateMetadata(props: PageProps<"/teams/[slug]/fixtures">): Promise<Metadata> {
  const { slug } = await props.params;
  const team = (await getTeamSchedule(slug))?.team;

  if (!team) {
    return {};
  }

  return profileMetadata({
    path: `/teams/${team.slug}/fixtures`,
    title: `${team.name}: fixtures and results`,
    description: `Upcoming matches, start times and results of ${team.name} on TMN Sport.`,
  });
}

function Message({ children }: { children: string }) {
  return <p className="mt-6 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-muted">{children}</p>;
}

async function ScheduleView({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> }) {
  const { slug } = await params;
  const query = await searchParams;
  const schedule = await getTeamSchedule(slug);

  if (!schedule) {
    notFound();
  }

  const { team, upcoming, results } = schedule;

  if (!team) {
    return (
      <Container className="py-16">
        <Message>Fixtures are not available right now.</Message>
      </Container>
    );
  }

  const path = `/teams/${team.slug}/fixtures`;
  // The API lists matches being played together with those still to come.
  const live = upcoming.filter((match) => match.state === "live" || match.state === "break");
  const tabs = [
    { key: "live", label: "Live", matches: live, empty: `No ${team.name} match is live right now.` },
    { key: "upcoming", label: "Upcoming", matches: upcoming.filter((match) => !live.includes(match)), empty: `No upcoming matches for ${team.name} yet.` },
    { key: "results", label: "Results", matches: results, empty: `No results for ${team.name} yet.` },
  ];
  // Without a choice in the address the page opens on the live match, if there is one.
  const requested = firstParam(query.view);
  const view = tabs.find((tab) => tab.key === requested) ?? tabs[live.length > 0 ? 0 : 1];

  return (
    <>
      <PageIntro title={`${team.name} fixtures`} description={`Live and upcoming matches and results of ${team.name}.`}>
        <Link href={`/teams/${team.slug}`} className="mt-4 inline-block text-sm leading-5 font-bold text-ink hover:underline">
          <span aria-hidden="true">←</span> Back to {team.name}
        </Link>
      </PageIntro>

      <Container className="pb-16">
        {/* Scores move every few seconds while a match is on; the Live tab also watches for a match starting. */}
        {(live.length > 0 || view.key === "live") && <LiveRefresh seconds={live.length > 0 ? 10 : 30} />}
        <FilterTabs
          className="py-6"
          label="Match view"
          tabs={tabs.map((tab) => ({
            label: tab.label,
            active: tab.key === view.key,
            href: pageHref(query, { view: tab.key }, undefined, path),
          }))}
        />

        {view.matches.length > 0 ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {view.matches.map((match) => (
              <MatchCard key={match.id} match={match} fill />
            ))}
          </div>
        ) : (
          <Message>{view.empty}</Message>
        )}
      </Container>
    </>
  );
}

export default function TeamFixturesPage(props: PageProps<"/teams/[slug]/fixtures">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading fixtures" className="min-h-[800px]" />}>
      <ScheduleView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
