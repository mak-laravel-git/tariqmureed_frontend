import type { ReactNode } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { EmptyNote as Empty } from "@/components/ui/Panel";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import type { MatchDetail } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export const matchTabs = [
  { key: "overview", label: "Overview" },
  { key: "scorecard", label: "Scorecard" },
  { key: "commentary", label: "Commentary" },
  { key: "teams", label: "Teams" },
  { key: "statistics", label: "Statistics" },
  { key: "news", label: "Related News" },
] as const;

export type MatchTabKey = (typeof matchTabs)[number]["key"];

export function resolveMatchTab(value: string | undefined): MatchTabKey {
  return matchTabs.find((tab) => tab.key === value)?.key ?? "overview";
}

/** Underlined tab strip below the match banner. */
export function MatchTabBar({ slug, active }: { slug: string; active: MatchTabKey }) {
  return (
    <UnderlineTabs
      label="Match sections"
      tabs={matchTabs.map((tab) => ({
        label: tab.label,
        active: tab.key === active,
        href: tab.key === "overview" ? `/matches/${slug}` : `/matches/${slug}?tab=${tab.key}`,
      }))}
    />
  );
}

function Overview({ match }: { match: MatchDetail }) {
  const stats = [
    { label: "Current run rate", value: match.overview.currentRunRate },
    { label: "Projected score", value: match.overview.projectedScore },
    { label: "Partnership", value: match.overview.partnership },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="border-b border-[#e4e4e7] pb-4">
          <h2 className="text-[30px] leading-9 font-bold text-[#09090b]">Match summary</h2>
        </div>

        {stats.every((stat) => !stat.value) && match.overview.atCrease.length === 0 ? (
          <Empty>Match details will appear once play starts.</Empty>
        ) : (
          <>
            <dl className="grid gap-4 pt-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[4px] border border-[#e4e4e7] bg-white p-5">
                  <dt className="text-xs leading-4 text-[#71717b]">{stat.label}</dt>
                  <dd className="pt-2 text-2xl leading-8 font-bold text-[#09090b]">{stat.value ?? "—"}</dd>
                </div>
              ))}
            </dl>

            <section
              aria-labelledby="crease-title"
              className="mt-8 rounded-[4px] border border-[#e4e4e7] bg-white p-6"
            >
              <h3 id="crease-title" className="text-base leading-6 font-black text-[#09090b]">
                At the crease
              </h3>
              <div className="pt-4">
                {match.overview.atCrease.map((batter) => (
                  <div
                    key={batter.name}
                    className="grid grid-cols-3 border-t border-[#f4f4f5] py-3 text-sm leading-5"
                  >
                    <p className="font-bold text-[#09090b]">{batter.name}</p>
                    <p className="text-right font-bold text-[#09090b]">{batter.runs}</p>
                    <p className="text-right text-[#71717b]">{batter.balls} balls</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <AdSlot className="h-32 min-h-[128px] w-full rounded-[4px] py-0 lg:self-start" />
    </div>
  );
}

function TabHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="border-b border-[#e4e4e7] pb-4">
      <h2 className={cn("text-[30px] leading-9 font-bold text-[#09090b]", className)}>{children}</h2>
    </div>
  );
}

function Scorecard({ match }: { match: MatchDetail }) {
  if (match.innings.length === 0) {
    return (
      <>
        <TabHeading>Scorecard</TabHeading>
        <Empty>The scorecard will be available once the first ball is bowled.</Empty>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {match.innings.map((innings) => (
        <section key={innings.team} aria-label={`${innings.team} innings`}>
          <TabHeading>{innings.team} innings</TabHeading>

          <div className="overflow-x-auto pt-6">
            <table className="w-full min-w-[700px] border-collapse overflow-hidden rounded-[4px] border border-[#e4e4e7] bg-white text-left text-sm leading-[21px]">
              <thead>
                <tr className="bg-[#18181b] text-[10px] leading-[15px] font-bold tracking-[1px] text-white uppercase">
                  {["Batter", "Dismissal", "R", "B", "4s", "6s", "SR"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-[14.4px] font-bold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {innings.rows.map((row) => (
                  <tr key={row.batter} className="border-b border-[#e4e4e7] text-[#09090b] last:border-b-0">
                    <th scope="row" className="px-4 py-4 font-bold">
                      {row.batter}
                    </th>
                    <td className="px-4 py-4 font-normal">{row.dismissal}</td>
                    <td className="px-4 py-4 font-normal">{row.runs}</td>
                    <td className="px-4 py-4 font-normal">{row.balls}</td>
                    <td className="px-4 py-4 font-normal">{row.fours}</td>
                    <td className="px-4 py-4 font-normal">{row.sixes}</td>
                    <td className="px-4 py-4 font-normal">{row.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function Commentary({ match }: { match: MatchDetail }) {
  return (
    <div className="max-w-[768px]">
      <TabHeading>Ball-by-ball</TabHeading>

      <div className="pt-6">
        <p className="border-l-4 border-[#fdc700] bg-[#fefce8] p-4 text-xs leading-4 text-[#52525c]">
          Commentary is available from the official data provider. Updates may be delayed.
        </p>
      </div>

      {match.commentary.length === 0 ? (
        <Empty>Commentary will start when the match begins.</Empty>
      ) : (
        <ol className="pt-5">
          {match.commentary.map((entry) => (
            <li
              key={entry.over}
              className="grid grid-cols-[50px_40px_minmax(0,1fr)] items-center gap-4 border-b border-[#f4f4f5] py-5"
            >
              <span className="text-sm leading-5 font-bold text-[#09090b]">{entry.over}</span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm leading-5 font-black text-[#09090b]",
                  entry.outcome === "4" || entry.outcome === "6"
                    ? "bg-[#fdc700]"
                    : entry.outcome === "W"
                      ? "bg-[#e7000b] text-white"
                      : "bg-[#f4f4f5]",
                )}
              >
                {entry.outcome}
              </span>
              <span className="text-sm leading-5 text-[#09090b]">{entry.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Teams({ match }: { match: MatchDetail }) {
  return (
    <>
      <TabHeading className="tracking-[-1px]">Playing XI</TabHeading>
      <div className="grid gap-8 pt-6 md:grid-cols-2">
        {match.squads.map((squad) => (
          <section
            key={squad.team.slug}
            aria-label={squad.team.name}
            className="rounded-[4px] border border-[#e4e4e7] bg-white p-6"
          >
            <h3 className="text-lg leading-7 font-black text-[#09090b]">{squad.team.name}</h3>
            <ol className="pt-4">
              {squad.players.map((player, index) => (
                <li
                  key={`${player}-${index}`}
                  className="flex items-center gap-3 border-t border-[#f4f4f5] py-2.5"
                >
                  <span className="text-sm leading-5 text-[#9f9fa9] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-5 font-bold text-[#09090b]">{player}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

function Statistics({ match }: { match: MatchDetail }) {
  return (
    <div className="max-w-[768px]">
      <TabHeading>Match statistics</TabHeading>

      {match.stats.length === 0 ? (
        <Empty>Statistics will appear once the match is under way.</Empty>
      ) : (
        <dl className="flex flex-col gap-4 pt-6">
          {match.stats.map((stat) => (
            <div
              key={stat.label}
              className="grid grid-cols-[1fr_2fr_1fr] items-center rounded-[4px] border border-[#e4e4e7] bg-white p-4 text-center"
            >
              <dd className="text-base leading-6 font-bold text-[#09090b]">{stat.home ?? "—"}</dd>
              <dt className="text-xs leading-4 text-[#71717b]">{stat.label}</dt>
              <dd className="text-base leading-6 font-bold text-[#09090b]">{stat.away ?? "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function RelatedNews({ match }: { match: MatchDetail }) {
  if (match.relatedNews.length === 0) {
    return <Empty>No related stories yet.</Empty>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {match.relatedNews.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export function MatchTabContent({ match, tab }: { match: MatchDetail; tab: MatchTabKey }) {
  return (
    <Container className="py-10">
      {tab === "overview" && <Overview match={match} />}
      {tab === "scorecard" && <Scorecard match={match} />}
      {tab === "commentary" && <Commentary match={match} />}
      {tab === "teams" && <Teams match={match} />}
      {tab === "statistics" && <Statistics match={match} />}
      {tab === "news" && <RelatedNews match={match} />}
    </Container>
  );
}
