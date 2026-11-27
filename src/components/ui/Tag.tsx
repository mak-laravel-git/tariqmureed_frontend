import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TagTone = "gold" | "dark" | "live" | "win" | "muted";

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}

const tones: Record<TagTone, string> = {
  gold: "bg-gold text-ink",
  dark: "bg-ink text-white",
  live: "bg-live text-white",
  win: "bg-win/12 text-win",
  muted: "bg-chip text-muted",
};

/** Compact uppercase label (category, status, format). */
export function Tag({ children, tone = "gold", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[10px] leading-[15px] font-bold tracking-[1.2px] whitespace-nowrap capitalize",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
