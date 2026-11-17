import type { Metadata } from "next";

import { MatchdayPage } from "@/components/matches/MatchdayPage";

export const metadata: Metadata = {
  title: "Match Schedule",
  description: "Plan your week with upcoming fixtures, start times and venue information.",
};

export default function SchedulePage(props: PageProps<"/schedule">) {
  return (
    <MatchdayPage
      title="Match Schedule"
      description="Plan your week with upcoming fixtures, start times and venue information."
      basePath="/schedule"
      defaultView="today"
      searchParams={props.searchParams}
      tabs={[
        { key: "yesterday", label: "Yesterday" },
        { key: "today", label: "Today" },
        { key: "tomorrow", label: "Tomorrow" },
        { key: "week", label: "This week" },
      ]}
    />
  );
}
