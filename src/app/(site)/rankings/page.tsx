import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { EmptyNote } from "@/components/ui/Panel";
import { PageIntro } from "@/components/ui/PageIntro";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { getRankings } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

const description = "Official team rankings in Tests, ODIs and T20Is. Open a team to see its leading batters and bowlers.";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/rankings", { title: "Cricket Rankings", description });
}

const genderLabels: Record<string, string> = { men: "Men", women: "Women" };

async function RankingsBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const data = await getRankings();

  const genders = Object.keys(data.tables).sort((a, b) => (a === "men" ? -1 : b === "men" ? 1 : a.localeCompare(b)));
  const requestedGender = firstParam(params.gender);
  const gender = genders.find((entry) => entry === requestedGender) ?? genders[0];
  const tables = data.tables[gender] ?? {};
  const formats = data.formats.filter((entry) => tables[entry.key]?.length);
  const requestedFormat = firstParam(params.format);
  const format = formats.find((entry) => entry.key === requestedFormat)?.key ?? formats[0]?.key;
  const rows = format ? (tables[format] ?? []) : [];
  const updated = data.updatedAt
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(data.updatedAt))
    : null;

  return (
    <Container className="pb-16">
      <div className="flex flex-col gap-3 py-6">
        {genders.length > 1 && (
          <FilterTabs
            label="Gender"
            tabs={genders.map((entry) => ({
              label: genderLabels[entry] ?? entry,
              active: entry === gender,
              href: pageHref(params, { gender: entry === genders[0] ? null : entry, format: null }, undefined, "/rankings"),
            }))}
          />
        )}
        <FilterTabs
          label="Format"
          tabs={formats.map((entry) => ({
            label: entry.label,
            active: entry.key === format,
            href: pageHref(params, { format: entry.key === formats[0]?.key ? null : entry.key }, undefined, "/rankings"),
          }))}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyNote>Rankings are not available yet.</EmptyNote>
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-[#e4e4e7] bg-white">
          <table className="w-full min-w-[520px] text-left">
            <caption className="sr-only">
              {genderLabels[gender] ?? gender} team rankings, {formats.find((entry) => entry.key === format)?.label}
            </caption>
            <thead>
              <tr className="border-b border-[#e4e4e7] text-xs leading-4 font-black tracking-[0.6px] text-[#71717b] uppercase">
                <th scope="col" className="w-16 px-4 py-3 text-center">
                  Pos
                </th>
                <th scope="col" className="px-4 py-3">
                  Team
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Matches
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Points
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.team.slug} className="border-b border-[#e4e4e7] last:border-b-0 hover:bg-surface">
                  <td className="px-4 py-3 text-center text-base leading-6 font-black text-[#09090b]">{row.position}</td>
                  <th scope="row" className="px-4 py-3 font-normal">
                    <Link href={`/teams/${row.team.slug}`} className="flex items-center gap-3 text-base leading-6 font-bold text-[#09090b] hover:underline">
                      <TeamBadge team={row.team} size={34} />
                      {row.team.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-right text-sm leading-5 text-[#52525c] tabular-nums">{row.matches}</td>
                  <td className="px-4 py-3 text-right text-sm leading-5 text-[#52525c] tabular-nums">{row.points.toLocaleString("en-GB")}</td>
                  <td className="px-4 py-3 text-right text-base leading-6 font-bold text-[#09090b] tabular-nums">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="pt-4 text-xs leading-5 text-[#71717b]">
        Select a team to see its leading batters and bowlers.{updated ? ` Table updated ${updated}.` : ""}
      </p>
    </Container>
  );
}

export default function RankingsPage(props: PageProps<"/rankings">) {
  return (
    <>
      <PageIntro title="Rankings" description={description} />
      <Suspense fallback={<div role="status" aria-label="Loading rankings" className="min-h-[640px]" />}>
        <RankingsBody searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
