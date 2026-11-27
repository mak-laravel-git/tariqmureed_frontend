import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ScoreText } from "@/components/ui/ScoreText";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { MatchDetail, MatchSide } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function ScorePanel({ side }: { side: MatchSide }) {
  const hasScore = Boolean(side.score);

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[4px] bg-chip p-4 sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <TeamBadge team={side.team} size={48} />
        <p className="line-clamp-2 text-base leading-6 font-bold break-words text-ink">{side.team.name}</p>
      </div>
      <div className="shrink-0 text-right">
        {hasScore ? (
          <>
            <p className="text-xl leading-7 font-bold text-ink sm:text-[30px] sm:leading-9">
              <ScoreText score={side.score ?? ""} inlineFrom="xl" />
            </p>
            {side.overs && <p className="text-xs leading-4 text-[#9f9fa9]">{side.overs} overs</p>}
          </>
        ) : (
          <p className="text-base leading-6 font-bold text-ink sm:text-[30px] sm:leading-9">{side.note ?? "Yet to bat"}</p>
        )}
      </div>
    </div>
  );
}

/** Grey match banner: breadcrumb, status, scoreboard and toss note. */
export function MatchHeader({ match }: { match: MatchDetail }) {
  const live = match.state === "live" || match.state === "break";

  return (
    <section className="bg-surface">
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Live Scores", href: "/live-scores" },
            { label: match.competition.name },
          ]}
          className="text-xs leading-4 font-normal text-body"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <span
              className={cn(
                "inline-flex items-center rounded-[4px] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase",
                live
                  ? "bg-[#e7000b] text-line"
                  : match.state === "result"
                    ? "bg-win/12 text-win"
                    : "bg-black text-white",
              )}
            >
              {live ? "Live" : match.state === "result" ? "Result" : "Upcoming"}
            </span>
            <h1 className="pt-3 text-xl leading-7 font-black text-ink">{match.title}</h1>
            <p className="pt-1 text-xs leading-4 text-[#9f9fa9]">{match.subtitle}</p>
          </div>
          <p className="text-xs leading-4 text-tuna">
            Last updated <TimeAgo iso={match.updatedAt} />
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 pt-8 md:grid-cols-[1fr_auto_1fr]">
          <ScorePanel side={match.home} />
          <span aria-hidden="true" className="text-center text-base leading-6 font-bold text-[#c8a802]">
            VS
          </span>
          <ScorePanel side={match.away} />
        </div>

        {(match.tossNote ?? match.summary) && (
          <p className="mt-5 border-l-4 border-brand pl-4 text-sm leading-5 font-bold text-ink">
            {match.tossNote ?? match.summary}
          </p>
        )}

        <p className="sr-only">
          <Link href="/live-scores">Back to live scores</Link>
        </p>
      </Container>
    </section>
  );
}
