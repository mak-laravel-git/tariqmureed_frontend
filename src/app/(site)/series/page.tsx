import type { Metadata } from "next";

import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { getSeriesDirectory } from "@/lib/api/endpoints";

export const metadata: Metadata = {
  title: "Series & Tournaments",
  description: "Explore current, upcoming and recently completed competitions.",
};

export default function SeriesPage(props: PageProps<"/series">) {
  return (
    <DirectoryPage
      title="Series & Tournaments"
      description="Explore current, upcoming and recently completed competitions."
      basePath="/series"
      load={getSeriesDirectory}
      searchParams={props.searchParams}
    />
  );
}
