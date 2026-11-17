import type { Metadata } from "next";

import { MatchdayPage } from "@/components/matches/MatchdayPage";

export const metadata: Metadata = {
  title: "Live Scores",
  description: "Follow matches live with current scores, key moments and verified status updates.",
};

export default function LiveScoresPage(props: PageProps<"/live-scores">) {
  return (
    <MatchdayPage
      title="Live Scores"
      description="Follow matches live with current scores, key moments and verified status updates."
      basePath="/live-scores"
      defaultView="live"
      searchParams={props.searchParams}
      tabs={[
        { key: "live", label: "Live" },
        { key: "upcoming", label: "Upcoming" },
        { key: "result", label: "Completed" },
      ]}
    />
  );
}
