import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader, primaryButtonClass } from "@/components/admin/AdminUi";
import { SeriesArranger } from "@/components/admin/SeriesArranger";
import { getSeriesArrangement } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Arrange Series Strip" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function ArrangeSeriesPage() {
  await connection();

  const arrangement = await getSeriesArrangement();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/series", label: "Back to series & tournaments" }}
        title="Arrange series strip"
        description="Choose which series the website shows in its SERIES bar, and in what order. New series from SportMonks appear after these until you place them."
        actions={
          <button type="submit" form="series-form" className={primaryButtonClass()}>
            Save order
          </button>
        }
      />
      <SeriesArranger initialArrangement={arrangement} />
    </>
  );
}
