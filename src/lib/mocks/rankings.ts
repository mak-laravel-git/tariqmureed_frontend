import type { RankingsData, TeamRankingRow } from "@/lib/api/types";
import { mockNations } from "@/lib/mocks/teams";

/** [team, matches, rating] in table order; points follow from matches and rating. */
function table(entries: [keyof typeof mockNations, number, number][]): TeamRankingRow[] {
  return entries.map(([key, matches, rating], index) => ({
    position: index + 1,
    team: mockNations[key],
    matches,
    points: matches * rating,
    rating,
  }));
}

/** Sample table shown until the first real ranking sync has run. */
export function buildMockRankings(): RankingsData {
  return {
    formats: [
      { key: "TEST", label: "Test" },
      { key: "ODI", label: "ODI" },
      { key: "T20I", label: "T20I" },
    ],
    updatedAt: null,
    tables: {
      men: {
        TEST: table([["australia", 31, 126], ["india", 33, 112], ["england", 38, 108], ["southAfrica", 26, 99], ["newZealand", 28, 96], ["sriLanka", 25, 84], ["pakistan", 24, 78], ["bangladesh", 22, 66]]),
        ODI: table([["india", 41, 122], ["australia", 36, 117], ["southAfrica", 32, 109], ["pakistan", 35, 101], ["newZealand", 33, 99], ["england", 34, 96], ["sriLanka", 38, 92], ["bangladesh", 36, 86]]),
        T20I: table([["india", 58, 266], ["england", 42, 255], ["australia", 40, 251], ["pakistan", 47, 242], ["newZealand", 44, 238], ["southAfrica", 39, 236], ["sriLanka", 46, 226], ["bangladesh", 43, 219]]),
      },
    },
  };
}
