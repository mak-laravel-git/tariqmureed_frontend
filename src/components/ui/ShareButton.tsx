"use client";

import { useState } from "react";

import { ShareIcon } from "./icons";

interface ShareButtonProps {
  title: string;
}

/** Uses the native share sheet when available, otherwise copies the page link. */
export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The visitor dismissed the share sheet; nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center gap-2 text-xs leading-4 font-bold text-[#09090b] transition-opacity hover:opacity-70"
    >
      <ShareIcon width={16} height={16} />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
