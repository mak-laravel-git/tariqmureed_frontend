import Link from "next/link";

import { FilterTabs } from "@/components/ui/FilterTabs";
import { Photo } from "@/components/ui/Photo";
import type { PlayerRankings as PlayerRankingsData, RankedBatter, RankedBowler } from "@/lib/api/types";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

interface PlayerRankingsProps {
  rankings: PlayerRankingsData;
  teamName: string;
  basePath: string;
  params: SearchParams;
}

const headRow = "border-b border-[#e4e4e7] text-xs leading-4 font-black tracking-[0.6px] text-[#71717b] uppercase";
const head = "px-3 py-3 text-right";
const cell = "px-3 py-3 text-right text-sm leading-5 text-[#52525c] tabular-nums";
const strong = "px-3 py-3 text-right text-base leading-6 font-bold text-[#09090b] tabular-nums";

function PlayerCell({ player }: { player: RankedBatter | RankedBowler }) {
  return (
    <th scope="row" className="px-3 py-3 font-normal">
      <Link href={`/players/${player.slug}`} className="flex items-center gap-3 hover:underline">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface">
          <Photo src={player.image} alt="" sizes="40px" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base leading-6 font-bold text-[#09090b]">{player.name}</span>
          <span className="block truncate text-xs leading-4 text-[#71717b]">{player.role}</span>
        </span>
      </Link>
    </th>
  );
}

/**
 * The team's leading batters (by career runs) and bowlers (by career wickets), with a tab for each format.
 * Hidden until at least one player of the team has career figures.
 */
export function PlayerRankings({ rankings, teamName, basePath, params }: PlayerRankingsProps) {
  const formats = rankings.formats.filter((entry) => rankings.batting[entry.key]?.length || rankings.bowling[entry.key]?.length);

  if (formats.length === 0) {
    return null;
  }

  const format = formats.find((entry) => entry.key === firstParam(params.format))?.key ?? formats[0].key;
  const batters = rankings.batting[format] ?? [];
  const bowlers = rankings.bowling[format] ?? [];
  const role = firstParam(params.role) === "bowling" && bowlers.length > 0 ? "bowling" : batters.length > 0 ? "batting" : "bowling";
  const label = formats.find((entry) => entry.key === format)?.label ?? format;
  const roleTabs = [
    { label: "Batting", active: role === "batting", href: pageHref(params, { role: null }, undefined, basePath), show: batters.length > 0 },
    { label: "Bowling", active: role === "bowling", href: pageHref(params, { role: "bowling" }, undefined, basePath), show: bowlers.length > 0 },
  ].filter((tab) => tab.show);

  return (
    <div className="pt-10">
      <div className="border-b border-[#e4e4e7] pb-4">
        <h2 className="text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#09090b]">Player rankings</h2>
        <p className="pt-1 text-sm leading-5 text-[#71717b]">{teamName}&apos;s leading players by career figures</p>
      </div>

      <div className="flex flex-col gap-3 pt-6">
        <FilterTabs
          label="Format"
          tabs={formats.map((entry) => ({
            label: entry.label,
            active: entry.key === format,
            href: pageHref(params, { format: entry.key === formats[0].key ? null : entry.key }, undefined, basePath),
          }))}
        />
        <FilterTabs label="Batting or bowling" tabs={roleTabs} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-[4px] border border-[#e4e4e7] bg-white">
        {role === "batting" ? (
          <table className="w-full min-w-[560px] text-left">
            <caption className="sr-only">
              {teamName} batters, {label}
            </caption>
            <thead>
              <tr className={headRow}>
                <th scope="col" className="w-12 px-3 py-3 text-center">
                  #
                </th>
                <th scope="col" className="px-3 py-3">
                  Player
                </th>
                <th scope="col" className={head}>
                  Mat
                </th>
                <th scope="col" className={head}>
                  Runs
                </th>
                <th scope="col" className={head}>
                  Avg
                </th>
                <th scope="col" className={head}>
                  100s
                </th>
                <th scope="col" className={head}>
                  HS
                </th>
              </tr>
            </thead>
            <tbody>
              {batters.map((player) => (
                <tr key={player.slug} className="border-b border-[#e4e4e7] last:border-b-0 hover:bg-surface">
                  <td className="px-3 py-3 text-center text-base leading-6 font-black text-[#09090b]">{player.rank}</td>
                  <PlayerCell player={player} />
                  <td className={cell}>{player.matches}</td>
                  <td className={strong}>{player.runs.toLocaleString("en-GB")}</td>
                  <td className={cell}>{player.average?.toFixed(2) ?? "—"}</td>
                  <td className={cell}>{player.hundreds}</td>
                  <td className={cell}>{player.highScore || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[520px] text-left">
            <caption className="sr-only">
              {teamName} bowlers, {label}
            </caption>
            <thead>
              <tr className={headRow}>
                <th scope="col" className="w-12 px-3 py-3 text-center">
                  #
                </th>
                <th scope="col" className="px-3 py-3">
                  Player
                </th>
                <th scope="col" className={head}>
                  Mat
                </th>
                <th scope="col" className={head}>
                  Wkts
                </th>
                <th scope="col" className={head}>
                  Avg
                </th>
                <th scope="col" className={head}>
                  5W
                </th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((player) => (
                <tr key={player.slug} className="border-b border-[#e4e4e7] last:border-b-0 hover:bg-surface">
                  <td className="px-3 py-3 text-center text-base leading-6 font-black text-[#09090b]">{player.rank}</td>
                  <PlayerCell player={player} />
                  <td className={cell}>{player.matches}</td>
                  <td className={strong}>{player.wickets}</td>
                  <td className={cell}>{player.average.toFixed(2)}</td>
                  <td className={cell}>{player.fiveWickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
