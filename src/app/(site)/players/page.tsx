import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { CountryName } from "@/components/ui/CountryName";
import { PageIntro } from "@/components/ui/PageIntro";
import { Photo } from "@/components/ui/Photo";
import { getTrendingPlayers } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/players", { title: "Players", description: "Profiles and career statistics for the players making headlines." });
}

async function PlayersBody() {
  const players = await getTrendingPlayers();

  return (
    <Container className="grid grid-cols-1 gap-6 pt-8 pb-16 sm:grid-cols-2 lg:grid-cols-4">
      {players.map((player) => (
        <Link key={player.id} href={`/players/${player.slug}`} className="group block">
          <div className="relative aspect-[314/372] overflow-hidden rounded-[4px]">
            <Photo src={player.image} alt={player.name} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
          </div>
          <p className="pt-3 text-[10px] leading-[15px] font-black text-[#d08700] uppercase">
            <CountryName name={player.country} />
          </p>
          <h2 className="pt-1 text-base leading-6 font-black text-[#09090b] group-hover:underline">{player.name}</h2>
          <p className="text-sm leading-5 text-[#71717b]">{player.role}</p>
        </Link>
      ))}
    </Container>
  );
}

export default function PlayersPage() {
  return (
    <>
      <PageIntro title="Players" description="Profiles and career statistics for the players making headlines." />
      <Suspense fallback={<div role="status" aria-label="Loading players" className="min-h-[600px]" />}>
        <PlayersBody />
      </Suspense>
    </>
  );
}
