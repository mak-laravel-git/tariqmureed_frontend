import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ServerUnavailable } from "@/components/admin/ServerUnavailable";
import { getCurrentAdmin, getNotifications } from "@/lib/admin/data";
import type { AdminUser } from "@/lib/admin/types";
import { ApiError } from "@/lib/api/client";

/**
 * The admin area is private and always request-time rendered, so it opts out of the
 * instant-navigation validation used for the public pages.
 */
export const instant = false;

async function AdminFrame({ children }: { children: ReactNode }) {
  let user: AdminUser | null;

  try {
    user = await getCurrentAdmin();
  } catch (error) {
    // Only the API's own failures: Next.js signals pass through.
    if (!(error instanceof ApiError)) {
      throw error;
    }

    // error.tsx does not catch what its own layout throws, so the notice is shown from here.
    return <ServerUnavailable />;
  }

  if (!user) {
    redirect("/admin/login");
  }

  const notifications = await getNotifications();

  return (
    <AdminShell user={user} notifications={notifications}>
      {children}
    </AdminShell>
  );
}

export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading admin" className="min-h-screen bg-[#f5f6f8]" />}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}
