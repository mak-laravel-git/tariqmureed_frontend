import Link from "next/link";
import type { ReactNode } from "react";

import { getTicker } from "@/lib/api/endpoints";

function TickerEntry({ children, href }: { children: ReactNode; href?: string | null }) {
  const content = (
    <>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#fffbea]/60" />
      <span>{children}</span>
    </>
  );

  const className = "flex items-center gap-2 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap text-line";

  return href ? (
    <Link href={href} className={`${className} hover:text-white`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** Dark news alert bar; entries scroll horizontally and pause on hover. */
export async function AlertTicker() {
  const items = await getTicker();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="ticker flex bg-coal">
      <div className="relative z-10 flex shrink-0 items-center bg-gold px-4">
        <span className="font-display text-[13px] leading-[19.5px] font-bold tracking-[0.13px] text-coal uppercase">
          Alert
        </span>
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="ticker-track flex w-max py-2.5">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex shrink-0 items-center gap-8 pr-8"
            >
              {items.map((item) => (
                <li key={item.id}>
                  <TickerEntry href={item.href}>{item.text}</TickerEntry>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-gold to-transparent"
        />
      </div>
    </div>
  );
}

export function AlertTickerFallback() {
  return <div aria-hidden="true" className="h-10 bg-coal" />;
}
