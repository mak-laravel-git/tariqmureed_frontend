import type { Metadata } from "next";
import { Suspense } from "react";

import { ComingUpNext } from "@/components/home/ComingUpNext";
import { FeaturedStories } from "@/components/home/FeaturedStories";
import { LatestNews } from "@/components/home/LatestNews";
import { LiveMatchCentre } from "@/components/home/LiveMatchCentre";
import { MatchCoverage } from "@/components/home/MatchCoverage";
import { StatsSection } from "@/components/home/StatsSection";
import { TeamFixtures } from "@/components/home/TeamFixtures";
import { TournamentSpotlight } from "@/components/home/TournamentSpotlight";
import { TrendingPlayers } from "@/components/home/TrendingPlayers";
import { VideoHighlights } from "@/components/home/VideoHighlights";
import { WritersSection } from "@/components/home/WritersSection";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeo } from "@/lib/api/endpoints";
import { pageMetadata, resolveSiteUrl } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/", {
    title: "TMN Sport — Live cricket scores, news, stats and video",
    description:
      "TMN Sport is an independent cricket media house delivering live scores, news, analysis, statistics and video from every major international and franchise competition.",
  });
}

/** Tells search engines who runs the site and that it has a search box. */
async function SiteJsonLd() {
  const seo = await getSeo();
  const site = resolveSiteUrl(seo);
  const name = seo.settings.websiteName || "TMN Sport";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${site}/#organization`, name, url: site, logo: `${site}/images/brand/logo.png` },
          {
            "@type": "WebSite",
            "@id": `${site}/#website`,
            url: site,
            name,
            publisher: { "@id": `${site}/#organization` },
            potentialAction: { "@type": "SearchAction", target: `${site}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
          },
        ],
      }}
    />
  );
}

export default function HomePage(props: PageProps<"/">) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteJsonLd />
      </Suspense>
      <Suspense fallback={<SectionSkeleton tone="surface" height={632} label="Loading live matches" />}>
        <LiveMatchCentre searchParams={props.searchParams} />
      </Suspense>

      <div className="bg-white">
        <Container className="py-4">
          <AdSlot placement="home-top" className="py-4" />
        </Container>
      </div>

      <Suspense fallback={<SectionSkeleton height={807} />}>
        <FeaturedStories />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={2274} />}>
        <LatestNews />
      </Suspense>

      <Suspense fallback={<SectionSkeleton tone="surface" height={536} />}>
        <MatchCoverage />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={670} />}>
        <TrendingPlayers />
      </Suspense>

      <Suspense fallback={<SectionSkeleton tone="surface" height={870} />}>
        <TeamFixtures searchParams={props.searchParams} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={932} />}>
        <VideoHighlights />
      </Suspense>

      <Suspense fallback={<SectionSkeleton tone="surface" height={575} />}>
        <TournamentSpotlight />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={1109} />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton tone="surface" height={538} />}>
        <WritersSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={490} />}>
        <ComingUpNext />
      </Suspense>
    </>
  );
}
