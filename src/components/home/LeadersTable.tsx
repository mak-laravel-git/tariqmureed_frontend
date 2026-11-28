"use client";

import Link from "next/link";
import { useState } from "react";

import { Tag } from "@/components/ui/Tag";
import type { BattingLeaders } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const columns = [
  { key: "playerName", label: "Player", numeric: false },
  { key: "team", label: "Team", numeric: false },
  { key: "matches", label: "M", numeric: true },
  { key: "runs", label: "Runs", numeric: true },
  { key: "highScore", label: "HS", numeric: true },
  { key: "average", label: "Avg", numeric: true },
  { key: "strikeRate", label: "SR", numeric: true },
  { key: "hundreds", label: "100s", numeric: true },
] as const;

/** The season's leading run-scorers, with a button for each format that has figures. */
export function LeadersTable({ leaders }: { leaders: BattingLeaders }) {
  const formats = leaders.formats ?? [];
  const [chosen, setChosen] = useState(formats[0]?.key);
  // A format can drop out when the figures refresh: the first one then takes its place.
  const table = formats.find((format) => format.key === chosen) ?? formats[0] ?? leaders;

  return (
    <div className="min-w-0 rounded-lg border border-line bg-white p-4 sm:p-5">
      {formats.length > 1 && (
        <div role="group" aria-label="Format" className="mb-4 flex flex-wrap gap-2">
          {formats.map((format) => {
            const active = "key" in table && table.key === format.key;

            return (
              <button
                key={format.key}
                type="button"
                aria-pressed={active}
                onClick={() => setChosen(format.key)}
                className={cn(
                  "h-[37.5px] cursor-pointer rounded-[4px] border px-4 text-[13px] leading-[19.5px] font-bold transition-colors",
                  active ? "border-gold bg-gold text-ink" : "border-tuna text-coal hover:border-ink",
                )}
              >
                {format.key}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tag tone="gold" className="px-2 py-1 text-[11px] tracking-[0.4px]">
          {table.seasonLabel}
        </Tag>
        <span className="text-[13px] leading-[19.5px] text-muted">{table.note}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Leading run-scorers, {table.seasonLabel}</caption>
          <thead>
            <tr className="bg-surface">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-3 py-3 text-[11px] leading-4 font-bold tracking-[1.2px] text-muted uppercase", column.numeric ? "text-right" : "text-left")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={`${row.playerName}-${row.team}`} className="border-t border-line first:border-t-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 py-3 text-sm leading-5",
                      column.numeric ? "text-right text-ink tabular-nums" : "text-left",
                      column.key === "playerName" ? "font-semibold text-ink" : column.numeric ? "" : "text-charade",
                    )}
                  >
                    {row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/stats" className="mt-4 inline-block text-[13px] leading-[19.5px] font-bold text-ink hover:underline">
        View all statistics →
      </Link>
    </div>
  );
}
