import type { Metadata } from "next";

import { RecordsPage } from "@/components/stats/RecordsPage";

export const metadata: Metadata = {
  title: "Cricket Records",
  description: "Landmark performances across batting, bowling, teams and tournaments.",
};

export default function CricketRecordsPage(props: PageProps<"/records">) {
  return <RecordsPage searchParams={props.searchParams} />;
}
