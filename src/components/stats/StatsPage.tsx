import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { DataTable } from "@/components/ui/DataTable";
import { PageIntro } from "@/components/ui/PageIntro";
import { QuerySelect } from "@/components/ui/QuerySelect";
import { getStatTable } from "@/lib/api/endpoints";
import { firstParam, type SearchParams } from "@/lib/url";

interface StatsPageProps {
  kind: "stats" | "records";
  title: string;
  description: string;
  searchParams: Promise<SearchParams>;
}

function SectionTitle({ children, eyebrow }: { children: string; eyebrow?: string }) {
  return (
    <div className="border-b border-[#e4e4e7] pb-4">
      {eyebrow && (
        <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-[#d08700] uppercase">{eyebrow}</p>
      )}
      <h2 className={`${eyebrow ? "pt-2" : ""} text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#09090b]`}>
        {children}
      </h2>
    </div>
  );
}

async function StatsBody({ kind, searchParams }: Pick<StatsPageProps, "kind" | "searchParams">) {
  const params = await searchParams;
  const table = await getStatTable(kind, firstParam(params.format), firstParam(params.season), firstParam(params.team));

  return (
    <Container className="pt-8 pb-16">
      <div className="flex flex-wrap gap-3 border-b border-[#e4e4e7] pb-6">
        <QuerySelect name="format" label="Format" options={table.options.formats} value={table.filters.format} />
        <QuerySelect name="season" label="Season" options={table.options.seasons} value={table.filters.season} />
        <QuerySelect name="team" label="Team" options={table.options.teams} value={table.filters.team} />
      </div>

      <div className="pt-10">
        <SectionTitle eyebrow={table.eyebrow}>{table.title}</SectionTitle>

        {table.rows.length > 0 ? (
          <DataTable
            className="mt-6"
            caption={`${table.title}, ${table.eyebrow}`}
            rows={table.rows}
            rowKey={(row) => row.rank}
            columns={[
              { key: "rank", label: "Rank" },
              { key: "player", label: "Player", strong: true },
              { key: "team", label: "Team" },
              { key: "matches", label: "Matches" },
              { key: "runs", label: "Runs" },
              { key: "average", label: "Average" },
              { key: "strikeRate", label: "Strike rate" },
            ]}
          />
        ) : (
          <p className="mt-6 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-[#71717b]">
            No players match these filters.
          </p>
        )}
      </div>
    </Container>
  );
}

/** Shared layout of the Statistics and Records pages (filters plus a ranked table). */
export function StatsPage({ title, description, ...body }: StatsPageProps) {
  return (
    <>
      <PageIntro title={title} description={description} />
      <Suspense fallback={<div role="status" aria-label="Loading statistics" className="min-h-[420px]" />}>
        <StatsBody {...body} />
      </Suspense>
    </>
  );
}
