import Link from "next/link";

import type { Match, MatchSide, MatchState } from "@/lib/api/types";
import { cn } from "@/lib/cn";

import { LiveDot } from "./LiveDot";
import { MatchTime } from "./MatchTime";
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
  startsAt,
  className,
}: {
  side: MatchSide;
  showProgress: boolean;
  startsAt: string;
  className?: string;
}) {
  const subline = showProgress
    ? side.score
      ? `${side.score}${side.overs ? ` (${side.overs})` : ""}`
      : side.note
    : null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
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
          <MatchTime iso={startsAt} show="time" />
        </p>
      ) : null}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  /** Fills the height of its row, so that cards of different kinds end up the same size. */
  fill?: boolean;
}

/** Scorecard-style summary of a live, upcoming or completed match. */
export function MatchCard({ match, fill }: MatchCardProps) {
  const inPlay = match.state === "live" || match.state === "break";
  // Room for a name and a score line, so the divider sits at the same height with or without the score.
  const rowClass = fill ? "min-h-[41px]" : undefined;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-line bg-white transition-shadow focus-within:ring-2 focus-within:ring-ink hover:shadow-[0_4px_14px_rgba(17,17,17,0.08)]",
        fill ? "flex h-full flex-col" : "self-start",
      )}
    >
      <Link
        href={`/matches/${match.slug}`}
        aria-label={`${match.home.team.name} vs ${match.away.team.name} match details`}
        className={cn("outline-none", fill ? "flex flex-1 flex-col" : "block")}
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

        <div className={cn("flex flex-col gap-3 p-4", fill && "flex-1")}>
          <SideRow side={match.home} showProgress={inPlay} startsAt={match.startsAt} className={rowClass} />
          <SideRow side={match.away} showProgress={inPlay} startsAt={match.startsAt} className={rowClass} />

          <footer className={cn("flex flex-col gap-1.5 border-t border-line pt-[11px]", fill && "flex-1")}>
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
            <p className={cn("flex items-center gap-2 text-xs leading-[18px] text-muted", fill && "mt-auto")}>
              <MatchTime iso={match.startsAt} show="date" />
              <span aria-hidden="true">·</span>
              <MatchTime iso={match.startsAt} show="timeZone" />
            </p>
          </footer>
        </div>
      </Link>
    </article>
  );
}
