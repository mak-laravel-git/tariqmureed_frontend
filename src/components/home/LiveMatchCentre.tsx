import Link from "next/link";

import { LiveDot } from "@/components/ui/LiveDot";
import { MatchCard } from "@/components/ui/MatchCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMatches, getMatchSummary } from "@/lib/api/endpoints";
import type { MatchState } from "@/lib/api/types";
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
  live: "No matches are live right now. Check the upcoming fixtures.",
  upcoming: "No upcoming matches have been scheduled yet.",
  result: "No recent results to show.",
};

interface LiveMatchCentreProps {
  searchParams: Promise<SearchParams>;
}

export async function LiveMatchCentre({ searchParams }: LiveMatchCentreProps) {
  const params = await searchParams;
  const activeTab = resolveTab(params.status);

  const [matches, summary] = await Promise.all([
    getMatches(activeTab satisfies MatchState, 3),
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
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="live-match-centre-title"
          title="Live Match Centre"
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

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-muted">
            {emptyMessages[activeTab]}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-3 pt-1 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-lg border border-muted bg-white/85 px-3 py-3 sm:px-4">
              <dd className="order-first text-xl leading-8 font-bold tracking-[0.24px] break-words text-gold sm:text-2xl">{stat.value}</dd>
              <dt className="text-xs leading-[18px] text-coal">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
