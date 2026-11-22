import Image from "next/image";
import Link from "next/link";

import { PrivacySettingsButton } from "@/components/consent/PrivacySettingsButton";
import { TikTokIcon } from "@/components/ui/icons";
import { footerColumns, legalLinks, socialLinks } from "@/lib/site";

/** Centered 1320px column with 32px side padding, matching the footer grid in the design. */
const footerInner = "mx-auto w-full max-w-site px-4 sm:px-6 xl:px-8";

/** "View all" links shown at the end of a footer column, keyed by column title. */
const allLinks: Record<string, { href: string; label: string }> = {
  Series: { href: "/series", label: "All series →" },
  Teams: { href: "/teams", label: "All Teams →" },
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-tuna bg-ink text-white">
      <div className="border-t border-tuna pt-8">
        <div className={`${footerInner} py-12`}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-12 lg:gap-10">
            <div className="col-span-2 flex max-w-[392px] flex-col gap-5 sm:col-span-4 lg:col-span-4">
              <Link href="/" aria-label="TMN Sport home">
                <Image
                  src="/images/brand/logo-white.png"
                  alt="TMN Sport"
                  width={374}
                  height={45}
                  className="h-[45px] w-[374px] max-w-full object-contain object-left"
                />
              </Link>

              <p className="max-w-[384px] text-[13.5px] leading-[21.94px] text-white/55">
                TMN Sport is an independent cricket media house delivering live scores, news, analysis,
                statistics and video from every major international and franchise competition.
              </p>

              <ul className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="flex size-9 items-center justify-center rounded-lg border border-tuna text-base leading-6 text-white/60 transition-colors hover:border-gold hover:text-gold"
                    >
                      {link.label === "TikTok" ? <TikTokIcon /> : link.label.startsWith("X") ? "𝕏" : link.glyph}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {footerColumns.map((column) => {
              const compact = column.title === "Teams";
              const allLink = allLinks[column.title];

              return (
                <nav key={column.title} aria-label={column.title} className="lg:col-span-2">
                  <h2 className="mb-3 text-[11px] leading-[16.5px] font-bold tracking-[1.98px] text-gold uppercase">
                    {column.title}
                  </h2>
                  <ul className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
                    {column.links.map((link) => (
                      <li key={link.href + link.label} className={compact ? "pt-[3px] pb-px" : "pt-[2.5px] pb-[0.5px]"}>
                        <Link
                          href={link.href}
                          className={`block text-white/65 transition-colors hover:text-white ${
                            compact ? "text-[13px] leading-[19.5px]" : "text-[13.5px] leading-[20.25px]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {allLink && (
                      <li className={compact ? "pt-[3px] pb-px" : "pt-[2.5px] pb-[0.5px]"}>
                        <Link href={allLink.href} className="block text-[13.5px] leading-[20.25px] font-semibold text-gold">
                          {allLink.label}
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-tuna">
        <div className={`${footerInner} flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="text-xs leading-[18px] text-white/40">© 2026 TMN Sport. All rights reserved.</p>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs leading-[18px] text-white/45 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <PrivacySettingsButton className="cursor-pointer text-xs leading-[18px] text-white/45 transition-colors hover:text-white" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
