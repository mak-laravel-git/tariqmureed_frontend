import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader, primaryButtonClass } from "@/components/admin/AdminUi";
import { HomeTeamsPicker } from "@/components/admin/HomeTeamsPicker";
import { getHomeTeamChoice } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Team Fixtures" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function HomeTeamsPage() {
  await connection();

  const choice = await getHomeTeamChoice();

  return (
    <>
      <PageHeader
        title="Team Fixtures"
        description={`Choose up to ${choice.limit} teams for the Team Fixtures section of the home page, and their order.`}
        actions={
          <button type="submit" form="home-teams-form" className={primaryButtonClass()}>
            Save teams
          </button>
        }
      />
      <HomeTeamsPicker initialChoice={choice} />
    </>
  );
}
