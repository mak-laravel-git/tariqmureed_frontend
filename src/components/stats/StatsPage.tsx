import Link from "next/link";
import { Suspense } from "react";

import { getStatsPage } from "@/lib/api/endpoints";
import type { StatsMetricTable, StatsScope } from "@/lib/api/types";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

import { CentreLayout, FilterRow, SidebarAd } from "./CentreParts";

const scopes: { key: StatsScope; label: string }[] = [
  { key: "player", label: "Player statistics" },
  { key: "team", label: "Team statistics" },
  { key: "tournament", label: "Tournament statistics" },
];

const formats = ["T20I", "T20", "ODI", "Test"];

const formatGuide = [
  { name: "Test", text: "five-day first-class internationals" },
  { name: "ODI", text: "50-over one-day internationals" },
  { name: "T20I", text: "international T20 matches" },
  { name: "T20", text: "domestic and franchise T20 leagues" },
];

function MetricTable({ metric }: { metric: StatsMetricTable }) {
  return (
    <article className="flex flex-col gap-3">
      <header>
        <p className="flex items-center gap-1.5 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-brand uppercase">
          <span aria-hidden="true" className="h-3 w-[3px] rounded-[2px] bg-brand" />
          {metric.eyebrow}
        </p>
        <h2 className="mt-1 text-xl leading-7 font-bold tracking-[-0.5px] text-[#0f172a]">{metric.title}</h2>
      </header>

      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="sr-only">
            {metric.title}, {metric.eyebrow}
          </caption>
          <thead className="bg-[#f8fafc]">
            <tr className="border-b border-[#f1f5f9] text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#94a3b8] uppercase">
              <th scope="col" className="w-12 px-4 pt-2.5 pb-[11px] text-center">
                #
              </th>
              <th scope="col" className="px-4 pt-2.5 pb-[11px]">
                {metric.subject}
              </th>
              <th scope="col" className="px-4 pt-2.5 pb-[11px]">
                Competition
              </th>
              <th scope="col" className="px-4 pt-2.5 pb-[11px] text-right">
                {metric.valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {metric.rows.map((row) => (
              <tr key={row.rank} className="border-b border-[#f1f5f9] last:border-b-0">
                <td className="px-4 py-3 text-center text-sm leading-5 text-[#94a3b8]">{row.rank}</td>
                <td className="px-4 py-3 text-sm leading-5 font-bold text-[#0f172a]">{row.name}</td>
                <td className="px-4 py-3 text-sm leading-5 text-[#64748b]">{row.note}</td>
                <td className="px-4 py-3 text-right text-[13px] leading-[19.5px] font-bold text-[#0f172a] tabular-nums">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

async function StatsBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const requestedScope = firstParam(params.scope);
  const scope = scopes.find((entry) => entry.key === requestedScope)?.key ?? "player";
  const requestedFormat = firstParam(params.format);
  const format = formats.find((entry) => entry === requestedFormat);

  const data = await getStatsPage(scope, format);
  const href = (updates: Record<string, string | null>) => pageHref(params, updates, undefined, "/stats");

  return (
    <CentreLayout
      variant="stats"
      crumb="Stats"
      eyebrow="Statistics centre"
      title="Statistics"
      description="Batting and bowling tables by format and scope. Every figure comes from the data feed; nothing is estimated."
      badge={[`${data.metricCount} ${data.metricCount === 1 ? "metric" : "metrics"}`, `${scope} · ${format ?? "All"}`]}
      filters={
        <>
          <FilterRow
            variant="stats"
            label="Scope"
            items={scopes.map((entry) => ({
              label: entry.label,
              active: entry.key === scope,
              href: href({ scope: entry.key === "player" ? null : entry.key }),
            }))}
          />
          <FilterRow
            variant="stats"
            label="Format"
            items={[
              { label: "All internationals", active: !format, href: href({ format: null }) },
              ...formats.map((entry) => ({ label: entry, active: entry === format, href: href({ format: entry }) })),
            ]}
          />
        </>
      }
      main={
        <>
          {data.tables.length > 0 ? (
            data.tables.map((metric) => <MetricTable key={metric.id} metric={metric} />)
          ) : (
            <p className="rounded-lg border border-[#e2e8f0] bg-white px-5 py-14 text-center text-sm text-[#64748b]">
              The data feed has no {scope} statistics for {format ?? "this selection"} yet.
            </p>
          )}

          <section className="rounded-xl border border-[#e2e8f0]/90 bg-[#f8fafc]/70 p-[25px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm leading-5 font-bold text-[#0f172a]">How we present statistics</h2>
            <p className="mt-[11px] max-w-[640px] text-xs leading-[19.5px] text-[#64748b]">
              Player tables add up the career figures our data provider holds for the players we follow. Its records start
              from recent seasons, so career totals are lower than all-time figures on sites such as ESPNcricinfo, and the
              tables grow as more players are synced. All internationals means Tests, ODIs and T20Is together. Team tables use the official rankings and the matches stored on TMN Sport; tournament
              tables use the current league standings. A metric with no figures is left out — we never fill gaps with estimates.
            </p>
            <Link href="/records" className="mt-[11px] inline-block pt-1.5 text-xs leading-4 font-bold text-brand hover:underline">
              Looking for record holders? Visit the records centre →
            </Link>
          </section>
        </>
      }
      aside={
        <>
          <section className="rounded-xl border border-[#e2e8f0]/90 bg-white p-[21px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm leading-5 font-bold tracking-[-0.35px] text-[#0f172a]">Format guide</h2>
            <ul className="mt-[11px] flex flex-col gap-[7px] text-xs leading-[19.5px]">
              {formatGuide.map((entry) => (
                <li key={entry.name}>
                  <strong className="font-bold text-[#1e293b]">{entry.name}</strong>
                  <span className="text-[#64748b]"> — {entry.text}</span>
                </li>
              ))}
            </ul>
          </section>
          <SidebarAd variant="stats" />
        </>
      }
    />
  );
}

/** Statistics centre: scope and format filters above one leaderboard per metric. */
export function StatsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading statistics" className="min-h-[900px]" />}>
      <StatsBody searchParams={searchParams} />
    </Suspense>
  );
}
