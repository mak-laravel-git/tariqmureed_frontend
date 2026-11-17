"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { CompetitionRef } from "@/lib/api/types";

import { ChevronDownIcon } from "./icons";

interface CompetitionSelectProps {
  competitions: CompetitionRef[];
  value?: string;
}

/** "All tournaments" drop-down; keeps the choice in the ?competition= query parameter. */
export function CompetitionSelect({ competitions, value }: CompetitionSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("competition", slug);
    } else {
      params.delete("competition");
    }

    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <label className="relative flex items-center">
      <span className="sr-only">Filter by tournament</span>
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
        className="h-[35px] w-full min-w-[181px] cursor-pointer appearance-none rounded-[4px] border border-[#e4e4e7] bg-white pr-9 pl-4 text-xs leading-normal font-bold text-[#09090b] outline-none focus-visible:border-ink disabled:opacity-60"
      >
        <option value="">All tournaments</option>
        {competitions.map((competition) => (
          <option key={competition.slug} value={competition.slug}>
            {competition.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3" width={14} height={14} />
    </label>
  );
}
