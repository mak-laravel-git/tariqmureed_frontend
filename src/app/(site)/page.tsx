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

export default function HomePage(props: PageProps<"/">) {
  return (
    <>
      <div className="bg-white">
        <Container className="py-4">
          <AdSlot format="970 × 90 — Leaderboard" className="py-8" />
        </Container>
      </div>

      <Suspense fallback={<SectionSkeleton tone="surface" height={632} label="Loading live matches" />}>
        <LiveMatchCentre searchParams={props.searchParams} />
      </Suspense>

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
