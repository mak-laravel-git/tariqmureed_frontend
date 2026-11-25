import Link from "next/link";

import { cn } from "@/lib/cn";

export interface FilterTab {
  label: string;
  href: string;
  active: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  label: string;
  className?: string;
}

/** Row of pill links used as server-rendered filters (the active filter lives in the URL). */
export function FilterTabs({ tabs, label, className }: FilterTabsProps) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          replace
          scroll={false}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "flex h-[34px] items-center rounded-[4px] px-4 text-xs leading-4 font-black tracking-[0.6px] uppercase transition-colors",
            tab.active
              ? "bg-[#09090b] text-white"
              : "border border-[#e4e4e7] bg-white text-[#71717b] hover:border-ink hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
