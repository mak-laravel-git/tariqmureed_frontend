"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/site";

import { LiveDot } from "@/components/ui/LiveDot";

interface NavLinksProps {
  items: NavItem[];
  /** Stacked layout used inside the mobile menu. */
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, orientation = "horizontal", onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        "flex gap-0.5",
        orientation === "horizontal" ? "items-center" : "flex-col items-stretch",
      )}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-start gap-1.5 rounded-[6px] px-2.5 py-[7.5px] text-[13.5px] leading-[20.25px] font-bold tracking-[0.338px] uppercase transition-colors",
                active ? "text-ink" : "text-charade hover:text-ink",
              )}
            >
              {item.label}
              {item.live && <LiveDot size={6} className="mt-[8.8px]" />}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 -bottom-px left-2.5 h-[3px] rounded-full bg-coal"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
