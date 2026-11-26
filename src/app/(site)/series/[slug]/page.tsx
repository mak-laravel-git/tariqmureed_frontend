import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { Container } from "@/components/ui/Container";
import { DataTable } from "@/components/ui/DataTable";
import { FixtureCard } from "@/components/ui/FixtureCard";
import { EmptyNote } from "@/components/ui/Panel";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { getTournament } from "@/lib/api/endpoints";
import type { TournamentDetail } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { breadcrumbSchema, getSiteUrl, profileMetadata } from "@/lib/seo";
import { firstParam } from "@/lib/url";

export async function generateMetadata(props: PageProps<"/series/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const tournament = await getTournament(slug);

  if (!tournament) {
    return {};
  }

  return profileMetadata({
    path: `/series/${tournament.slug}`,
    title: `${tournament.name}: fixtures, results and points table`,
    description: tournament.overview || `${tournament.name} (${tournament.dateline}): fixtures, results, points table and statistics on TMN Sport.`,
  });
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "matches", label: "Matches" },
  { key: "points-table", label: "Points Table" },
  { key: "teams", label: "Teams" },
  { key: "statistics", label: "Statistics" },
  { key: "news", label: "News" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const formStyles: Record<string, string> = {
  W: "bg-[#dcfce7] text-[#15803d]",
  L: "bg-[#fee2e2] text-[#b91c1c]",
  N: "bg-[#f4f4f5] text-[#71717b]",
};

/** Latest results as small coloured chips: W won, L lost, N no result. */
function FormChips({ form }: { form: string[] }) {
  if (form.length === 0) {
    return <span className="text-[#9f9fa9]">—</span>;
  }

  return (
    <span className="flex gap-1" role="img" aria-label={`Recent form: ${form.join(", ")}`}>
      {form.map((result, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-[10px] leading-4 font-black",
            formStyles[result] ?? formStyles.N,
          )}
        >
          {result}
        </span>
      ))}
    </span>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="border-b border-[#e4e4e7] pb-4">
      <h2 className="text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#09090b]">{children}</h2>
    </div>
  );
}

function TournamentHeader({ tournament }: { tournament: TournamentDetail }) {
  const live = tournament.status.toLowerCase() === "in progress";

  return (
    <section className="bg-surface">
      <Container className="flex flex-wrap items-center gap-6 py-12">
        {tournament.image ? (
          <span aria-hidden="true" className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- competition logo from the data feed CDN */}
            <img src={tournament.image} alt="" width={80} height={80} className="size-20 object-contain" />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#fdc700] text-xl leading-7 font-black text-black"
          >
            {tournament.abbreviation}
          </span>
        )}
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center rounded-[4px] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase",
              live ? "bg-[#fdc700] text-black" : "bg-black text-white",
            )}
          >
            {tournament.status}
          </span>
          <h1 className="pt-3 text-[36px] leading-10 font-bold text-[#151617]">{tournament.name}</h1>
          <p className="pt-2 text-sm leading-5 text-[#111111]">{tournament.dateline}</p>
        </div>
      </Container>
    </section>
  );
}

function TournamentContent({ tournament, tab }: { tournament: TournamentDetail; tab: TabKey }) {
  switch (tab) {
    case "matches":
      return tournament.matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournament.matches.map((match) => (
            <FixtureCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyNote>No matches scheduled yet.</EmptyNote>
      );

    case "points-table":
      return (
        <>
          <SectionTitle>Points table</SectionTitle>
          <DataTable
            className="mt-6"
            caption={`${tournament.name} points table`}
            rows={tournament.pointsTable}
            rowKey={(row) => row.team}
            columns={[
              { key: "position", label: "#" },
              { key: "team", label: "Team", strong: true },
              { key: "played", label: "P" },
              {
                key: "won",
                label: "W",
                render: (row) => <span className="font-black text-[#15803d]">{row.won}</span>,
              },
              {
                key: "lost",
                label: "L",
                render: (row) => <span className="font-bold text-[#b91c1c]">{row.lost}</span>,
              },
              { key: "noResult", label: "N/R" },
              { key: "form", label: "Form", render: (row) => <FormChips form={row.form} /> },
              { key: "points", label: "Pts", render: (row) => <span className="font-black">{row.points}</span> },
              {
                key: "netRunRate",
                label: "NRR",
                render: (row) => (
                  <span className={cn("font-semibold", row.netRunRate.startsWith("-") ? "text-[#b91c1c]" : "text-[#15803d]")}>
                    {row.netRunRate}
                  </span>
                ),
              },
            ]}
          />
          <p className="pt-4 text-xs leading-4 text-[#71717b]">
            P played · W won · L lost · N/R tied or no result · Pts points · NRR net run rate. Form shows the latest
            results, oldest first.
          </p>
        </>
      );

    case "teams":
      return (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournament.teams.map((team) => (
            <li
              key={team}
              className="flex items-center border border-[#e4e4e7] bg-white p-6 text-base leading-6 font-bold text-[#09090b]"
            >
              {team}
            </li>
          ))}
        </ul>
      );

    case "statistics":
      return (
        <div className="max-w-[768px]">
          <SectionTitle>Match statistics</SectionTitle>
          <dl className="flex flex-col gap-4 pt-6">
            {tournament.stats.map((stat) => (
              <div
                key={stat.label}
                className="grid grid-cols-[1fr_2fr_1fr] items-center border border-[#e4e4e7] bg-white p-4 text-center"
              >
                <dd className="text-base leading-6 font-bold text-[#09090b]">{stat.home ?? "—"}</dd>
                <dt className="text-xs leading-4 text-[#71717b]">{stat.label}</dt>
                <dd className="text-base leading-6 font-bold text-[#09090b]">{stat.away ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case "news":
      return (
        <>
          <SectionTitle>Related news</SectionTitle>
          <div className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-3">
            {tournament.news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      );

    default:
      return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionTitle>Tournament overview</SectionTitle>
            <p className="pt-6 text-base leading-7 text-[#52525c]">{tournament.overview}</p>

            <div className="pt-8">
              <SectionTitle>Upcoming matches</SectionTitle>
              <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
                {tournament.upcoming.map((match) => (
                  <FixtureCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          </div>
          <AdSlot placement="series-sidebar" className="w-full max-w-[320px] lg:self-start" />
        </div>
      );
  }
}

async function TournamentView({ params, searchParams }: Pick<PageProps<"/series/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  if (!tournament) {
    notFound();
  }

  const requested = firstParam((await searchParams).tab);
  const tab = tabs.find((entry) => entry.key === requested)?.key ?? "overview";
  const site = await getSiteUrl();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(site, [
          { name: "Home", path: "/" },
          { name: "Series", path: "/series" },
          { name: tournament.name, path: `/series/${tournament.slug}` },
        ])}
      />
      <TournamentHeader tournament={tournament} />
      <UnderlineTabs
        label="Tournament sections"
        tabs={tabs.map((entry) => ({
          label: entry.label,
          active: entry.key === tab,
          href: entry.key === "overview" ? `/series/${slug}` : `/series/${slug}?tab=${entry.key}`,
        }))}
      />
      <Container className="py-10">
        <TournamentContent tournament={tournament} tab={tab} />
      </Container>
    </>
  );
}

export default function TournamentPage(props: PageProps<"/series/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading tournament" className="min-h-[800px]" />}>
      <TournamentView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
