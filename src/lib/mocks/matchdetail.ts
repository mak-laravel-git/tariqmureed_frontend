import type { MatchDetail, SquadList } from "@/lib/api/types";

import { buildMockMatchday } from "./matchday";
import { mockAllMatches } from "./matches";
import { buildMockNewsPage } from "./news";

const ordinal = (n: number) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
};

const XI = [
  "T. Iqbal",
  "N. Shanto (c)",
  "L. Das (wk)",
  "M. Rahim",
  "T. Hridoy",
  "M. Miraz",
  "T. Sakib",
  "T. Ahmed",
  "M. Rahman",
  "S. Islam",
  "R. Hossain",
];

/** Full match centre payload for a fixture; unknown slugs resolve to null. */
export function buildMockMatchDetail(slug: string): MatchDetail | null {
  // The live view comes first so an in-play fixture wins over its scheduled twin.
  const base = buildMockMatchday("live")
    .groups.flatMap((group) => group.matches)
    .concat(buildMockMatchday("week").groups.flatMap((group) => group.matches))
    // Home page cards link to the featured fixtures, which are not part of the matchday lists.
    .concat(mockAllMatches)
    .find((match) => match.slug === slug);

  if (!base) {
    return null;
  }

  const number = typeof base.id === "string" ? Number(base.id.split("-").pop()) : Number.NaN;
  const live = base.state === "live";
  const squads: SquadList[] = [
    { team: base.home.team, players: XI },
    { team: base.away.team, players: XI },
  ];

  return {
    ...base,
    title: `${base.home.team.name} vs ${base.away.team.name}`,
    subtitle: Number.isFinite(number)
      ? `${ordinal(number)} Match · ${base.venue ?? ""}`.replace(/ · $/, "")
      : (base.venue ?? base.competition.name),
    tossNote: live ? "Bangladesh chose to bat first" : null,
    updatedAt: new Date().toISOString(),
    overview: {
      currentRunRate: live ? "5.72" : null,
      projectedScore: live ? "296" : null,
      partnership: live ? "62 (48)" : null,
      atCrease: live
        ? [
            { name: "Shanto", runs: 78, balls: 92 },
            { name: "Miraz", runs: 34, balls: 29 },
          ]
        : [],
    },
    innings: live
      ? [
          {
            team: "Bangladesh",
            rows: [
              { batter: "T. Iqbal", dismissal: "c Perera b Fernando", runs: 42, balls: 48, fours: 5, sixes: 1, strikeRate: "87.50" },
              { batter: "N. Shanto", dismissal: "not out", runs: 78, balls: 92, fours: 6, sixes: 2, strikeRate: "84.78" },
              { batter: "M. Rahim", dismissal: "lbw b Hasaranga", runs: 31, balls: 27, fours: 4, sixes: 0, strikeRate: "114.81" },
              { batter: "M. Miraz", dismissal: "not out", runs: 34, balls: 29, fours: 2, sixes: 1, strikeRate: "117.24" },
            ],
          },
        ]
      : [],
    commentary: live
      ? [
          { over: "43.2", outcome: "1", text: "Fernando to Miraz, worked into the leg side for a single." },
          { over: "43.1", outcome: "4", text: "Fernando to Miraz, width offered and driven firmly through cover." },
          { over: "42.6", outcome: "•", text: "Hasaranga to Shanto, defended carefully back to the bowler." },
        ]
      : [],
    squads,
    stats: live
      ? [
          { label: "Boundaries", home: "29", away: null },
          { label: "Dot ball percentage", home: "47%", away: null },
          { label: "Highest partnership", home: "84", away: null },
        ]
      : [],
    relatedNews: buildMockNewsPage(undefined, 3).articles,
  };
}
