import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Large section title with a hairline underneath (e.g. "Tournament overview"). */
export function PanelHeading({
  children,
  eyebrow,
  as: Tag = "h2",
  className,
}: {
  children: ReactNode;
  eyebrow?: string;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line pb-5", className)}>
      {eyebrow && (
        <p className="text-[10px] leading-[15px] font-bold tracking-[0.2em] text-[#b38600] uppercase">{eyebrow}</p>
      )}
      <Tag className="text-[28px] leading-9 font-bold tracking-[-0.02em] text-ink md:text-4xl md:leading-[44px]">
        {children}
      </Tag>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 rounded-[4px] border border-line bg-white px-5 py-12 text-center text-sm text-muted">{children}</p>
  );
}
