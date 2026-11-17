import type { Metadata } from "next";

import { StatsPage } from "@/components/stats/StatsPage";

export const metadata: Metadata = {
  title: "Records",
  description: "The definitive list of landmark batting, bowling and team achievements.",
};

export default function RecordsPage(props: PageProps<"/records">) {
  return (
    <StatsPage
      kind="records"
      title="Records"
      description="The definitive list of landmark batting, bowling and team achievements."
      searchParams={props.searchParams}
    />
  );
}
