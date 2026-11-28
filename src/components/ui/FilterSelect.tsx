"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ChevronDownIcon } from "./icons";

interface FilterSelectProps {
  /** Query parameter that keeps the choice, e.g. "competition". */
  param: string;
  /** Names the drop-down for screen readers. */
  label: string;
  /** The first option, which clears the filter. */
  allLabel: string;
  options: { slug: string; name: string }[];
  value?: string;
}

/** Drop-down filter such as "All tournaments"; keeps the choice in the address. */
export function FilterSelect({ param, label, allLabel, options, value }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set(param, slug);
    } else {
      params.delete(param);
    }

    // A new selection starts from its first page of matches.
    params.delete("show");

    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <label className="relative flex flex-1 items-center sm:flex-none">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
        className="h-[35px] w-full min-w-[181px] cursor-pointer appearance-none rounded-[4px] border border-[#e4e4e7] bg-white pr-9 pl-4 text-xs leading-normal font-bold text-[#09090b] outline-none focus-visible:border-ink disabled:opacity-60 sm:max-w-[280px]"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3" width={14} height={14} />
    </label>
  );
}
