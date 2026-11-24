import type { Metadata } from "next";

import { StatsPage } from "@/components/stats/StatsPage";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/stats", { title: "Statistics", description: "Batting and bowling tables by format and scope, taken straight from the data feed." });
}

export default function StatisticsPage(props: PageProps<"/stats">) {
  return <StatsPage searchParams={props.searchParams} />;
}
