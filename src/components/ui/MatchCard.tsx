import Link from "next/link";

import type { Match, MatchSide, MatchState } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMatchDate, formatMatchTime } from "@/lib/format";

import { LiveDot } from "./LiveDot";
import { ScoreText } from "./ScoreText";
import { Tag } from "./Tag";
import { TeamBadge } from "./TeamBadge";

function StateTag({ state }: { state: MatchState }) {
  switch (state) {
    case "live":
      return (
        <Tag tone="live">
          <LiveDot tone="white" pulse={false} />
          Live
        </Tag>
      );
    case "break":
      return (
        <Tag tone="live">
          <LiveDot tone="white" pulse={false} />
          Break
        </Tag>
      );
    case "upcoming":
      return <Tag tone="gold">Upcoming</Tag>;
    case "result":
      return <Tag tone="win">Result</Tag>;
  }
}

function SideRow({
  side,
  showProgress,
}: {
  side: MatchSide;
  showProgress: boolean;
}) {
  const subline = showProgress
    ? side.score
      ? `${side.score}${side.overs ? ` (${side.overs})` : ""}`
      : side.note
    : null;

  return (
    <div className="flex items-center gap-3">
      <TeamBadge team={side.team} />

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] leading-5 font-bold break-words text-ink sm:leading-[22.5px]">
          {side.team.name}
        </p>
        {subline && (
          // On phones the score column already says this, and the line would only be cut off.
          <p className={`truncate text-xs leading-[18px] text-muted ${side.score ? "hidden sm:block" : ""}`}>
            {subline}
          </p>
        )}
      </div>

      {side.score ? (
        <div className="flex min-w-[60px] shrink-0 flex-col items-end gap-1">
          <p className="flex items-center gap-1.5 text-right text-[15px] leading-[19px] font-extrabold text-ink sm:text-[17px] sm:leading-[17px]">
            <span>
              <ScoreText score={side.score} />
            </span>
            {side.isBatting && <LiveDot size={6} />}
          </p>
          {showProgress && side.overs && (
            <p className="text-[11px] leading-[16.5px] text-muted">
              {side.overs}
            </p>
          )}
        </div>
      ) : side.startTime ? (
        <p className="shrink-0 text-[13px] leading-[19.5px] font-bold text-muted">
          {side.startTime}
        </p>
      ) : null}
    </div>
  );
}

/** Scorecard-style summary of a live, upcoming or completed match. */
export function MatchCard({ match }: { match: Match }) {
  const inPlay = match.state === "live" || match.state === "break";

  return (
    <article className="min-w-0 self-start overflow-hidden rounded-lg border border-line bg-white transition-shadow focus-within:ring-2 focus-within:ring-ink hover:shadow-[0_4px_14px_rgba(17,17,17,0.08)]">
      <Link
        href={`/matches/${match.slug}`}
        aria-label={`${match.home.team.name} vs ${match.away.team.name} match details`}
        className="block outline-none"
      >
        <header className="flex items-center justify-between gap-3 border-b-2 border-brand bg-card-header px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {inPlay && <LiveDot />}
            <span className="truncate text-xs leading-[18px] font-bold text-charade">
              {match.competition.name}
            </span>
            <span className="rounded-[4px] bg-chip px-1.5 py-0.5 text-[10px] leading-[15px] font-bold tracking-[0.25px] text-muted uppercase">
              {match.competition.format}
            </span>
          </div>
          <StateTag state={match.state} />
        </header>

        <div className="flex flex-col gap-3 p-4">
          <SideRow side={match.home} showProgress={inPlay} />
          <SideRow side={match.away} showProgress={inPlay} />

          <footer className="flex flex-col gap-1.5 border-t border-line pt-[11px]">
            {match.summary && (
              <p
                className={cn(
                  "text-[13px] leading-[19.5px] font-bold",
                  match.summaryTone === "live" ? "text-live" : "text-charade",
                )}
              >
                {match.summary}
              </p>
            )}
            <p className="flex items-center gap-2 text-xs leading-[18px] text-muted">
              <span>{formatMatchDate(match.startsAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatMatchTime(match.startsAt)}</span>
            </p>
          </footer>
        </div>
      </Link>
    </article>
  );
}
