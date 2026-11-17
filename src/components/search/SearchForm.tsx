import Image from "next/image";

import type { SearchType } from "@/lib/api/types";

interface SearchFormProps {
  query: string;
  type: SearchType;
}

/** Large underlined search field. A plain GET form, so it works before any JavaScript loads. */
export function SearchForm({ query, type }: SearchFormProps) {
  return (
    <form
      action="/search"
      role="search"
      className="flex h-16 items-center border-b-2 border-black transition-colors focus-within:border-gold sm:h-20 lg:h-[93px]"
    >
      <label htmlFor="site-search" className="sr-only">
        Search TMN Sports
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Search news, players, teams…"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent py-4 text-[26px] leading-8 font-black tracking-[0.35px] text-[#09090b] outline-none placeholder:text-[#09090b]/50 sm:text-4xl sm:leading-10 lg:text-5xl lg:leading-[48px]"
      />
      {type !== "all" && <input type="hidden" name="type" value={type} />}
      <button
        type="submit"
        aria-label="Search"
        className="ml-3 flex shrink-0 items-center justify-center rounded-[4px] p-1 transition-opacity hover:opacity-70"
      >
        <Image
          src="/images/icons/search.svg"
          alt=""
          width={31}
          height={32}
          style={{ height: "auto" }}
          className="w-6 sm:w-8"
        />
      </button>
    </form>
  );
}
