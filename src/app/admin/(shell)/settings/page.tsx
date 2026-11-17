import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader, primaryButtonClass } from "@/components/admin/AdminUi";
import { SettingsForm } from "@/components/admin/SettingsForms";
import { getSettings } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Website Settings" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function SettingsPage() {
  await connection();

  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Website Settings"
        description="Configure global website, navigation and editorial preferences."
        actions={
          <button type="submit" form="settings-form" className={primaryButtonClass()}>
            Save changes
          </button>
        }
      />
      <SettingsForm settings={settings} />
    </>
  );
}
