import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ViewAllLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** White bordered button-style link ending in an arrow ("View all →"). */
export function ViewAllLink({ href, children, className }: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-white px-3 py-2 text-[13px] leading-[19.5px] font-semibold text-ink transition-colors hover:border-ink",
        className,
      )}
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
