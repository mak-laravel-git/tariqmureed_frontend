import type { Metadata } from "next";

import { StatsPage } from "@/components/stats/StatsPage";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Explore the numbers behind the performances across formats and seasons.",
};

export default function StatisticsPage(props: PageProps<"/stats">) {
  return (
    <StatsPage
      kind="stats"
      title="Statistics"
      description="Explore the numbers behind the performances across formats and seasons."
      searchParams={props.searchParams}
    />
  );
}
