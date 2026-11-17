import type { SearchResult, SearchResults, SearchType } from "@/lib/api/types";

import { buildMockVideos, mockTrendingPlayers } from "./content";
import { mockAllMatches } from "./matches";
import { listMockArticles } from "./news";
import { mockTeamList } from "./teams";

const NAJMUL = {
  slug: "najmul-hossain-shanto",
  name: "Najmul Hossain Shanto",
  image: "/images/players/najmul-hossain-shanto.jpg",
  detail: "Bangladesh · Batter",
};

function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function newsResults(query: string): SearchResult[] {
  const seen = new Set<string>();

  return listMockArticles()
    .filter((article) => {
      // The mock feed repeats its stories; real search results are unique.
      if (seen.has(article.title)) {
        return false;
      }
      seen.add(article.title);

      return matches(query, article.title, article.excerpt, article.category);
    })
    .map((article) => ({
      id: `news-${article.id}`,
      type: "news" as const,
      href: `/news/${article.slug}`,
      title: article.title,
      label: article.category,
      image: article.image,
      imageAlt: article.imageAlt,
      publishedAt: article.publishedAt,
      meta: `By ${article.author.name}`,
    }));
}

function matchResults(query: string): SearchResult[] {
  return mockAllMatches
    .filter((match) =>
      matches(query, match.home.team.name, match.away.team.name, match.competition.name, match.venue, match.city),
    )
    .map((match) => ({
      id: `match-${match.id}`,
      type: "matches" as const,
      href: `/matches/${match.slug}`,
      title: `${match.home.team.name} vs ${match.away.team.name}`,
      label: match.competition.name,
      teams: [match.home.team, match.away.team],
      meta: match.summary ?? match.statusText ?? match.venue ?? null,
    }));
}

function teamResults(query: string): SearchResult[] {
  return mockTeamList
    .filter((team) => matches(query, team.name, team.shortName))
    .map((team) => ({
      id: `team-${team.id}`,
      type: "teams" as const,
      href: `/teams/${team.slug}`,
      title: team.name,
      label: "Team",
      teams: [team],
    }));
}

function playerResults(query: string): SearchResult[] {
  const trending = mockTrendingPlayers
    .filter((player) => matches(query, player.name, player.team, player.country, player.role))
    .map((player) => ({
      id: `player-${player.id}`,
      type: "players" as const,
      href: `/players/${player.slug}`,
      title: player.name,
      label: "Player",
      image: player.image,
      meta: `${player.country} · ${player.role}`,
    }));

  const extra = matches(query, NAJMUL.name, NAJMUL.detail)
    ? [
        {
          id: "player-najmul",
          type: "players" as const,
          href: `/players/${NAJMUL.slug}`,
          title: NAJMUL.name,
          label: "Player",
          image: NAJMUL.image,
          meta: NAJMUL.detail,
        },
      ]
    : [];

  return [...trending, ...extra];
}

function videoResults(query: string): SearchResult[] {
  return buildMockVideos()
    .filter((video) => matches(query, video.title, video.description, video.category))
    .map((video) => ({
      id: `video-${video.id}`,
      type: "videos" as const,
      href: "/videos",
      title: video.title,
      label: video.category,
      image: video.thumbnail,
      publishedAt: video.publishedAt,
      meta: `${video.views} views`,
      duration: video.duration,
    }));
}

/** Searches the mock content: stories first, then matches, teams, players and videos. */
export function buildMockSearch(query: string, type: SearchType, limit: number): SearchResults {
  const groups: Record<Exclude<SearchType, "all">, () => SearchResult[]> = {
    news: () => newsResults(query),
    matches: () => matchResults(query),
    teams: () => teamResults(query),
    players: () => playerResults(query),
    videos: () => videoResults(query),
  };

  const found = (type === "all" ? Object.values(groups) : [groups[type]]).flatMap((collect) => collect());

  return { query, type, total: found.length, results: found.slice(0, limit) };
}
