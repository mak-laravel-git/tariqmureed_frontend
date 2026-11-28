import Link from "next/link";

import type { SampleBox } from "@/lib/ads";
import { cn } from "@/lib/cn";

/**
 * The dummy advertisements. They are the site's own promotions, so no real company is imitated and every link
 * stays on this website.
 */
const creatives = {
  live: {
    eyebrow: "TMN Sport Live",
    title: "Every ball, as it happens",
    text: "Follow live cricket scores on TMN Sport.",
    action: "See live scores",
    href: "/live-scores",
    panel: "bg-ink text-white",
    eyebrowColor: "text-brand",
    textColor: "text-white/70",
    button: "bg-brand text-ink",
    ring: "border-white/10",
  },
  rankings: {
    eyebrow: "TMN Rankings",
    title: "Who is on top?",
    text: "Team rankings in every international format.",
    action: "View rankings",
    href: "/rankings",
    panel: "bg-brand text-ink",
    eyebrowColor: "text-ink/70",
    textColor: "text-ink/80",
    button: "bg-ink text-white",
    ring: "border-ink/10",
  },
  sponsor: {
    eyebrow: "Your brand here",
    title: "Reach cricket fans",
    text: "This space is open for your campaign.",
    action: "Ad space available",
    href: null,
    panel: "border border-[#e4e4e7] bg-linear-to-br from-white to-[#eceef2] text-ink",
    eyebrowColor: "text-live",
    textColor: "text-muted",
    button: "border border-ink text-ink",
    ring: "border-ink/5",
  },
} as const;

export type SampleCreative = keyof typeof creatives;

const layouts = {
  banner: "flex-col items-center justify-center gap-3 px-6 pt-6 pb-4 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-10 sm:py-4 sm:text-left",
  rectangle: "flex-col items-center justify-center gap-4 p-6 text-center",
  strip: "flex-col items-start justify-center gap-2 p-4",
};

/** A dummy advertisement shown in an ad box until the dashboard has a real ad for that place. */
export function SampleAd({ box, className }: { box: SampleBox; className?: string }) {
  const creative = creatives[box.creative];
  const body = (
    <>
      <span aria-hidden="true" className={cn("pointer-events-none absolute -right-8 -bottom-10 size-32 rounded-full border-[16px]", creative.ring)} />
      <span className={cn("absolute top-1.5 right-2 text-[9px] leading-3 font-bold tracking-[1px] uppercase", creative.textColor)}>
        Sample ad
      </span>
      <span className="relative flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase", creative.eyebrowColor)}>{creative.eyebrow}</span>
        <span className={cn("font-black", box.shape === "strip" ? "text-base leading-5" : "text-xl leading-7")}>{creative.title}</span>
        {box.shape !== "strip" && <span className={cn("text-xs leading-4", creative.textColor)}>{creative.text}</span>}
      </span>
      <span className={cn("relative shrink-0 rounded-[4px] px-3 py-1.5 text-[11px] leading-4 font-black tracking-[0.5px] uppercase", creative.button)}>
        {creative.action}
      </span>
    </>
  );
  const panel = cn("relative flex flex-1 overflow-hidden rounded-lg", layouts[box.shape], creative.panel);

  return (
    <aside aria-label="Advertisement" className={cn("flex flex-col gap-1", box.className, className)}>
      <p className="text-center text-[10px] leading-[15px] font-bold tracking-[2.2px] text-[#9f9fa9] uppercase">Advertisement</p>
      {creative.href ? (
        <Link href={creative.href} className={cn(panel, "transition-opacity hover:opacity-90")}>
          {body}
        </Link>
      ) : (
        <div className={panel}>{body}</div>
      )}
    </aside>
  );
}
