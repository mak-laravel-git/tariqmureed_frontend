import Link from "next/link";

import { MatchCard } from "@/components/ui/MatchCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMatches } from "@/lib/api/endpoints";

export async function MatchCoverage() {
  const matches = await getMatches("upcoming", 3);

  return (
    <Section tone="surface" aria-labelledby="match-coverage-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="match-coverage-title"
          title="Match Coverage"
          description="Every upcoming fixture with venues, start times and head-to-head records."
          action={{ href: "/schedule", label: "View all" }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/schedule"
            className="rounded-[4px] border border-line bg-white px-4 py-2.5 text-[13px] leading-[19.5px] font-bold text-ink transition-colors hover:border-ink"
          >
            Full schedule
          </Link>
          <Link
            href="/live-scores?view=result"
            className="rounded-[4px] border border-ink bg-ink px-4 py-2.5 text-[13px] leading-[19.5px] font-bold text-white transition-colors hover:bg-coal"
          >
            Results
          </Link>
        </div>
      </div>
    </Section>
  );
}
