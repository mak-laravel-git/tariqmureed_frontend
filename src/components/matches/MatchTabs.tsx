import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { EmptyNote as Empty } from "@/components/ui/Panel";
import { Photo } from "@/components/ui/Photo";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import type { AwardWinner, Innings, MatchDetail, SquadPlayer } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatLongDate, formatMatchTime12 } from "@/lib/format";

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

/**
 * What an empty tab says. The provider covers competitions differently: some send only the totals and the result,
 * so a finished match must not promise data that will never come.
 */
function missingNote(match: MatchDetail, what: string, beforeStart: string): string {
  if (match.state === "upcoming") {
    return beforeStart;
  }

  return match.state === "result"
    ? `The data provider does not supply ${what} for this match.`
    : `The data provider has not sent ${what} for this match yet.`;
}

function OverviewCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[4px] border border-[#e4e4e7] bg-white p-6", className)}>
      <h3 className="text-base leading-6 font-black text-[#09090b]">{title}</h3>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function Figures({ items }: { items: { label: string; value?: string | null }[] }) {
  const known = items.filter((item) => item.value);

  if (known.length === 0) {
    return null;
  }

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {known.map((item) => (
        <div key={item.label} className="rounded-[4px] border border-[#e4e4e7] bg-white p-5">
          <dt className="text-xs leading-4 text-[#71717b]">{item.label}</dt>
          <dd className="pt-2 text-2xl leading-8 font-bold text-[#09090b]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One delivery's mark: boundaries in gold, wickets in red. */
function BallMark({ mark }: { mark: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-black",
        mark === "4" || mark === "6" ? "bg-brand text-[#09090b]" : mark === "W" ? "bg-[#e7000b] text-white" : "bg-[#f4f4f5] text-[#09090b]",
      )}
    >
      {mark}
    </span>
  );
}

function Award({ title, winner }: { title: string; winner: AwardWinner }) {
  const name = <span className="text-base leading-6 font-bold text-[#09090b]">{winner.name}</span>;

  return (
    <div className="flex items-center gap-3 rounded-[4px] border border-[#e4e4e7] bg-white p-4">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[#f4f4f5]">
        {winner.image && <Photo src={winner.image} alt="" sizes="48px" />}
      </span>
      <div className="min-w-0">
        <p className="text-xs leading-4 text-[#71717b]">{title}</p>
        {winner.slug ? (
          <Link href={`/players/${winner.slug}`} className="hover:underline">
            {name}
          </Link>
        ) : (
          name
        )}
      </div>
    </div>
  );
}

function Overview({ match }: { match: MatchDetail }) {
  const overview = match.overview;
  const recent = overview.recentBalls ?? [];
  const performers = overview.performers ?? [];
  const officials = overview.officials ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="border-b border-[#e4e4e7] pb-4">
          <h2 className="text-[30px] leading-9 font-bold text-[#09090b]">Match summary</h2>
        </div>

        {overview.result && (
          <p className="border-l-4 border-brand bg-[#fefce8] p-4 text-base leading-6 font-bold text-[#09090b]">{overview.result}</p>
        )}

        {match.state !== "upcoming" && match.innings.length === 0 && (
          <p className="text-sm leading-6 text-[#52525c]">
            {missingNote(match, "a detailed scorecard", "")} The team totals{match.state === "result" ? " and the result" : ""} are shown here.
          </p>
        )}

        <Figures
          items={[
            { label: "Current run rate", value: overview.currentRunRate },
            { label: "Required run rate", value: overview.requiredRunRate },
            { label: "Target", value: overview.target },
            { label: "Projected score (at this rate)", value: overview.projectedScore },
            { label: "Partnership", value: overview.partnership },
          ]}
        />

        {overview.atCrease.length > 0 && (
          <OverviewCard title="At the crease">
            {overview.atCrease.map((batter) => (
              <div key={batter.name} className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-2 border-t border-[#f4f4f5] py-3 text-sm leading-5">
                <p className="font-bold text-[#09090b]">{batter.name}</p>
                <p className="text-right font-bold text-[#09090b]">{batter.runs}</p>
                <p className="text-right text-[#71717b]">{batter.balls} balls</p>
                <p className="text-right text-[#71717b]">
                  {batter.fours ?? 0}×4 {batter.sixes ?? 0}×6
                </p>
              </div>
            ))}
            {overview.bowler && (
              <p className="border-t border-[#f4f4f5] pt-3 text-sm leading-5 text-[#52525c]">
                Bowling: <span className="font-bold text-[#09090b]">{overview.bowler.name}</span> {overview.bowler.figures}
              </p>
            )}
          </OverviewCard>
        )}

        {recent.length > 0 && (
          <OverviewCard title="Recent balls">
            <ol aria-label="Latest deliveries, oldest first" className="flex flex-wrap gap-2">
              {recent.map((mark, index) => (
                <li key={`${index}-${mark}`}>
                  <BallMark mark={mark} />
                </li>
              ))}
            </ol>
          </OverviewCard>
        )}

        {(overview.playerOfMatch || overview.playerOfSeries) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {overview.playerOfMatch && <Award title="Player of the match" winner={overview.playerOfMatch} />}
            {overview.playerOfSeries && <Award title="Player of the series" winner={overview.playerOfSeries} />}
          </div>
        )}

        {performers.length > 0 && (
          <OverviewCard title="Leading performers">
            {performers.map((row, index) => (
              <div key={`${row.team}-${index}`} className="grid grid-cols-1 gap-1 border-t border-[#f4f4f5] py-3 text-sm leading-5 sm:grid-cols-[1fr_1.5fr_1.5fr]">
                <p className="font-bold text-[#09090b]">{row.team} innings</p>
                <p className="text-[#52525c]">{row.batter && <>Bat: {row.batter}</>}</p>
                <p className="text-[#52525c]">{row.bowler && <>Bowl: {row.bowler}</>}</p>
              </div>
            ))}
          </OverviewCard>
        )}

        <div>
          <h3 className="text-base leading-6 font-black text-[#09090b]">Match details</h3>
          <MatchFacts
            match={match}
            extra={[
              { label: "Tour", value: overview.series },
              { label: "Toss", value: overview.toss },
              ...officials.map((official, index) => ({ label: official.role, value: official.name, key: `${official.role}-${index}` })),
            ]}
          />
        </div>
      </div>

      <AdSlot placement="match-sidebar" className="w-full lg:self-start" />
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

const tableClass = "w-full border-collapse overflow-hidden rounded-[4px] border border-[#e4e4e7] bg-white text-left text-sm leading-[21px]";
const tableHeadClass = "bg-[#18181b] text-[10px] leading-[15px] font-bold tracking-[1px] text-white uppercase";

function inningsName(innings: Innings): string {
  const nth = innings.number && innings.number > 1 ? ` ${innings.number === 2 ? "2nd" : `${innings.number}th`}` : "";

  return `${innings.team}${nth} innings`;
}

function InningsScorecard({ innings }: { innings: Innings }) {
  const { total, extras } = innings;
  const bowling = innings.bowling ?? [];
  const wickets = innings.fallOfWickets ?? [];
  const yetToBat = innings.yetToBat ?? [];

  return (
    <section aria-label={inningsName(innings)}>
      <TabHeading>{inningsName(innings)}</TabHeading>

      <div className="overflow-x-auto pt-6">
        <table className={cn(tableClass, "min-w-[700px]")}>
          <thead>
            <tr className={tableHeadClass}>
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

      {(extras || total) && (
        <dl className="mt-3 flex flex-col gap-2 rounded-[4px] border border-[#e4e4e7] bg-white p-4 text-sm leading-5 text-[#09090b]">
          {extras && (
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-bold">Extras {extras.total}</dt>
              <dd className="text-[#71717b]">
                wides {extras.wides}, no balls {extras.noBalls}, byes {extras.byes}, leg byes {extras.legByes}, penalty {extras.penalty}
              </dd>
            </div>
          )}
          {total && (
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-black">
                Total {total.runs}/{total.wickets}
              </dt>
              <dd className="text-[#71717b]">
                {total.overs} overs{total.runRate ? `, run rate ${total.runRate}` : ""}
              </dd>
            </div>
          )}
        </dl>
      )}

      {yetToBat.length > 0 && (
        <p className="pt-3 text-sm leading-6 text-[#52525c]">
          <span className="font-bold text-[#09090b]">Did not bat:</span> {yetToBat.join(", ")}
        </p>
      )}

      {wickets.length > 0 && (
        <div className="pt-5">
          <h3 className="text-base leading-6 font-black text-[#09090b]">Fall of wickets</h3>
          <ol className="flex flex-wrap gap-2 pt-3">
            {wickets.map((entry) => (
              <li key={entry.wicket} className="rounded-[4px] border border-[#e4e4e7] bg-white px-3 py-2 text-xs leading-4 text-[#52525c]">
                <span className="font-bold text-[#09090b]">
                  {entry.wicket}-{entry.score}
                </span>{" "}
                {entry.batter}, {entry.over} ov
              </li>
            ))}
          </ol>
        </div>
      )}

      {bowling.length > 0 && (
        <div className="overflow-x-auto pt-5">
          <table className={cn(tableClass, "min-w-[600px]")}>
            <thead>
              <tr className={tableHeadClass}>
                {["Bowler", "O", "M", "R", "W", "Econ", "Wd", "Nb"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-[14.4px] font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bowling.map((row) => (
                <tr key={row.bowler} className="border-b border-[#e4e4e7] text-[#09090b] last:border-b-0">
                  <th scope="row" className="px-4 py-4 font-bold">
                    {row.bowler}
                  </th>
                  <td className="px-4 py-4">{row.overs}</td>
                  <td className="px-4 py-4">{row.maidens}</td>
                  <td className="px-4 py-4">{row.runs}</td>
                  <td className="px-4 py-4 font-bold">{row.wickets}</td>
                  <td className="px-4 py-4">{row.economy}</td>
                  <td className="px-4 py-4">{row.wides}</td>
                  <td className="px-4 py-4">{row.noBalls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Scorecard({ match }: { match: MatchDetail }) {
  if (match.innings.length === 0) {
    return (
      <>
        <TabHeading>Scorecard</TabHeading>
        <Empty>{missingNote(match, "a detailed scorecard", "The scorecard will be available once the first ball is bowled.")}</Empty>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {match.innings.map((innings) => (
        <InningsScorecard key={inningsName(innings)} innings={innings} />
      ))}
    </div>
  );
}

function Commentary({ match }: { match: MatchDetail }) {
  const empty = missingNote(match, "ball-by-ball updates", "Ball-by-ball updates will start when the match begins.");

  return (
    <div className="max-w-[768px]">
      <TabHeading>Ball-by-ball</TabHeading>

      {match.commentary.length > 0 && (
        <div className="pt-6">
          <p className="border-l-4 border-brand bg-[#fefce8] p-4 text-xs leading-4 text-[#52525c]">
            Every delivery from the official data provider, latest first. Updates may be delayed.
          </p>
        </div>
      )}

      {match.commentary.length === 0 ? (
        <Empty>{empty}</Empty>
      ) : (
        <ol className="pt-5">
          {match.commentary.map((entry, index) => (
            <Fragment key={entry.id ?? `${entry.over}-${index}`}>
              {entry.innings && entry.innings !== match.commentary[index - 1]?.innings && (
                <li className="pt-4 pb-1 text-xs leading-4 font-black tracking-[0.6px] text-[#71717b] uppercase">{entry.innings}</li>
              )}
              <li className="grid grid-cols-[50px_40px_minmax(0,1fr)] items-center gap-4 border-b border-[#f4f4f5] py-4">
                <span className="text-sm leading-5 font-bold text-[#09090b]">{entry.over}</span>
                <BallMark mark={entry.outcome} />
                <span className="text-sm leading-5 text-[#09090b]">{entry.text}</span>
              </li>
            </Fragment>
          ))}
        </ol>
      )}
    </div>
  );
}

function PlayerAvatar({ player }: { player: SquadPlayer }) {
  const initials = player.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4f4f5] text-xs leading-4 font-black text-[#71717b]"
    >
      {player.image ? <Photo src={player.image} sizes="40px" /> : initials}
    </span>
  );
}

function PlayerBadge({ title, muted, children }: { title: string; muted?: boolean; children: ReactNode }) {
  return (
    <abbr
      title={title}
      className={cn(
        "rounded-[3px] px-1.5 py-0.5 text-[10px] leading-[14px] font-black tracking-[0.5px] no-underline",
        muted ? "bg-[#f4f4f5] text-[#71717b]" : "bg-brand text-[#09090b]",
      )}
    >
      {children}
    </abbr>
  );
}

/** "Allrounder · Bat: Right hand bat · Bowl: Off break" */
function playerSummary(player: SquadPlayer): string {
  return [
    player.role,
    player.battingStyle && `Bat: ${player.battingStyle}`,
    player.bowlingStyle && `Bowl: ${player.bowlingStyle}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Teams({ match }: { match: MatchDetail }) {
  if (match.squads.length === 0) {
    return (
      <>
        <TabHeading>Playing XI</TabHeading>
        <Empty>{missingNote(match, "the line-ups", "The line-ups are announced around the toss.")}</Empty>
      </>
    );
  }

  return (
    <>
      <TabHeading className="tracking-[-1px]">Playing XI</TabHeading>
      <div className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-2">
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
                  key={`${player.slug ?? player.name}-${index}`}
                  className="flex items-center gap-3 border-t border-[#f4f4f5] py-2.5"
                >
                  <span className="w-5 shrink-0 text-sm leading-5 text-[#9f9fa9] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <PlayerAvatar player={player} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {player.slug ? (
                        <Link
                          href={`/players/${player.slug}`}
                          className="text-sm leading-5 font-bold text-[#09090b] hover:underline"
                        >
                          {player.name}
                        </Link>
                      ) : (
                        <span className="text-sm leading-5 font-bold text-[#09090b]">{player.name}</span>
                      )}
                      {player.captain && <PlayerBadge title="Captain">C</PlayerBadge>}
                      {player.wicketkeeper && <PlayerBadge title="Wicketkeeper">WK</PlayerBadge>}
                      {player.substitute && <PlayerBadge title="Substitute" muted>Sub</PlayerBadge>}
                    </p>
                    <p className="text-xs leading-4 text-[#71717b]">{playerSummary(player)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

/** Competition, date and venue (known before a ball is bowled), plus anything more the caller passes. */
function MatchFacts({ match, extra = [] }: { match: MatchDetail; extra?: { label: string; value?: string | null; key?: string }[] }) {
  const place = [match.venue, match.city?.trim()].filter(Boolean).join(", ");
  const facts = [
    { label: "Competition", value: match.competition.name },
    { label: "Match", value: match.stage },
    { label: "Format", value: match.competition.format },
    { label: "Date", value: formatLongDate(match.startsAt) },
    { label: "Start time", value: formatMatchTime12(match.startsAt) },
    { label: "Venue", value: place },
    ...extra,
  ].filter((fact): fact is { label: string; value: string; key?: string } => Boolean(fact.value));

  return (
    <dl className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={"key" in fact && fact.key ? fact.key : fact.label} className="rounded-[4px] border border-[#e4e4e7] bg-white p-4">
          <dt className="text-xs leading-4 text-[#71717b]">{fact.label}</dt>
          <dd className="pt-1 text-base leading-6 font-bold text-[#09090b]">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Statistics({ match }: { match: MatchDetail }) {
  return (
    <div className="max-w-[768px]">
      <TabHeading>Match statistics</TabHeading>

      {match.stats.length === 0 ? (
        <>
          <p className="pt-4 text-sm leading-6 text-[#52525c]">
            {match.state === "upcoming"
              ? "This match has not started yet. Both teams' numbers appear here as soon as play begins."
              : "Detailed statistics are not available for this match yet."}
          </p>
          <MatchFacts match={match} />
        </>
      ) : (
        <dl className="flex flex-col gap-4 pt-6">
          <div className="grid grid-cols-[1fr_2fr_1fr] items-center px-4 text-center text-xs leading-4 font-black tracking-[0.6px] text-[#71717b] uppercase">
            <dt className="truncate">{match.home.team.shortName}</dt>
            <dd aria-hidden="true" />
            <dd className="truncate">{match.away.team.shortName}</dd>
          </div>
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
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
