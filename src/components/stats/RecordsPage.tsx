import Link from "next/link";
import { Suspense } from "react";

import { getRecordsPage } from "@/lib/api/endpoints";
import type { RecordGroup } from "@/lib/api/types";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

import { CentreLayout, FilterRow, SidebarAd } from "./CentreParts";

const groups: { key: RecordGroup; label: string }[] = [
  { key: "batting", label: "Batting" },
  { key: "bowling", label: "Bowling" },
  { key: "team", label: "Team" },
  { key: "tournament", label: "Tournament" },
];

const formats = ["Test", "ODI", "T20I", "T20"];

const notes = [
  {
    title: "Where these records come from",
    text: "Each record is the best mark among the players, matches and league tables in the TMN Sport data feed. It covers the squads and competitions we follow, so it is not an all-time list, and it updates as new figures arrive.",
  },
  {
    title: "Spot an error?",
    text: "Statistical corrections are handled by the data desk. Corrections are reviewed and republished with an editor's note on the affected page.",
  },
];

async function RecordsBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const group = groups.find((entry) => entry.key === firstParam(params.group))?.key;
  const format = formats.find((entry) => entry === firstParam(params.format));

  const data = await getRecordsPage(group, format);
  const href = (updates: Record<string, string | null>) => pageHref(params, updates, undefined, "/records");
  const groupLabel = groups.find((entry) => entry.key === group)?.label;

  return (
    <CentreLayout
      variant="records"
      crumb="Records"
      eyebrow="Records centre"
      title="Cricket Records"
      description="Landmark performances across batting, bowling, teams and tournaments. Filter by record group and format."
      badge={[`${data.total} ${data.total === 1 ? "record" : "records"}`, `${group ?? "all"} · ${format ?? "All"}`]}
      filters={
        <>
          <FilterRow
            variant="records"
            label="Record group"
            items={[
              { label: "All records", active: !group, href: href({ group: null }) },
              ...groups.map((entry) => ({ label: entry.label, active: entry.key === group, href: href({ group: entry.key }) })),
            ]}
          />
          <FilterRow
            variant="records"
            label="Format"
            items={[
              { label: "All formats", active: !format, href: href({ format: null }) },
              ...formats.map((entry) => ({ label: entry, active: entry === format, href: href({ format: entry }) })),
            ]}
          />
        </>
      }
      main={
        <>
          <section className="flex flex-col gap-4">
            <header>
              <p className="flex items-center gap-1.5 text-[10px] leading-[15px] font-bold tracking-[0.5px] text-[#64748b] uppercase">
                <span aria-hidden="true" className="h-3 w-[3px] rounded-[1px] bg-[#f59e0b]" />
                {format ?? "All formats"}
              </p>
              <h2 className="mt-1 text-[22px] leading-[33px] font-bold tracking-[-0.55px] text-[#0f172a]">
                {groupLabel ? `${groupLabel} records` : "All records"}
              </h2>
            </header>

            {data.records.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <caption className="sr-only">
                    {groupLabel ?? "All"} records, {format ?? "all formats"}
                  </caption>
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] leading-[15px] font-semibold tracking-[0.5px] text-[#94a3b8] uppercase">
                      <th scope="col" className="px-4 py-3">
                        Record
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Holder
                      </th>
                      <th scope="col" className="px-3 py-3 text-center">
                        Format
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Detail
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record) => (
                      <tr key={record.id} className="border-t border-[#f1f5f9] first:border-t-0">
                        <td className="px-4 py-3">
                          <span className="block text-xs leading-[18px] font-medium text-[#0f172a]">{record.title}</span>
                          <span className="mt-0.5 block text-[10px] leading-[15px] font-bold tracking-[0.5px] text-[#94a3b8] uppercase">
                            {record.group}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs leading-[18px] font-medium whitespace-nowrap text-[#0f172a]">
                          {record.holder}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]/50 px-[9px] py-[3px] text-[10px] leading-[15px] font-medium tracking-[0.25px] text-[#475569] uppercase">
                            {record.format}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs leading-[18px] text-[#64748b]">{record.detail}</td>
                        <td className="px-4 py-3 text-right text-xs leading-[18px] font-bold whitespace-nowrap text-[#0f172a] tabular-nums">
                          {record.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-14 text-center text-sm text-[#64748b]">
                No records for these filters yet. They appear as soon as the data feed has figures for them.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes.map((note) => (
              <article key={note.title} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc]/40 px-[21px] py-5">
                <h3 className="text-[13px] leading-[19.5px] font-bold text-[#0f172a]">{note.title}</h3>
                <p className="mt-1.5 text-xs leading-[19.5px] text-[#64748b]">{note.text}</p>
              </article>
            ))}
          </section>
        </>
      }
      aside={
        <>
          <section className="rounded-xl border border-[#e2e8f0] bg-white p-[21px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h2 className="pb-1 text-sm leading-[21px] font-bold text-[#0f172a]">Record groups</h2>
            <ul className="mt-3">
              {groups.map((entry) => (
                <li key={entry.key} className="border-t border-[#f1f5f9] first:border-t-0">
                  <Link
                    href={href({ group: entry.key })}
                    replace
                    scroll={false}
                    className="flex items-center justify-between py-2.5 text-[13px] leading-[19.5px] text-[#334155] hover:text-[#0f172a]"
                  >
                    {entry.label}
                    <span className="font-medium text-[#94a3b8]">{data.groupCounts[entry.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <SidebarAd variant="records" />
        </>
      }
    />
  );
}

/** Records centre: group and format filters above one table of landmark records. */
export function RecordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading records" className="min-h-[900px]" />}>
      <RecordsBody searchParams={searchParams} />
    </Suspense>
  );
}
