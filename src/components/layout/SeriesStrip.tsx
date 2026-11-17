import Link from "next/link";

import { getFeaturedSeries } from "@/lib/api/endpoints";

/** Quick links to the featured competitions, shown beneath the main navigation. */
export async function SeriesStrip() {
  const series = await getFeaturedSeries();

  return (
    <div className="border-t border-line bg-surface/70">
      <div className="mx-auto flex w-full max-w-site [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 xl:px-8 [&::-webkit-scrollbar]:hidden">
        <span className="pr-1 text-[10.5px] leading-[15.75px] font-bold tracking-[1.89px] whitespace-nowrap text-muted uppercase">
          Series
        </span>

        {series.map((item) => (
          <Link
            key={item.slug}
            href={`/series/${item.slug}`}
            className="rounded-[4px] border border-line bg-white px-3 py-1 text-[12.5px] leading-[18.75px] font-bold whitespace-nowrap text-charade transition-colors hover:border-ink"
          >
            {item.name}
          </Link>
        ))}

        <Link
          href="/series"
          className="ml-auto pl-3 text-[12.5px] leading-[18.75px] font-bold whitespace-nowrap text-ink hover:underline"
        >
          All series →
        </Link>
      </div>
    </div>
  );
}

export function SeriesStripFallback() {
  return <div aria-hidden="true" className="h-[46px] border-t border-line bg-surface/70" />;
}
