import Link from "next/link";

import type { Match, MatchSide } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMatchTime12 } from "@/lib/format";

import { Countdown } from "./Countdown";
import { TeamBadge } from "./TeamBadge";

function StatusPill({ match }: { match: Match }) {
  const live = match.state === "live" || match.state === "break";

  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#e7000b] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] text-white uppercase">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-white/50" />
        {match.state === "break" ? "Break" : "Live"}
      </span>
    );
  }

  const label = match.state === "result" ? "Result" : match.isToday ? "Today" : "Upcoming";

  return (
    <span
      className={cn(
        "inline-flex rounded-[4px] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase",
        match.state === "result" ? "bg-win/12 text-win" : "bg-black text-white",
      )}
    >
      {label}
    </span>
  );
}

function SideRow({ side }: { side: MatchSide }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <TeamBadge team={side.team} size={32} />
        <p className="truncate text-base leading-6 font-bold text-[#09090b]">{side.team.name}</p>
      </div>
      <p className="shrink-0 text-right text-xl leading-7 font-bold text-[#09090b]">
        {side.score ?? <span aria-label="Yet to bat">—</span>}
        {side.score && side.overs && (
          <span className="pl-1.5 text-xs leading-4 font-normal text-[#71717b]">({side.overs})</span>
        )}
      </p>
    </div>
  );
}

/** Fixture tile for the Live Scores and Schedule pages. */
export function FixtureCard({ match }: { match: Match }) {
  const upcoming = match.state === "upcoming";

  return (
    <article className="rounded-[4px] border border-[#e4e4e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_14px_rgba(17,17,17,0.08)]">
      <Link href={`/matches/${match.slug}`} className="block p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] leading-[15px] font-black tracking-[1.6px] text-[#9f9fa9] uppercase">
              {match.competition.name} · {match.competition.format}
            </p>
            <p className="pt-1 text-xs leading-4 font-semibold text-[#3f3f46]">
              {[match.stage, match.city].filter(Boolean).join(" · ")}
            </p>
          </div>
          <StatusPill match={match} />
        </div>

        <div className="flex flex-col gap-3 pt-5">
          <SideRow side={match.home} />
          <SideRow side={match.away} />
        </div>

        <p className="mt-5 border-t border-[#f4f4f5] pt-4 text-xs leading-4 font-bold text-[#52525c]">
          {upcoming ? (
            <>
              Starts at {formatMatchTime12(match.startsAt)}
              <Countdown iso={match.startsAt} />
            </>
          ) : (
            match.statusText
          )}
        </p>
      </Link>
    </article>
  );
}
