import Link from "next/link";

import { AdSlot } from "@/components/ui/AdSlot";
import { MatchTime } from "@/components/ui/MatchTime";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { getMatches } from "@/lib/api/endpoints";

export async function ComingUpNext() {
  const matches = await getMatches("upcoming", 3);

  return (
    <Section aria-labelledby="coming-up-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="coming-up-title"
          title="Coming Up Next"
          description="The next start times."
          action={{ href: "/schedule", label: "View all" }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.slug}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-4 transition-colors hover:border-ink"
            >
              <span className="flex shrink-0 items-center gap-2">
                <TeamBadge team={match.home.team} size={34} />
                <span aria-hidden="true" className="text-xs text-muted">
                  v
                </span>
                <TeamBadge team={match.away.team} size={34} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm leading-5 font-bold text-ink">
                  {match.home.team.name} vs {match.away.team.name}
                </span>
                <span className="block truncate text-xs leading-[18px] text-muted">
                  <MatchTime iso={match.startsAt} show="dayTimeZone" />
                  {match.venue ? ` · ${match.venue}` : ""}
                </span>
              </span>

              <span className="hidden shrink-0 sm:block">
                <Tag tone="gold" className="px-2.5 py-1.5 tracking-[1.2px]">
                  Upcoming
                </Tag>
              </span>
            </Link>
          ))}
        </div>

        <AdSlot placement="home-bottom" className="mt-1 max-w-[1260px]" />
      </div>
    </Section>
  );
}
