import { getPublicSettings } from "@/lib/api/endpoints";
import { visibleSocialLinks, type SocialKey } from "@/lib/site";

import { TodayDate } from "./TodayDate";

/** The icons the narrow bar has room for. */
const topBarKeys: SocialKey[] = ["socialX", "socialFacebook", "socialInstagram", "socialYoutube"];

/** Dark utility bar above the header: date and social links. */
export async function TopBar() {
  const links = visibleSocialLinks(await getPublicSettings()).filter((link) => topBarKeys.includes(link.key));

  return (
    <div className="border-b border-tuna bg-ink">
      <div className="mx-auto flex h-9 w-full max-w-site items-center justify-between gap-6 px-4 sm:px-6 xl:px-8">
        <TodayDate className="text-xs leading-[18px] text-white/50" />

        {links.length > 0 && (
          <nav aria-label="TMN Sport social media" className="flex items-center gap-5">
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:block" />
            <ul className="flex items-center gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-xs leading-[18px] text-white/50 transition-colors hover:text-white"
                  >
                    {link.label === "Instagram" ? "in" : link.glyph}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
