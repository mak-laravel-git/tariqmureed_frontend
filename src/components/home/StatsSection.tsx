import Link from "next/link";

import { AdSlot } from "@/components/ui/AdSlot";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getBattingLeaders, getMostRead } from "@/lib/api/endpoints";
import { cn } from "@/lib/cn";

import { AsideHeading, HeadlineItem } from "./LatestNews";

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

export async function StatsSection() {
  const [leaders, mostRead] = await Promise.all([getBattingLeaders(), getMostRead()]);

  return (
    <Section aria-labelledby="stats-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,904fr)_minmax(0,320fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionHeading
            id="stats-title"
            title="Number Crunching"
            description="Leading run-scorers across the current season."
            action={{ href: "/stats", label: "View all" }}
          />

          <div className="min-w-0 rounded-lg border border-line bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Tag tone="gold" className="px-2 py-1 text-[11px] tracking-[0.4px]">
                {leaders.seasonLabel}
              </Tag>
              <span className="text-[13px] leading-[19.5px] text-muted">{leaders.note}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Leading run-scorers, {leaders.seasonLabel}</caption>
                <thead>
                  <tr className="bg-surface">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={cn(
                          "px-3 py-3 text-[11px] leading-4 font-bold tracking-[1.2px] text-muted uppercase",
                          column.numeric ? "text-right" : "text-left",
                        )}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaders.rows.map((row) => (
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
                          {String(row[column.key])}
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
        </div>

        <aside aria-label="Most read" className="flex min-w-0 flex-col gap-6">
          <div>
            <AsideHeading display>Most Read</AsideHeading>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {mostRead.map((article) => (
                <HeadlineItem key={article.id} article={article} titleSize="lg" />
              ))}
            </div>
          </div>

          <AdSlot format="300 × 250 — Medium Rectangle" className="min-h-[268px]" />
        </aside>
      </div>
    </Section>
  );
}
