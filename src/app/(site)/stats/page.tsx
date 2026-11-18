import type { Metadata } from "next";

import { StatsPage } from "@/components/stats/StatsPage";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Batting and bowling tables by format and scope, taken straight from the data feed.",
};

export default function StatisticsPage(props: PageProps<"/stats">) {
  return <StatsPage searchParams={props.searchParams} />;
}
