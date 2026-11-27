"use client";

import { ServerUnavailable } from "@/components/admin/ServerUnavailable";

/** A screen that failed to load: the menu stays, and the screen offers to try again. */
export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return <ServerUnavailable retry={retry} />;
}
