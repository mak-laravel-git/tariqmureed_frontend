import Link from "next/link";

import { cn } from "@/lib/cn";

import { Container } from "./Container";

export interface UnderlineTab {
  label: string;
  href: string;
  active: boolean;
}

/** White tab strip with a gold underline on the active tab; scrolls sideways on small screens. */
export function UnderlineTabs({ tabs, label }: { tabs: UnderlineTab[]; label: string }) {
  return (
    <div className="border-b border-[#e4e4e7] bg-white">
      <Container>
        <nav
          aria-label={label}
          className="-mx-1 flex h-[60px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              scroll={false}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "relative flex items-center px-5 text-xs leading-4 font-black tracking-[0.6px] whitespace-nowrap uppercase transition-colors",
                tab.active ? "text-black" : "text-[#9f9fa9] hover:text-ink",
              )}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-1",
                  tab.active ? "bg-[#fdc700]" : "bg-transparent",
                )}
              />
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
}
