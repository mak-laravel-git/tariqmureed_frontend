import type { CompetitionRef, Match, Matchday, MatchdayView, TeamSummary } from "@/lib/api/types";

const DAY = 24 * 60 * 60 * 1000;

const bangladesh: TeamSummary = {
  id: 15,
  slug: "bangladesh",
  name: "Bangladesh",
  shortName: "BAN",
  colors: { from: "rgb(0, 130, 86)", to: "rgb(0, 100, 66)" },
};

const sriLanka: TeamSummary = {
  id: 18,
  slug: "sri-lanka",
  name: "Sri Lanka",
  shortName: "SL",
  colors: { from: "rgb(30, 52, 160)", to: "rgb(24, 40, 130)" },
};

const championsTrophy: CompetitionRef = {
  slug: "icc-champions-trophy",
  name: "ICC Champions Trophy",
  format: "ODI",
  category: "International",
};

const bpl: CompetitionRef = {
  slug: "bangladesh-premier-league",
  name: "Bangladesh Premier League",
  format: "T20",
  category: "Domestic",
};

/** Start of today (UTC midnight) plus an offset in days and an hour of day. */
function at(dayOffset: number, hour: number): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return new Date(today.getTime() + dayOffset * DAY + (hour - 6) * 60 * 60 * 1000).toISOString();
}

function fixture(competition: CompetitionRef, stage: string, city: string, state: Match["state"], dayOffset: number, hour = 15): Match {
  const number = Number(stage.replace(/\D+/g, ""));
  const done = state === "result";
  const inPlay = state === "live";

  return {
    id: `${competition.slug}-${number}`,
    slug: `${competition.slug}-match-${number}`,
    competition,
    stage,
    city,
    state,
    home: {
      team: bangladesh,
      score: inPlay || done ? "248/6" : null,
      overs: inPlay ? "43.2" : null,
      isBatting: inPlay,
    },
    away: {
      team: sriLanka,
      score: done ? "251/4" : null,
      note: inPlay ? null : null,
    },
    statusText: done
      ? "Sri Lanka won by 6 wickets"
      : inPlay
        ? "Bangladesh chose to bat · Updated now"
        : null,
    isToday: dayOffset === 0 && !done && !inPlay,
    venue: `${city} Stadium`,
    startsAt: at(dayOffset, hour),
  };
}

function group(competition: CompetitionRef, matches: Match[]) {
  return { competition, matches };
}

export const mockCompetitionFilter: CompetitionRef[] = [championsTrophy, bpl];

/** Builds the fixture list shown for a Live Scores tab or Schedule range. */
export function buildMockMatchday(view: MatchdayView): Matchday {
  const date = at(0, 6);

  switch (view) {
    case "upcoming":
    case "tomorrow":
      return {
        date,
        competitions: mockCompetitionFilter,
        groups: [
          group(championsTrophy, [
            fixture(championsTrophy, "Match 13", "Lahore", "upcoming", 1),
            fixture(championsTrophy, "Match 14", "Karachi", "upcoming", 1, 19),
            fixture(championsTrophy, "Match 15", "Lahore", "upcoming", 2),
          ]),
          group(bpl, [
            fixture(bpl, "Match 8", "Dhaka", "upcoming", 1),
            fixture(bpl, "Match 9", "Chattogram", "upcoming", 2),
          ]),
        ],
      };

    case "result":
    case "yesterday":
      return {
        date,
        competitions: mockCompetitionFilter,
        groups: [
          group(championsTrophy, [
            fixture(championsTrophy, "Match 10", "Lahore", "result", -1),
            fixture(championsTrophy, "Match 11", "Karachi", "result", -1, 19),
          ]),
          group(bpl, [fixture(bpl, "Match 6", "Dhaka", "result", -1)]),
        ],
      };

    case "week":
      return {
        date,
        competitions: mockCompetitionFilter,
        groups: [
          group(championsTrophy, [
            fixture(championsTrophy, "Match 12", "Lahore", "upcoming", 0),
            fixture(championsTrophy, "Match 13", "Lahore", "upcoming", 1),
            fixture(championsTrophy, "Match 14", "Karachi", "upcoming", 3),
          ]),
          group(bpl, [
            fixture(bpl, "Match 7", "Dhaka", "upcoming", 0),
            fixture(bpl, "Match 8", "Dhaka", "upcoming", 4),
          ]),
        ],
      };

    default:
      return {
        date,
        competitions: mockCompetitionFilter,
        groups: [
          group(championsTrophy, [
            fixture(championsTrophy, "Match 12", "Lahore", view === "live" ? "live" : "upcoming", 0),
            fixture(championsTrophy, "Match 13", "Lahore", "upcoming", 0, 19),
            fixture(championsTrophy, "Match 14", "Karachi", "upcoming", 0, 21),
          ]),
          group(bpl, [
            fixture(bpl, "Match 7", "Dhaka", "upcoming", 0),
            fixture(bpl, "Match 8", "Chattogram", "upcoming", 0, 19),
          ]),
        ],
      };
  }
}
