import Link from "next/link";

import { AdSlot } from "@/components/ui/AdSlot";
import { MatchCard } from "@/components/ui/MatchCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { getTeamFixtures, getTeams } from "@/lib/api/endpoints";
import type { TeamProfile } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

function TeamProfileCard({ team }: { team: TeamProfile }) {
  const rows = [
    { label: "Captain", value: team.captain },
    { label: "Coach", value: team.coach },
    { label: "Home ground", value: team.homeGround },
    { label: "Titles", value: team.titles },
  ];

  return (
    <aside aria-label={`${team.name} profile`} className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <TeamBadge team={team} size={48} />
        <div>
          <p className="text-sm leading-5 font-bold text-ink">{team.name}</p>
          <p className="text-[11px] leading-[16.5px] text-muted">{team.membership}</p>
        </div>
      </div>

      <dl className="mt-3 flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 border-t border-line py-2 first:border-t-0">
            <dt className="max-w-[72px] text-xs leading-[18px] text-muted">{row.label}</dt>
            <dd className="text-right text-xs leading-[18px] font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/teams/${team.slug}`}
        className="mt-3 inline-block text-xs leading-[18px] font-bold text-ink hover:underline"
      >
        Team profile →
      </Link>
    </aside>
  );
}

interface TeamFixturesProps {
  searchParams: Promise<SearchParams>;
}

export async function TeamFixtures({ searchParams }: TeamFixturesProps) {
  const params = await searchParams;
  const teams = await getTeams();

  const requested = firstParam(params.team);
  const activeSlug = teams.find((team) => team.slug === requested)?.slug ?? teams[0]?.slug;
  const fixtures = activeSlug ? await getTeamFixtures(activeSlug) : null;

  return (
    <Section id="team-fixtures" tone="surface" aria-labelledby="team-fixtures-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="team-fixtures-title"
          title="Team Fixtures"
          description="Select a team to see its matches, results and squad links."
          action={{ href: "/schedule", label: "View all" }}
        />

        <nav
          aria-label="Teams"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto pr-4 pl-4 sm:-mx-6 sm:pr-6 sm:pl-6 md:mx-0 md:flex-wrap md:overflow-visible md:pr-0 md:pl-[23px] [&::-webkit-scrollbar]:hidden"
        >
          {teams.map((team) => {
            const active = team.slug === activeSlug;

            return (
              <Link
                key={team.slug}
                href={pageHref(params, { team: team.slug === teams[0]?.slug ? null : team.slug }, "team-fixtures")}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-[4px] border px-4 py-2 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink hover:border-ink",
                )}
              >
                {team.name}
              </Link>
            );
          })}
        </nav>

        {fixtures ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid min-w-0 grid-cols-1 content-start items-start gap-[18px] md:grid-cols-2">
              {fixtures.matches.length > 0 ? (
                fixtures.matches.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-muted md:col-span-2">
                  No fixtures scheduled for {fixtures.team.name} yet.
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3.5">
              <TeamProfileCard team={fixtures.team} />
              <AdSlot placement="home-team" />
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-muted">
            Fixtures are not available right now.
          </p>
        )}
      </div>
    </Section>
  );
}
