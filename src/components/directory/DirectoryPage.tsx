import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageIntro } from "@/components/ui/PageIntro";
import { TeamBadge } from "@/components/ui/TeamBadge";
import type { Directory } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

interface DirectoryPageProps {
  title: string;
  description: string;
  /** Route the cards link under, e.g. "/series". */
  basePath: string;
  load: () => Promise<Directory>;
  searchParams: Promise<SearchParams>;
}

function StatusTag({ status }: { status: string }) {
  const active = status.toLowerCase() === "in progress";

  return (
    <span
      className={cn(
        "rounded-[4px] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] whitespace-nowrap uppercase",
        active ? "bg-[#fdc700] text-black" : "bg-black text-white",
      )}
    >
      {status}
    </span>
  );
}

async function DirectoryBody({ basePath, load, searchParams }: Omit<DirectoryPageProps, "title" | "description">) {
  const [directory, params] = await Promise.all([load(), searchParams]);
  const requested = firstParam(params.group);
  const active = directory.groups.find((group) => group.slug === requested)?.slug ?? directory.groups[0]?.slug;
  const items = directory.items.filter((entry) => entry.group === active);

  return (
    <Container className="pb-16">
      <FilterTabs
        className="py-6"
        label="Filter"
        tabs={directory.groups.map((group, index) => ({
          label: group.name,
          active: group.slug === active,
          href: pageHref(params, { group: index === 0 ? null : group.slug }, undefined, basePath),
        }))}
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entry) => (
          <li key={`${entry.group}-${entry.slug}`}>
            <Link
              href={`${basePath}/${entry.slug}`}
              className="flex h-full flex-col rounded-[4px] border border-[#e4e4e7] bg-white p-6 transition-shadow hover:shadow-[0_4px_14px_rgba(17,17,17,0.08)]"
            >
              <span className="flex items-start justify-between gap-3">
                <TeamBadge team={{ name: entry.name, shortName: entry.badge, colors: entry.colors, image: entry.image }} size={64} />
                <StatusTag status={entry.status} />
              </span>
              <span className="pt-7 text-xl leading-7 font-black text-[#09090b]">{entry.name}</span>
              <span className="pt-2 text-sm leading-5 text-[#71717b]">{entry.description}</span>
              <span className="flex items-center gap-1 pt-6 text-xs leading-4 font-black tracking-[0.6px] text-[#09090b] uppercase">
                View profile
                <span aria-hidden="true" className="text-base leading-none">
                  ›
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="mt-6 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-[#71717b]">
          Nothing to show here yet.
        </p>
      )}
    </Container>
  );
}

/** Shared layout of the Series & Tournaments and Teams directories. */
export function DirectoryPage({ title, description, ...body }: DirectoryPageProps) {
  return (
    <>
      <PageIntro title={title} description={description} />
      <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-[520px]" />}>
        <DirectoryBody {...body} />
      </Suspense>
    </>
  );
}
