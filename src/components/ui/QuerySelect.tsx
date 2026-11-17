"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ChevronDownIcon } from "./icons";

interface QuerySelectProps {
  /** Query-string parameter updated on change. */
  name: string;
  label: string;
  options: string[];
  value: string;
}

/** Drop-down that stores its value in the URL so server components can filter on it. */
export function QuerySelect({ name, label, options, value }: QuerySelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, next);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
        className="h-[45px] cursor-pointer appearance-none rounded-[4px] border border-[#d4d4d8] bg-white pr-9 pl-5 text-sm font-bold text-[#09090b] outline-none focus-visible:border-[#09090b] disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3" width={14} height={14} />
    </label>
  );
}
