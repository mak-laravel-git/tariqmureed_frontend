"use client";

import { cn } from "@/lib/cn";

/** Recommended lengths: Google shows about 60 characters of a title and 160 of a description. */
export const SEO_TITLE = { min: 30, max: 60 } as const;
export const SEO_DESCRIPTION = { min: 70, max: 160 } as const;

type Meter = { label: string; tone: "good" | "warning" | "error" };

function measure(length: number, range: { min: number; max: number }): Meter {
  if (length === 0) {
    return { label: "Empty: the page's own text is used", tone: "warning" };
  }
  if (length > range.max) {
    return { label: `${length - range.max} too long: Google will cut it`, tone: "error" };
  }
  if (length < range.min) {
    return { label: "A little short: add more detail", tone: "warning" };
  }

  return { label: "Good length", tone: "good" };
}

const toneClass: Record<Meter["tone"], string> = {
  good: "text-[#1a7f3d]",
  warning: "text-[#a16207]",
  error: "text-[#b42318]",
};

/** "42 / 60 · Good length" under a title or description field, coloured by how well it fits a search result. */
export function LengthMeter({ value, range }: { value: string; range: { min: number; max: number } }) {
  const length = value.trim().length;
  const meter = measure(length, range);

  return (
    <p role="status" className={cn("mt-1.5 flex items-center justify-between gap-3 text-[11px] leading-4", toneClass[meter.tone])}>
      <span>{meter.label}</span>
      <span className="font-semibold tabular-nums">
        {length} / {range.max}
      </span>
    </p>
  );
}

interface SerpPreviewProps {
  title: string;
  description: string;
  /** Address shown under the site name, e.g. "tmnsport.com › news". */
  address: string;
  siteName: string;
}

/** How the page will look in a Google search result, cut at the same lengths Google uses. */
export function SerpPreview({ title, description, address, siteName }: SerpPreviewProps) {
  const cut = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

  return (
    <div className="rounded-md border border-line bg-white p-4" aria-label="Google search result preview">
      <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-muted uppercase">Google preview</p>
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-bold text-charade">
          {siteName.charAt(0).toUpperCase() || "T"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] leading-4 text-[#202124]">{siteName}</p>
          <p className="truncate text-[12px] leading-4 text-[#4d5156]">{address}</p>
        </div>
      </div>
      <p className="mt-2 text-[19px] leading-6 text-[#1a0dab]">{cut(title.trim() || "Page title", 60)}</p>
      <p className="mt-1 text-[13.5px] leading-[20px] text-[#4d5156]">{cut(description.trim() || "Add a description: it is the grey text under the title in Google.", 160)}</p>
    </div>
  );
}
