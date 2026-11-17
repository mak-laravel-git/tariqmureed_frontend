import type { TeamSummary } from "@/lib/api/types";

interface TeamBadgeProps {
  team: Pick<TeamSummary, "shortName" | "colors" | "name">;
  /** Diameter in px (design uses 38 for score cards, 48 for the team profile). */
  size?: number;
}

/** Circular team crest drawn from the team colours and short code. */
export function TeamBadge({ team, size = 38 }: TeamBadgeProps) {
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
