import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MatchHeader } from "@/components/matches/MatchHeader";
import { MatchTabBar, MatchTabContent, resolveMatchTab } from "@/components/matches/MatchTabs";
import { getMatchDetail } from "@/lib/api/endpoints";
import { firstParam } from "@/lib/url";

async function MatchCentre({
  params,
  searchParams,
}: Pick<PageProps<"/matches/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const match = await getMatchDetail(slug);

  if (!match) {
    notFound();
  }

  const tab = resolveMatchTab(firstParam((await searchParams).tab));

  return (
    <>
      <MatchHeader match={match} />
      <MatchTabBar slug={match.slug} active={tab} />
      <MatchTabContent match={match} tab={tab} />
    </>
  );
}

export default function MatchPage(props: PageProps<"/matches/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading match" className="min-h-[900px]" />}>
      <MatchCentre params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
