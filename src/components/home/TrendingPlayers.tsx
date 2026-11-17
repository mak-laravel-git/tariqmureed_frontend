import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getTrendingPlayers } from "@/lib/api/endpoints";
import type { TrendingPlayer } from "@/lib/api/types";

function PlayerCard({ player }: { player: TrendingPlayer }) {
  const stats = [
    { label: "Matches", value: String(player.matches) },
    { label: "Runs", value: String(player.runs) },
    { label: "Avg", value: player.average.toFixed(1) },
  ];

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white">
      <Link href={`/players/${player.slug}`} className="relative block aspect-[314/372]">
        <Photo
          src={player.image}
          alt={player.name}
          sizes="(min-width: 1320px) 314px, (min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <Tag tone="gold" className="absolute top-3 right-3 px-2 py-1 text-[11px] tracking-[0.3px]">
          {player.rankLabel}
        </Tag>

        <div className="absolute inset-x-4 bottom-4 flex flex-col">
          <p className="text-[11px] leading-4 font-bold tracking-[0.8px] text-gold uppercase">{player.role}</p>
          <h3 className="text-lg leading-6 font-bold text-white">{player.name}</h3>
          <p className="text-[13px] leading-[19.5px] text-white/65">
            {player.team} · {player.country}
          </p>
        </div>
      </Link>

      <dl className="grid grid-cols-3 divide-x divide-line">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-3">
            <dd className="order-first text-[15px] leading-[22px] font-bold text-ink">{stat.value}</dd>
            <dt className="text-[11px] leading-4 font-semibold tracking-[0.8px] text-muted uppercase">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </article>
  );
}

export async function TrendingPlayers() {
  const players = await getTrendingPlayers();

  return (
    <Section aria-labelledby="trending-players-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="trending-players-title"
          title="Trending Players"
          description="Profiles, form guides and career records for the players in the news."
          action={{ href: "/players", label: "All players" }}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </Section>
  );
}
