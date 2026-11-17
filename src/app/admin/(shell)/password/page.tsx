import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/AdminUi";
import { PasswordForm } from "@/components/admin/SettingsForms";
import { getCurrentAdmin } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Password Management" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function PasswordPage() {
  await connection();

  const user = await getCurrentAdmin();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHeader title="Password Management" description="Update your password and protect your administrator account." />
      <PasswordForm user={user} />
    </>
  );
}
