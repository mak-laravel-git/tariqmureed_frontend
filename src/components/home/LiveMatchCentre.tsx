import Link from "next/link";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { LiveDot } from "@/components/ui/LiveDot";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { MatchCard } from "@/components/ui/MatchCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMatches, getMatchSummary } from "@/lib/api/endpoints";
import type { Match, MatchState } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { pageHref, type SearchParams } from "@/lib/url";

const tabs = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "result", label: "Results" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function resolveTab(value: string | string[] | undefined): TabKey {
  return value === "upcoming" || value === "result" ? value : "live";
}

const emptyMessages: Record<TabKey, string> = {
  live: "No matches are live or scheduled right now.",
  upcoming: "No upcoming matches have been scheduled yet.",
  result: "No recent results to show.",
};

const carouselLabels: Record<TabKey, string> = {
  live: "Live matches",
  upcoming: "Upcoming matches",
  result: "Match results",
};

/** Cards in one row on desktop. */
const CARDS_IN_VIEW = 3;

/** Matches of the Upcoming and Results tabs; those beyond one row are reached by sliding. */
const SLIDER_LIMIT = 10;

/** Every live match, topped up with the next fixtures when fewer than a full row are live. */
async function getLiveTabMatches(): Promise<Match[]> {
  const [live, upcoming] = await Promise.all([
    getMatches("live", undefined, "priority"),
    // Only a top-up: if it fails, the live scores still show.
    getMatches("upcoming", CARDS_IN_VIEW).catch((): Match[] => []),
  ]);
  // The two lists are cached separately, so a match that has just started can still be in both.
  const liveIds = new Set(live.map((match) => match.id));
  const next = upcoming.filter((match) => !liveIds.has(match.id));

  return [...live, ...next.slice(0, Math.max(0, CARDS_IN_VIEW - live.length))];
}

interface LiveMatchCentreProps {
  searchParams: Promise<SearchParams>;
}

export async function LiveMatchCentre({ searchParams }: LiveMatchCentreProps) {
  const params = await searchParams;
  const activeTab = resolveTab(params.status);

  const [matches, summary] = await Promise.all([
    activeTab === "live"
      ? getLiveTabMatches()
      : // Upcoming matches go by date and time; results put the important competitions first.
        getMatches(activeTab satisfies MatchState, SLIDER_LIMIT, activeTab === "result" ? "priority" : undefined),
    getMatchSummary(),
  ]);

  const stats = [
    { value: String(summary.matchesToday), label: "Matches covered today" },
    { value: String(summary.liveNow), label: "Live right now" },
    { value: String(summary.competitionsTracked), label: "Competitions tracked" },
    { value: summary.dataProvider, label: "Data provider" },
  ];

  return (
    <Section id="live" tone="surface" aria-labelledby="live-match-centre-title">
      {(summary.liveNow > 0 || activeTab === "live") && <LiveRefresh seconds={summary.liveNow > 0 ? 10 : 30} />}
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="live-match-centre-title"
          title="Live Match Center" 
          live
          description="Ball-by-ball scores across every competition covered by TMN Sport."
          descriptionClassName="text-body"
          action={{ href: "/live-scores", label: "All matches" }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const active = tab.key === activeTab;

            return (
              <Link
                key={tab.key}
                href={pageHref(params, { status: tab.key === "live" ? null : tab.key }, "live")}
                replace
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex h-[37.5px] items-center gap-1.5 rounded-[4px] border px-4 text-[13px] leading-[19.5px] font-bold transition-colors",
                  active
                    ? "border-gold bg-gold text-ink"
                    : "border-tuna text-coal hover:border-ink hover:bg-white",
                )}
              >
                {tab.label}
                {tab.key === "live" && <LiveDot size={6} pulse={false} />}
              </Link>
            );
          })}

          <p className="w-full text-xs leading-[18px] text-tuna sm:ml-auto sm:w-auto">
            Scores update automatically · Delayed by up to 30 seconds
          </p>
        </div>

        {matches.length > CARDS_IN_VIEW ? (
          // The key starts each tab's slider at its first card.
          <CardCarousel key={activeTab} label={carouselLabels[activeTab]}>
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} fill />
            ))}
          </CardCarousel>
        ) : matches.length > 0 ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} fill />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-muted">
            {emptyMessages[activeTab]}
          </p>
        )}

        {/* <dl className="grid grid-cols-2 gap-3 pt-1 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-lg border border-muted bg-white/85 px-3 py-3 sm:px-4">
              <dd className="order-first text-xl leading-8 font-bold tracking-[0.24px] break-words text-gold sm:text-2xl">{stat.value}</dd>
              <dt className="text-xs leading-[18px] text-coal">{stat.label}</dt>
            </div>
          ))}
        </dl> */}
      </div>
    </Section>
  );
}
