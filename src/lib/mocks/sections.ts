import type {
  Directory,
  DirectoryItem,
  LegalPage,
  PlayerPage,
  TeamPage,
  TournamentDetail,
  Video,
  VideosPage,
} from "@/lib/api/types";

import { mockTrendingPlayers } from "./content";
import { buildMockMatchday } from "./matchday";
import { buildMockNewsPage } from "./news";

const GREEN = { from: "rgb(0, 130, 86)", to: "rgb(0, 100, 66)" };
const NAVY = { from: "rgb(30, 52, 160)", to: "rgb(24, 40, 130)" };

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function item(name: string, badge: string, group: string, status: string, description: string, colors = GREEN): DirectoryItem {
  return { slug: slugify(name), name, badge, colors, status, description, group };
}

const SERIES_DESCRIPTION = "Fixtures, results, table and statistics";

export const mockSeriesDirectory: Directory = {
  groups: [
    { slug: "current", name: "Current" },
    { slug: "upcoming", name: "Upcoming" },
    { slug: "completed", name: "Completed" },
  ],
  items: [
    item("ICC Champions Trophy", "TMN", "current", "In progress", SERIES_DESCRIPTION),
    item("Bangladesh Premier League", "TMN", "current", "In progress", SERIES_DESCRIPTION, NAVY),
    item("Asia Cup", "TMN", "current", "Upcoming", SERIES_DESCRIPTION),
    item("The Ashes", "TMN", "current", "Upcoming", SERIES_DESCRIPTION, NAVY),
    item("ICC World Cup", "TMN", "current", "Upcoming", SERIES_DESCRIPTION),
    item("Indian Premier League", "TMN", "current", "Upcoming", SERIES_DESCRIPTION, NAVY),
    item("Asia Cup", "TMN", "upcoming", "Upcoming", SERIES_DESCRIPTION),
    item("The Ashes", "TMN", "upcoming", "Upcoming", SERIES_DESCRIPTION, NAVY),
    item("ICC World Cup", "TMN", "upcoming", "Upcoming", SERIES_DESCRIPTION),
    item("Indian Premier League", "TMN", "upcoming", "Upcoming", SERIES_DESCRIPTION, NAVY),
    item("T20 World Cup", "TMN", "completed", "Completed", SERIES_DESCRIPTION),
    item("Pakistan Super League", "TMN", "completed", "Completed", SERIES_DESCRIPTION, NAVY),
  ],
};

const TEAM_DESCRIPTION = "International cricket team";

export const mockTeamsDirectory: Directory = {
  groups: [
    { slug: "international", name: "International" },
    { slug: "domestic", name: "Domestic" },
    { slug: "women", name: "Women" },
  ],
  items: [
    item("Bangladesh", "BAN", "international", "In progress", TEAM_DESCRIPTION),
    item("Sri Lanka", "SL", "international", "In progress", TEAM_DESCRIPTION, NAVY),
    item("Pakistan", "PAK", "international", "Upcoming", TEAM_DESCRIPTION),
    item("India", "IND", "international", "Upcoming", TEAM_DESCRIPTION, NAVY),
    item("South Africa", "SA", "international", "Upcoming", TEAM_DESCRIPTION),
    item("Australia", "AUS", "international", "Upcoming", TEAM_DESCRIPTION, NAVY),
    item("England", "ENG", "international", "Upcoming", TEAM_DESCRIPTION),
    item("New Zealand", "NZ", "international", "Upcoming", TEAM_DESCRIPTION, NAVY),
    item("Rangpur Riders", "RR", "domestic", "In progress", "Domestic cricket team", NAVY),
    item("Fortune Barishal", "FB", "domestic", "In progress", "Domestic cricket team"),
    item("Dhaka Capitals", "DC", "domestic", "Upcoming", "Domestic cricket team", NAVY),
    item("Bangladesh Women", "BAN", "women", "Upcoming", "Women's international team"),
    item("India Women", "IND", "women", "Upcoming", "Women's international team", NAVY),
  ],
};

export function buildMockTournament(slug: string): TournamentDetail | null {
  const entry = mockSeriesDirectory.items.find((candidate) => candidate.slug === slug);

  if (!entry) {
    return null;
  }

  const fixtures = buildMockMatchday("today").groups.flatMap((group) => group.matches);
  const isBpl = slug === "bangladesh-premier-league";

  return {
    slug,
    name: entry.name,
    abbreviation: isBpl ? "BPL" : entry.name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase(),
    status: entry.status,
    dateline: isBpl ? "2 January — 7 February 2026 · Bangladesh" : "Dates to be announced",
    overview: isBpl
      ? "Seven teams compete across three venues for Bangladesh cricket's biggest domestic prize. Follow every fixture, result and table update on TMN Sport."
      : `Follow every fixture, result and table update from ${entry.name} on TMN Sport.`,
    upcoming: fixtures.slice(0, 2),
    matches: fixtures.slice(0, 3),
    pointsTable: [
      { position: 1, team: "Rangpur Riders", played: 8, won: 6, lost: 2, noResult: 0, form: ["W", "W", "L", "W", "W"], points: 12, netRunRate: "+1.284" },
      { position: 2, team: "Fortune Barishal", played: 8, won: 5, lost: 3, noResult: 0, form: ["L", "W", "W", "W", "L"], points: 10, netRunRate: "+0.732" },
      { position: 3, team: "Dhaka Capitals", played: 8, won: 4, lost: 3, noResult: 1, form: ["W", "N", "L", "W", "L"], points: 9, netRunRate: "+0.214" },
      { position: 4, team: "Chattogram Kings", played: 8, won: 3, lost: 5, noResult: 0, form: ["L", "L", "W", "L", "W"], points: 6, netRunRate: "-0.158" },
    ],
    teams: ["Rangpur Riders", "Fortune Barishal", "Dhaka Capitals"],
    stats: [
      { label: "Boundaries", home: "29", away: null },
      { label: "Dot ball percentage", home: "47%", away: null },
      { label: "Highest partnership", home: "84", away: null },
    ],
    news: buildMockNewsPage(undefined, 3).articles,
  };
}

export function buildMockTeamPage(slug: string): TeamPage | null {
  const entry = mockTeamsDirectory.items.find((candidate) => candidate.slug === slug);

  if (!entry) {
    return null;
  }

  const bangladesh = slug === "bangladesh";

  return {
    slug,
    name: entry.name,
    badge: entry.badge,
    colors: entry.colors,
    kind: entry.group === "international" ? "International team" : entry.group === "women" ? "Women's team" : "Domestic team",
    membership: entry.group === "international" ? "Full member · ICC" : "Affiliated side",
    nickname: bangladesh ? "The Tigers" : entry.name,
    ranks: bangladesh
      ? [
          { label: "Test rank", value: "13" },
          { label: "ODI rank", value: "9" },
          { label: "T20I rank", value: "10" },
          { label: "Founded", value: "1986" },
        ]
      : [
          { label: "Test rank", value: "—" },
          { label: "ODI rank", value: "—" },
          { label: "T20I rank", value: "—" },
          { label: "Founded", value: "—" },
        ],
    players: bangladesh
      ? [
          { slug: "najmul-hossain-shanto", name: "Najmul Hossain", role: "Batter", image: "/images/stadiums/galle-pavilion.jpg" },
          { slug: "mehidy-hasan", name: "Mehidy Hasan", role: "All-rounder", image: "/images/stadiums/kajaria-floodlight.jpg" },
          { slug: "taskin-ahmed", name: "Taskin Ahmed", role: "Bowler", image: "/images/stadiums/kajaria-dusk.jpg" },
        ]
      : [],
  };
}

/** Squad members linked from the Bangladesh team page. */
const MOCK_SQUAD_PLAYERS = [
  { slug: "mehidy-hasan", name: "Mehidy Hasan", role: "All-rounder", image: "/images/stadiums/kajaria-floodlight.jpg" },
  { slug: "taskin-ahmed", name: "Taskin Ahmed", role: "Bowler", image: "/images/stadiums/kajaria-dusk.jpg" },
];

export function buildMockPlayerPage(slug: string): PlayerPage | null {
  const trending = mockTrendingPlayers.find((player) => player.slug === slug);

  if (trending) {
    return {
      slug,
      name: trending.name,
      image: trending.image,
      teamAndRole: `${trending.country} · ${trending.role}`,
      facts: [{ label: "Team", value: trending.team }],
      career: [
        {
          format: trending.rankLabel.split(" ")[0] || "ODI",
          matches: trending.matches,
          runs: trending.runs.toLocaleString("en-US"),
          average: trending.average.toFixed(2),
          hundreds: 0,
          highScore: "—",
        },
      ],
      news: buildMockNewsPage(undefined, 3).articles,
    };
  }

  const squadMember = MOCK_SQUAD_PLAYERS.find((player) => player.slug === slug);

  if (squadMember) {
    return {
      slug,
      name: squadMember.name,
      image: squadMember.image,
      teamAndRole: `Bangladesh · ${squadMember.role}`,
      facts: [{ label: "Team", value: "Bangladesh" }],
      career: [{ format: "ODI", matches: 0, runs: "—", average: "—", hundreds: 0, highScore: "—" }],
      news: buildMockNewsPage(undefined, 3).articles,
    };
  }

  if (slug !== "najmul-hossain-shanto") {
    return null;
  }

  return {
    slug,
    name: "Najmul Hossain Shanto",
    image: "/images/players/najmul-hossain-shanto.jpg",
    teamAndRole: "Bangladesh · Batter",
    facts: [
      { label: "Born", value: "25 Aug 1998" },
      { label: "Batting", value: "Left hand" },
    ],
    career: [
      { format: "Test", matches: 37, runs: "2,134", average: "34.41", hundreds: 5, highScore: "163" },
      { format: "ODI", matches: 52, runs: "1,742", average: "39.59", hundreds: 3, highScore: "117" },
      { format: "T20I", matches: 48, runs: "1,021", average: "26.18", hundreds: 0, highScore: "71*" },
    ],
    news: buildMockNewsPage(undefined, 3).articles,
  };
}

function video(id: number, title: string, category: string, minutesAgo: number, image: string, duration: string): Video {
  return {
    id,
    slug: slugify(title),
    title,
    description: null,
    thumbnail: `/images/stadiums/${image}`,
    category,
    duration,
    publishedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    views: "—",
  };
}

export function buildMockVideosPage(category: string | undefined, limit: number): VideosPage {
  const featured = video(1, "Inside the match: every angle from a dramatic final over", "Highlights", 120, "kajaria-dusk.jpg", "8:42");

  const base = [
    video(2, "A new era begins: the tactical shifts shaping modern international cricket", "Analysis", 18, "kajaria-crowd.jpg", "6:10"),
    video(3, "Bangladesh name a balanced squad for the upcoming ODI series", "Interviews", 42, "galle-pavilion.jpg", "4:55"),
    video(4, "Five breakthrough players ready to own the global stage", "Features", 60, "kajaria-floodlight.jpg", "9:20"),
    video(5, "Inside the venues that will host this summer's biggest contests", "Features", 120, "kajaria-dusk.jpg", "7:05"),
  ];
  const all = [...base, ...base.map((entry) => ({ ...entry, id: Number(entry.id) + 10, slug: `${entry.slug}-2` }))];
  const matching = all.filter((entry) => !category || entry.category.toLowerCase() === category.toLowerCase());

  return {
    categories: ["Highlights", "Interviews", "Analysis", "Features"],
    featured: !category || category.toLowerCase() === "highlights" ? featured : null,
    videos: matching.slice(0, limit),
    total: matching.length,
  };
}

/** Real contact details come from Website Settings; the legal page loader fills them in. */
const CONTACT = { email: "", address: "" };

export function buildMockLegalPage(slug: string): LegalPage | null {
  if (slug === "terms-of-use") {
    return {
      slug,
      title: "Terms of Use",
      description: "The terms that apply when you use the TMN Sport public website.",
      contact: CONTACT,
      sections: [
        {
          heading: "Use of the site",
          paragraphs: [
            "TMN Sport content is provided for personal, non-commercial use. You may share links and short quotations with attribution. Reproduction of full articles, data tables or video without permission is not permitted.",
            "Automated scraping of live score data or statistics feeds is prohibited without a written agreement.",
          ],
        },
        {
          heading: "Accuracy",
          paragraphs: [
            "Live scores, fixtures and statistics are supplied by third-party data providers and may be delayed, incomplete or corrected after publication. TMN Sport is not liable for decisions taken in reliance on provisional match data.",
          ],
        },
        {
          heading: "Advertising",
          paragraphs: [
            "Advertising placements are clearly labelled. TMN Sport is not responsible for the content of external sites reached through advertisements.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: ["We may update these terms as the service develops. The current version always applies."],
        },
      ],
    };
  }

  return null;
}
