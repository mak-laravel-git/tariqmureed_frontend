import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { PlayerRankings } from "@/components/teams/PlayerRankings";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { getTeamPage } from "@/lib/api/endpoints";
import { breadcrumbSchema, getSiteUrl, profileMetadata } from "@/lib/seo";
import type { SearchParams } from "@/lib/url";

export async function generateMetadata(props: PageProps<"/teams/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const team = await getTeamPage(slug);

  if (!team) {
    return {};
  }

  return profileMetadata({
    path: `/teams/${team.slug}`,
    title: `${team.name}: squad, players and fixtures`,
    description: `${team.name}${team.nickname && team.nickname !== team.name ? ` (${team.nickname})` : ""}, ${team.membership}. Featured players, rankings and fixtures on TMN Sport.`,
  });
}

function SectionTitle({ children, eyebrow }: { children: string; eyebrow?: string }) {
  return (
    <div className="border-b border-[#e4e4e7] pb-4">
      {eyebrow && (
        <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-[#d08700] uppercase">{eyebrow}</p>
      )}
      <h2
        className={`${eyebrow ? "pt-2" : ""} text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#09090b]`}
      >
        {children}
      </h2>
    </div>
  );
}

async function TeamView({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> }) {
  const { slug } = await params;
  const query = await searchParams;
  const team = await getTeamPage(slug);

  if (!team) {
    notFound();
  }

  const site = await getSiteUrl();
  const path = `/teams/${team.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          "@id": `${site}${path}#team`,
          name: team.name,
          url: `${site}${path}`,
          sport: "Cricket",
          ...(team.nickname && team.nickname !== team.name ? { alternateName: team.nickname } : {}),
          athlete: team.players.map((player) => ({ "@type": "Person", name: player.name, url: `${site}/players/${player.slug}` })),
        }}
      />
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Teams", path: "/teams" }, { name: team.name, path }])} />
      <section className="bg-[#2d2d2d] text-white">
        <Container className="flex flex-wrap items-center gap-6 py-12">
          <TeamBadge team={{ name: team.name, shortName: team.badge, colors: team.colors, image: team.image }} size={96} />
          <div>
            <p className="text-xs leading-4 font-bold tracking-[0.6px] text-[#a4f4cf] uppercase">{team.kind}</p>
            <h1 className="pt-2 text-[36px] leading-10 font-bold text-white">{team.name}</h1>
            <p className="pt-2 text-sm leading-5 text-[#d0fae5]">{team.membership}</p>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <SectionTitle eyebrow={team.nickname}>Team overview</SectionTitle>

        <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {team.ranks.length > 0 && (
              <dl className="grid grid-cols-2 gap-px border border-[#e4e4e7] bg-[#e4e4e7] sm:grid-cols-4">
                {team.ranks.map((rank) => (
                  <div key={rank.label} className="rounded-[4px] bg-white p-5">
                    <dd className="text-[30px] leading-9 font-bold text-[#09090b]">{rank.value}</dd>
                    <dt className="pt-2 text-xs leading-4 text-[#71717b]">{rank.label}</dt>
                  </div>
                ))}
              </dl>
            )}

            {team.playerRankings && <PlayerRankings rankings={team.playerRankings} teamName={team.name} basePath={path} params={query} />}

            <div className="pt-10">
              <SectionTitle>Featured players</SectionTitle>
              {team.players.length > 0 ? (
                <ul className="grid gap-4 pt-6 sm:grid-cols-2 md:grid-cols-3">
                  {team.players.map((player) => (
                    <li key={player.slug}>
                      <Link
                        href={`/players/${player.slug}`}
                        className="group block overflow-hidden rounded-[4px] border border-[#e4e4e7] bg-white"
                      >
                        <span className="relative block aspect-[307/321] overflow-hidden">
                          <Photo
                            src={player.image}
                            alt=""
                            sizes="(min-width: 1320px) 300px, (min-width: 768px) 30vw, 100vw"
                            className="transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </span>
                        <span className="block p-4">
                          <span className="block text-base leading-6 font-bold text-[#09090b]">{player.name}</span>
                          <span className="block pt-1 text-xs leading-4 text-[#71717b]">{player.role}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-12 text-center text-sm text-[#71717b]">
                  Squad details are coming soon.
                </p>
              )}
            </div>
          </div>

          <aside className="flex flex-col lg:self-start">
            <AdSlot placement="team-sidebar" />
            <Link
              href="/schedule"
              className="mt-6 flex items-center justify-center rounded-[4px] bg-[#fdc700] px-6 py-4 text-xs leading-4 font-black text-[#09090b] uppercase transition-colors hover:brightness-95"
            >
              View all fixtures
            </Link>
          </aside>
        </div>
      </Container>
    </>
  );
}

export default function TeamPage(props: PageProps<"/teams/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading team" className="min-h-[800px]" />}>
      <TeamView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
