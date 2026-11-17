import type { TeamProfile, TeamSummary } from "@/lib/api/types";

function team(id: number, slug: string, name: string, shortName: string, from: string, to: string): TeamSummary {
  return { id, slug, name, shortName, colors: { from, to } };
}

/** Franchise and national teams referenced by the mock fixtures. */
export const mockTeams = {
  mi: team(1, "mumbai-indians", "Mumbai Indians", "MI", "rgb(10, 76, 156)", "rgb(7, 59, 122)"),
  csk: team(2, "chennai-super-kings", "Chennai Super Kings", "CSK", "rgb(200, 168, 2)", "rgb(143, 118, 0)"),
  lq: team(3, "lahore-qalandars", "Lahore Qalandars", "LQ", "rgb(15, 138, 75)", "rgb(10, 101, 53)"),
  iu: team(4, "islamabad-united", "Islamabad United", "IU", "rgb(216, 75, 18)", "rgb(162, 52, 7)"),
  rr: team(5, "rangpur-riders", "Rangpur Riders", "RR", "rgb(14, 111, 184)", "rgb(10, 82, 137)"),
  fb: team(6, "fortune-barishal", "Fortune Barishal", "FB", "rgb(123, 31, 162)", "rgb(91, 21, 120)"),
  kk: team(7, "karachi-kings", "Karachi Kings", "KK", "rgb(30, 52, 160)", "rgb(20, 34, 112)"),
  pz: team(8, "peshawar-zalmi", "Peshawar Zalmi", "PZ", "rgb(190, 160, 12)", "rgb(138, 112, 0)"),
} satisfies Record<string, TeamSummary>;

export const mockNations = {
  india: team(11, "india", "India", "IND", "rgb(26, 86, 219)", "rgb(11, 63, 168)"),
  australia: team(12, "australia", "Australia", "AUS", "rgb(232, 178, 0)", "rgb(160, 120, 0)"),
  england: team(13, "england", "England", "ENG", "rgb(190, 30, 50)", "rgb(130, 18, 34)"),
  pakistan: team(14, "pakistan", "Pakistan", "PAK", "rgb(14, 120, 78)", "rgb(8, 84, 52)"),
  bangladesh: team(15, "bangladesh", "Bangladesh", "BAN", "rgb(0, 130, 86)", "rgb(0, 92, 60)"),
  newZealand: team(16, "new-zealand", "New Zealand", "NZ", "rgb(54, 56, 60)", "rgb(17, 17, 17)"),
  southAfrica: team(17, "south-africa", "South Africa", "SA", "rgb(16, 104, 50)", "rgb(10, 72, 34)"),
  sriLanka: team(18, "sri-lanka", "Sri Lanka", "SL", "rgb(14, 92, 164)", "rgb(8, 64, 122)"),
  afghanistan: team(19, "afghanistan", "Afghanistan", "AFG", "rgb(30, 60, 180)", "rgb(20, 40, 130)"),
  westIndies: team(20, "west-indies", "West Indies", "WI", "rgb(120, 30, 70)", "rgb(84, 18, 48)"),
} satisfies Record<string, TeamSummary>;

export const mockTeamList: TeamSummary[] = [
  mockNations.india,
  mockNations.australia,
  mockNations.england,
  mockNations.pakistan,
  mockNations.bangladesh,
  mockNations.newZealand,
  mockNations.southAfrica,
  mockNations.sriLanka,
  mockNations.afghanistan,
  mockNations.westIndies,
];

export const mockTeamProfiles: Record<string, Omit<TeamProfile, keyof TeamSummary>> = {
  india: {
    membership: "ICC Full Member",
    captain: "Rohit Sharma",
    coach: "Gautam Gambhir",
    homeGround: "Wankhede Stadium, Mumbai",
    titles: "2× World Cup · 2× Champions Trophy",
  },
};

export const emptyTeamProfile: Omit<TeamProfile, keyof TeamSummary> = {
  membership: "—",
  captain: "—",
  coach: "—",
  homeGround: "—",
  titles: "—",
};
