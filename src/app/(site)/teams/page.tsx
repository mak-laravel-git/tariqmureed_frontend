import type { Metadata } from "next";

import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { getTeamsDirectory } from "@/lib/api/endpoints";

export const metadata: Metadata = {
  title: "Teams",
  description: "National sides, domestic clubs, squads, fixtures and results.",
};

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
