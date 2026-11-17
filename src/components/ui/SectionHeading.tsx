import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { LiveDot } from "./LiveDot";
import { ViewAllLink } from "./ViewAllLink";

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  /** Renders the "View all →" style button on the right. */
  action?: { href: string; label: string };
  live?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
  className?: string;
}

/** Yellow-barred section title with optional subtitle and action button. */
export function SectionHeading({
  id,
  title,
  description,
  action,
  live,
  titleClassName,
  descriptionClassName,
  children,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-6 w-1.5 shrink-0 rounded-full bg-gold" />
          <h2
            id={id}
            className={cn(
              "text-[22px] leading-[26px] font-bold tracking-[-1px] text-coal uppercase sm:text-[26px]",
              titleClassName,
            )}
          >
            {title}
          </h2>
          {live && <LiveDot />}
        </div>
        {description && (
          <p className={cn("text-sm leading-5 text-muted", descriptionClassName)}>{description}</p>
        )}
      </div>
      {children}
      {action && <ViewAllLink href={action.href}>{action.label}</ViewAllLink>}
    </div>
  );
}
