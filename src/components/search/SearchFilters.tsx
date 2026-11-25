import Link from "next/link";

import { cn } from "@/lib/cn";
import type { SearchType } from "@/lib/api/types";
import { pageHref, type SearchParams } from "@/lib/url";

export const searchTypes: { key: SearchType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "matches", label: "Matches" },
  { key: "teams", label: "Teams" },
  { key: "players", label: "Players" },
  { key: "videos", label: "Videos" },
];

export function resolveSearchType(value: string | undefined): SearchType {
  return searchTypes.find((entry) => entry.key === value)?.key ?? "all";
}

interface SearchFiltersProps {
  active: SearchType;
  params: SearchParams;
}

/** Result type filter: server-rendered links that keep the query and reset paging. */
export function SearchFilters({ active, params }: SearchFiltersProps) {
  return (
    <nav aria-label="Result type" className="flex flex-wrap gap-2">
      {searchTypes.map((entry) => {
        const selected = entry.key === active;

        return (
          <Link
            key={entry.key}
            replace
            href={pageHref(params, { type: entry.key === "all" ? null : entry.key, limit: null }, undefined, "/search")}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "flex items-center justify-center rounded-[4px] border px-4 py-2 text-xs leading-4 font-black tracking-[0.6px] uppercase transition-colors",
              selected
                ? "border-[#09090b] bg-[#09090b] text-white"
                : "border-[#e4e4e7] bg-white text-[#71717b] hover:border-[#09090b] hover:text-[#09090b]",
            )}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
