import type { Metadata } from "next";

import { RecordsPage } from "@/components/stats/RecordsPage";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/records", { title: "Cricket Records", description: "Landmark performances across batting, bowling, teams and tournaments." });
}

export default function CricketRecordsPage(props: PageProps<"/records">) {
  return <RecordsPage searchParams={props.searchParams} />;
}
