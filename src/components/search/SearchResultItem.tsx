import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { SearchResult } from "@/lib/api/types";

function Crest({ team }: { team: NonNullable<SearchResult["teams"]>[number] }) {
  return (
    <span
      role="img"
      aria-label={team.name}
      className="flex size-14 shrink-0 items-center justify-center rounded-full text-xs leading-4 font-black text-white"
      style={{ backgroundImage: `linear-gradient(145deg, ${team.colors.from} 0%, ${team.colors.to} 100%)` }}
    >
      {team.shortName}
    </span>
  );
}

function Label({ children, tracking }: { children: string; tracking: string }) {
  return (
    <p className={`text-[10px] leading-[15px] font-black text-[#d08700] uppercase ${tracking}`}>{children}</p>
  );
}

/** Teams and matches: a bordered row led by the team crest(s). */
function CrestResult({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="flex items-center gap-4 rounded-[4px] border border-[#e4e4e7] p-4 transition-colors hover:border-[#09090b] sm:gap-5 sm:p-5"
    >
      <span className="flex shrink-0 -space-x-3">
        {result.teams?.map((team) => <Crest key={team.name} team={team} />)}
      </span>
      <span className="min-w-0">
        <Label tracking="tracking-[0.12px]">{result.label}</Label>
        <span className="block text-base leading-6 font-black tracking-[-0.31px] text-[#09090b]">{result.title}</span>
        {result.meta && <span className="mt-0.5 block text-xs leading-4 text-[#71717b]">{result.meta}</span>}
      </span>
    </Link>
  );
}

/** Stories, players and videos: a 112 x 84 thumbnail beside the headline. */
function StoryResult({ result }: { result: SearchResult }) {
  return (
    <Link href={result.href} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
      <span className="relative block aspect-[4/3] overflow-hidden rounded-[4px] bg-[#e4e4e7]">
        {result.image && (
          <Photo
            src={result.image}
            alt={result.imageAlt ?? ""}
            sizes="112px"
            className="transition-transform duration-300 group-hover:scale-[1.05]"
          />
        )}
        {result.duration && (
          <span className="absolute right-1 bottom-1 rounded-[2px] bg-black/80 px-1 text-[10px] leading-4 font-bold text-white">
            {result.duration}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <Label tracking="tracking-[1.72px]">{result.label}</Label>
        <span className="mt-2 block text-sm leading-[17.5px] font-extrabold tracking-[-0.15px] text-[#09090b] group-hover:underline">
          {result.title}
        </span>
        <span className="mt-3 block text-xs leading-4 text-[#71717b]">
          {result.publishedAt && (
            <>
              <TimeAgo iso={result.publishedAt} />
              {result.meta ? " · " : ""}
            </>
          )}
          {result.meta}
        </span>
      </span>
    </Link>
  );
}

export function SearchResultItem({ result }: { result: SearchResult }) {
  return result.type === "teams" || result.type === "matches" ? (
    <CrestResult result={result} />
  ) : (
    <StoryResult result={result} />
  );
}
