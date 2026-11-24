import type { Metadata } from "next";

import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { getTeamsDirectory } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/teams", { title: "Teams", description: "National sides, domestic clubs, squads, fixtures and results." });
}

export default function TeamsPage(props: PageProps<"/teams">) {
  return (
    <DirectoryPage
      title="Teams"
      description="National sides, domestic clubs, squads, fixtures and results."
      basePath="/teams"
      load={getTeamsDirectory}
      searchParams={props.searchParams}
    />
  );
}
