import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LiveDot } from "@/components/ui/LiveDot";
import { mainNav } from "@/lib/site";

import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

/** Sticky yellow main navigation bar. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-brand backdrop-blur-[8px]">
      <div className="relative mx-auto flex h-[68px] w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6 xl:px-0">
        <Link href="/" aria-label="TMN Sport home" className="shrink-0">
          <Image
            src="/images/brand/logo.png"
            alt="TMN Sport"
            width={163}
            height={54}
            priority
            className="h-[34px] w-[103px] object-contain sm:h-[45px] sm:w-[136px] lg:h-[50px] lg:w-[150px] xl:h-[54px] xl:w-[163px]"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden pl-4 lg:block xl:pl-6">
          <Suspense fallback={<div className="h-[37px] w-[743px]" />}>
            <NavLinks items={mainNav} />
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-[4px] border border-ink text-lg leading-7 text-charade transition-colors hover:bg-ink hover:text-brand"
          >
            <span aria-hidden="true">⌕</span>
          </Link>

          <Link
            href="/live-scores"
            className="flex h-[39.5px] items-center gap-2 rounded-[4px] bg-ink px-3.5 text-[13px] leading-[19.5px] font-bold text-white transition-colors hover:bg-coal"
          >
            <LiveDot size={8} />
            Live
          </Link>

          <MobileNav items={mainNav} />
        </div>
      </div>
    </header>
  );
}
