import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/AdminUi";
import { ProfileForm } from "@/components/admin/SettingsForms";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Admin Profile" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function ProfilePage() {
  await connection();

  const user = await getCurrentAdmin();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHeader title="Admin Profile" description="Manage your administrator identity and contact details." />
      <ProfileForm user={user} />
    </>
  );
}
