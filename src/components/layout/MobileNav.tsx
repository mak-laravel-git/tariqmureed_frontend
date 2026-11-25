"use client";

import { Suspense, useState } from "react";

import type { NavItem } from "@/lib/site";

import { NavLinks } from "./NavLinks";

/** Hamburger button and drop-down panel for viewports below the lg breakpoint. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-[4px] border border-ink xl:hidden"
      >
        <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
          <span
            className={`h-0.5 bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span className={`h-0.5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-t border-ink/10 bg-brand px-4 py-3 shadow-lg xl:hidden"
        >
          <Suspense fallback={null}>
            <NavLinks items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
    </>
  );
}
