import type { TeamSummary } from "@/lib/api/types";
import { flagUrl, teamCountryCode } from "@/lib/countries";

interface TeamBadgeProps {
  team: Pick<TeamSummary, "shortName" | "colors" | "name">;
  /** Diameter in px (design uses 38 for score cards, 48 for the team profile). */
  size?: number;
}

/**
 * Circular team crest. A national team shows its country's flag; a club or franchise (no flag) is drawn from
 * its team colours and short code.
 */
export function TeamBadge({ team, size = 38 }: TeamBadgeProps) {
  const flag = teamCountryCode(team.name);

  if (flag) {
    const [single, double] = size >= 64 ? ([160, 160] as const) : size >= 40 ? ([80, 160] as const) : ([40, 80] as const);

    return (
      <span
        role="img"
        aria-label={team.name}
        className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-surface shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny flag from the flag CDN */}
        <img
          src={flagUrl(flag, single)}
          srcSet={`${flagUrl(flag, single)} 1x, ${flagUrl(flag, double)} 2x`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className="size-full object-cover"
        />
      </span>
    );
  }

  const fontSize = size >= 64 ? 12 : size >= 48 ? 14 : Math.round(size * 0.34 * 10) / 10;

  return (
    <span
      role="img"
      aria-label={team.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset] ${size >= 64 ? "font-black" : "font-bold"}`}
      style={{
        width: size,
        height: size,
        fontSize,
        letterSpacing: size * 0.0085,
        backgroundImage: `linear-gradient(145deg, ${team.colors.from} 0%, ${team.colors.to} 100%)`,
      }}
    >
      {team.shortName}
    </span>
  );
}
