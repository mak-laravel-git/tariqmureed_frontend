import type { Metadata } from "next";

import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { getSeriesDirectory } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/series", { title: "Series & Tournaments", description: "Explore current, upcoming and recently completed competitions." });
}

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
