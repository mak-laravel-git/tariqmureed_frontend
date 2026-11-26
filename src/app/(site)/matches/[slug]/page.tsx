import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MatchHeader } from "@/components/matches/MatchHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { MatchTabBar, MatchTabContent, resolveMatchTab } from "@/components/matches/MatchTabs";
import { getMatchDetail } from "@/lib/api/endpoints";
import { breadcrumbSchema, getSiteUrl, profileMetadata } from "@/lib/seo";
import { firstParam } from "@/lib/url";

export async function generateMetadata(props: PageProps<"/matches/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const match = await getMatchDetail(slug);

  if (!match) {
    return {};
  }

  const status = match.summary || match.subtitle;

  return profileMetadata({
    path: `/matches/${match.slug}`,
    title: `${match.title}: score, scorecard and commentary`,
    description: `${match.title}${status ? `. ${status}` : ""}. Ball-by-ball commentary, full scorecard, squads and match stats on TMN Sport.`,
  });
}

async function MatchCentre({
  params,
  searchParams,
}: Pick<PageProps<"/matches/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const match = await getMatchDetail(slug);

  if (!match) {
    notFound();
  }

  const tab = resolveMatchTab(firstParam((await searchParams).tab));
  const site = await getSiteUrl();
  const path = `/matches/${match.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "@id": `${site}${path}#event`,
          name: match.title,
          url: `${site}${path}`,
          sport: "Cricket",
          startDate: match.startsAt,
          eventStatus: "https://schema.org/EventScheduled",
          ...(match.summary ? { description: match.summary } : {}),
          ...(match.venue ? { location: { "@type": "Place", name: match.venue, ...(match.city ? { address: match.city } : {}) } } : {}),
          homeTeam: { "@type": "SportsTeam", name: match.home.team.name },
          awayTeam: { "@type": "SportsTeam", name: match.away.team.name },
        }}
      />
      <JsonLd
        data={breadcrumbSchema(site, [
          { name: "Home", path: "/" },
          { name: "Schedule", path: "/schedule" },
          { name: match.title, path },
        ])}
      />
      {(match.state === "live" || match.state === "break") && <LiveRefresh seconds={10} />}
      <MatchHeader match={match} />
      <MatchTabBar slug={match.slug} active={tab} />
      <MatchTabContent match={match} tab={tab} />
    </>
  );
}

export default function MatchPage(props: PageProps<"/matches/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading match" className="min-h-[900px]" />}>
      <MatchCentre params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
