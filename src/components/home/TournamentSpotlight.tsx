import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getTournamentSpotlight } from "@/lib/api/endpoints";
import type { Tournament } from "@/lib/api/types";

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white">
      <Link
        href={`/series/${tournament.slug}`}
        aria-label={tournament.name}
        className="relative block aspect-[310/166]"
      >
        <Photo
          src={tournament.image}
          alt=""
          sizes="(min-width: 1320px) 436px, (min-width: 768px) 33vw, 100vw"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <Tag tone="live" className="absolute top-3 right-3 px-2 py-1 text-[10px] tracking-[0.8px]">
          {tournament.status}
        </Tag>

        <div className="absolute inset-x-4 bottom-3.5 flex flex-col items-start gap-1.5">
          <Tag tone="gold" className="px-2 py-0.5 text-[11px] tracking-[0.3px]">
            {tournament.format}
          </Tag>
          <div>
            <h3 className="text-lg leading-6 font-bold text-white">{tournament.name}</h3>
            <p className="text-xs leading-[18px] text-white/65">{tournament.location}</p>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <p className="line-clamp-2 text-[13px] leading-5 text-muted">{tournament.description}</p>
        <p className="flex items-center justify-between gap-3 text-xs leading-[18px]">
          <span className="font-bold text-ink">{tournament.dateRange}</span>
          <span className="text-muted">{tournament.matchCount} matches</span>
        </p>
      </div>
    </article>
  );
}

export async function TournamentSpotlight() {
  const tournaments = await getTournamentSpotlight();

  return (
    <Section tone="surface" aria-labelledby="tournament-spotlight-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="tournament-spotlight-title"
          title="Tournament Spotlight"
          description="Competitions currently in progress and coming up."
          action={{ href: "/series", label: "View all" }}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </Section>
  );
}
