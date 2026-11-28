import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader, primaryButtonClass } from "@/components/admin/AdminUi";
import { LiveCentrePicker } from "@/components/admin/LiveCentrePicker";
import { getLiveCentreChoice } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Live Match Center" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function LiveCentrePage() {
  await connection();

  const choice = await getLiveCentreChoice();

  return (
    <>
      <PageHeader
        title="Live Match Center"
        description={`Choose which competitions the home page shows first on the Live tab and among the results of the past ${choice.windowDays} days. Upcoming matches are always listed by date and time.`}
        actions={
          <button type="submit" form="live-centre-form" className={primaryButtonClass()}>
            Save order
          </button>
        }
      />
      <LiveCentrePicker initialChoice={choice} />
    </>
  );
}
