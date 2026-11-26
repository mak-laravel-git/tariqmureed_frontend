import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { DataTable } from "@/components/ui/DataTable";
import { Photo } from "@/components/ui/Photo";
import { getPlayerPage } from "@/lib/api/endpoints";
import { absoluteUrl, breadcrumbSchema, getSiteUrl, profileMetadata } from "@/lib/seo";

export async function generateMetadata(props: PageProps<"/players/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const player = await getPlayerPage(slug);

  if (!player) {
    return {};
  }

  return profileMetadata({
    path: `/players/${player.slug}`,
    title: `${player.name}: career stats and profile`,
    description: `${player.name}${player.teamAndRole ? `, ${player.teamAndRole}` : ""}. Career statistics by format, profile details and the latest news on TMN Sport.`,
    image: player.image,
  });
}

function SectionTitle({ children, eyebrow }: { children: string; eyebrow?: string }) {
  return (
    <div className="border-b border-[#e4e4e7] pb-4">
      {eyebrow && (
        <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-[#d08700] uppercase">{eyebrow}</p>
      )}
      <h2
        className={`${eyebrow ? "pt-2" : ""} text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#09090b]`}
      >
        {children}
      </h2>
    </div>
  );
}

/** Split the last word onto a second line to match the Figma hero name treatment. */
function splitDisplayName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return { first: name, last: null as string | null };
  }
  return { first: parts.slice(0, -1).join(" "), last: parts.at(-1)! };
}

async function PlayerView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerPage(slug);

  if (!player) {
    notFound();
  }

  const { first, last } = splitDisplayName(player.name);
  const site = await getSiteUrl();
  const path = `/players/${player.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${site}${path}#person`,
          name: player.name,
          url: `${site}${path}`,
          ...(player.image ? { image: absoluteUrl(site, player.image) } : {}),
          ...(player.teamAndRole ? { description: player.teamAndRole } : {}),
          jobTitle: "Cricketer",
        }}
      />
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "Players", path: "/players" }, { name: player.name, path }])} />
      <section className="bg-[#2d2d2d] text-white">
        <Container className="grid items-end gap-8 py-10 md:grid-cols-[300px_minmax(0,1fr)]">
          <div className="relative h-[375px] w-full max-w-[300px] overflow-hidden rounded-[4px] justify-self-start self-end">
            {player.image ? (
              <Photo src={player.image} alt={player.name} priority sizes="300px" />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center bg-[#3f3f46] text-7xl font-black text-white/40"
              >
                {player.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 self-end pb-10">
            <p className="text-xs leading-4 font-black tracking-[0.6px] text-[#fdc700] uppercase">{player.teamAndRole}</p>
            <h1 className="pt-3 text-[48px] leading-[48px] font-bold text-white">
              {last ? (
                <>
                  <span className="block">{first}</span>
                  <span className="block">{last}</span>
                </>
              ) : (
                first
              )}
            </h1>
            <dl className="flex flex-wrap gap-8 pt-7">
              {player.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm leading-5 text-[#71717b]">{fact.label}</dt>
                  <dd className="text-sm leading-5 font-bold text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <SectionTitle eyebrow="Career">International statistics</SectionTitle>
        <DataTable
          className="mt-6"
          caption={`${player.name} international statistics`}
          rows={player.career}
          rowKey={(row) => row.format}
          columns={[
            { key: "format", label: "Format", strong: true },
            { key: "matches", label: "Matches" },
            { key: "runs", label: "Runs" },
            { key: "average", label: "Average" },
            { key: "hundreds", label: "100s" },
            { key: "highScore", label: "High score" },
          ]}
        />

        {player.news.length > 0 && (
          <div className="pt-12">
            <SectionTitle>Related news</SectionTitle>
            <div className="grid gap-8 pt-6 md:grid-cols-3">
              {player.news.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

export default function PlayerPage(props: PageProps<"/players/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading player" className="min-h-[800px]" />}>
      <PlayerView params={props.params} />
    </Suspense>
  );
}
