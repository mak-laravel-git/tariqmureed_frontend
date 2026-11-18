import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/** The Statistics and Records pages share one frame; the two designs differ only in small details. */
export type CentreVariant = "stats" | "records";

const variants = {
  stats: {
    eyebrow: "text-[#f59e0b]",
    badge: "rounded-xl border-[rgba(226,232,240,0.8)] bg-[#f8fafc] px-[21px] py-3",
    badgePrimary: "text-sm leading-[19px] font-bold text-[#1e293b]",
    badgeSecondary: "text-xs leading-4 text-[#94a3b8]",
    filters: "gap-4 border-b border-[#f1f5f9] pt-1 pb-[25px]",
    label: "w-16",
    buttonOn: "bg-[#0f172a] px-4 py-1.5 font-bold",
    buttonOff: "px-[17px] py-[7px] font-normal text-[#475569]",
  },
  records: {
    eyebrow: "text-[#64748b]",
    badge: "rounded-lg border-[#e2e8f0] bg-[#f8fafc]/60 px-[17px] py-[9px]",
    badgePrimary: "text-[13px] leading-[16px] font-bold text-[#0f172a]",
    badgeSecondary: "text-[11px] leading-[14px] text-[#94a3b8]",
    filters: "gap-3 border-y border-[#f1f5f9] py-[15px]",
    label: "w-28",
    buttonOn: "bg-[#020617] px-3.5 py-1 font-medium",
    buttonOff: "px-[15px] py-[5px] font-medium text-[#475569]",
  },
} satisfies Record<CentreVariant, Record<string, string>>;

interface CentreLayoutProps {
  variant: CentreVariant;
  crumb: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Count and active filters shown top right, e.g. ["8 metrics", "player · All"]. */
  badge: [primary: string, secondary: string];
  filters: ReactNode;
  main: ReactNode;
  aside: ReactNode;
}

export function CentreLayout({ variant, crumb, eyebrow, title, description, badge, filters, main, aside }: CentreLayoutProps) {
  const style = variants[variant];

  return (
    <Container className="flex flex-col gap-5 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-xs leading-4">
        <ol className="flex items-center">
          <li>
            <Link href="/" className="text-[#94a3b8] hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="px-1.5 text-[#cbd5e1]">
            /
          </li>
          <li aria-current="page" className="font-bold text-[#0f172a]">
            {crumb}
          </li>
        </ol>
      </nav>

      <header className={cn("flex items-start justify-between gap-4", variant === "stats" && "border-b border-[#f1f5f9] pb-[25px]")}>
        <div className="min-w-0">
          <p className={cn("flex items-center gap-1.5 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] uppercase", style.eyebrow)}>
            <span aria-hidden="true" className="h-3 w-[3px] rounded-[1px] bg-[#f59e0b]" />
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-5xl leading-[1.05] font-extrabold text-[#0f172a] sm:text-[60px]">{title}</h1>
          <p className="mt-4 max-w-[672px] text-[13px] leading-[19.5px] text-[#64748b]">{description}</p>
        </div>

        <div className={cn("hidden min-w-[90px] shrink-0 flex-col items-end border sm:flex", style.badge)}>
          <p className={style.badgePrimary}>{badge[0]}</p>
          <p className={style.badgeSecondary}>{badge[1]}</p>
        </div>
      </header>

      <div className={cn("flex flex-col", style.filters)}>{filters}</div>

      <div className="grid grid-cols-1 gap-8 pt-5 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">{main}</div>
        <aside aria-label="Sidebar" className="flex flex-col gap-6 lg:col-span-4 lg:self-start">
          {aside}
        </aside>
      </div>
    </Container>
  );
}

interface FilterRowProps {
  variant: CentreVariant;
  label: string;
  items: { label: string; href: string; active: boolean }[];
}

/** One labelled row of server-rendered filter links. */
export function FilterRow({ variant, label, items }: FilterRowProps) {
  const style = variants[variant];

  return (
    <div className={cn("flex flex-wrap items-center", variant === "stats" ? "gap-3" : "gap-2.5")}>
      <p className={cn("text-[11px] leading-[16.5px] font-bold tracking-[0.55px] uppercase", style.label, variant === "stats" ? "text-[#94a3b8]" : "text-[#64748b]")}>
        {label}
      </p>
      <div className={cn("flex flex-wrap items-center", variant === "stats" ? "gap-2" : "gap-1.5")}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            scroll={false}
            aria-current={item.active ? "true" : undefined}
            className={cn(
              "rounded-[4px] text-xs transition-colors",
              variant === "stats" ? "leading-4" : "leading-[18px]",
              item.active
                ? cn("text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]", style.buttonOn)
                : cn("border border-[#e2e8f0] bg-white hover:border-[#0f172a] hover:text-[#0f172a]", style.buttonOff),
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** 300 x 250 sidebar placeholder; the box keeps its size when no campaign is scheduled. */
export function SidebarAd({ variant }: { variant: CentreVariant }) {
  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center",
        variant === "stats" ? "border-[#e2e8f0] bg-[#f8fafc]/80" : "border-[#cbd5e1] bg-[#f8fafc]/50",
      )}
    >
      <p className="text-[10px] leading-[15px] font-bold tracking-[1px] text-[#94a3b8] uppercase">Advertisement · 300 × 250</p>
      <p className="mt-1 text-xs leading-4 text-[#475569]">Sidebar rectangle</p>
      <p className="mt-2 max-w-[220px] text-[11px] leading-[17.88px] text-[#94a3b8]">
        No campaign scheduled for this slot. The layout holds its dimensions and never reflows.
      </p>
    </aside>
  );
}
