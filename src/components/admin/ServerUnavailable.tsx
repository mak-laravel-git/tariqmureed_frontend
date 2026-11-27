"use client";

import { primaryButtonClass } from "./AdminUi";

/** Shown in place of an admin screen that could not be loaded, usually because the API answered too slowly. */
export function ServerUnavailable({ retry }: { retry?: () => void }) {
  return (
    <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-bold text-ink">This page could not be loaded</h1>
      <p className="max-w-[420px] text-sm leading-6 text-muted">
        The server did not answer in time, or something went wrong. You are still signed in. Wait a moment and try again.
      </p>
      <button type="button" onClick={() => (retry ? retry() : window.location.reload())} className={primaryButtonClass("mt-2")}>
        Try again
      </button>
    </div>
  );
}
