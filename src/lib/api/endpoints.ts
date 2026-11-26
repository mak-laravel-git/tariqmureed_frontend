import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  buildMockArticles,
  buildMockVideos,
  mockBattingLeaders,
  mockStatHighlights,
  mockTournaments,
  mockTrendingPlayers,
  mockWriters,
} from "@/lib/mocks/content";
import {
  mockAllMatches,
  mockIndiaFixtures,
  mockLiveMatches,
  mockResultMatches,
  mockSeriesChips,
  mockTicker,
  mockUpcomingMatches,
} from "@/lib/mocks/matches";
import { buildMockMatchday } from "@/lib/mocks/matchday";
import { buildMockMatchDetail } from "@/lib/mocks/matchdetail";
import { buildMockArticleDetail, buildMockNewsPage, listMockArticles } from "@/lib/mocks/news";
import { buildMockRankings } from "@/lib/mocks/rankings";
import { buildMockSearch } from "@/lib/mocks/search";
import { buildMockRecordsPage, buildMockStatsPage } from "@/lib/mocks/statistics";
import {
  buildMockPlayerPage,
  buildMockTeamPage,
  buildMockTournament,
  buildMockVideosPage,
  mockSeriesDirectory,
  mockTeamsDirectory,
} from "@/lib/mocks/sections";
import { emptyTeamProfile, mockTeamList, mockTeamProfiles } from "@/lib/mocks/teams";
import { builtInLegalPage } from "@/lib/legal-content";

import { apiGet } from "./client";
import { apiConfig } from "./config";
import type {
  AdMap,
  Article,
  Directory,
  LegalPage,
  PlayerPage,
  PublicSettings,
  SeoData,
  SitemapData,
  SearchResults,
  SearchType,
  RecordGroup,
  RecordsPageData,
  StatsPageData,
  StatsScope,
  TeamPage,
  TournamentDetail,
  VideosPage,
  ArticleDetail,
  BattingLeaders,
  CompetitionRef,
  FeaturedStories,
  Match,
  MatchDetail,
  Matchday,
  MatchdayView,
  MatchState,
  MatchSummaryStats,
  NewsPage,
  StatHighlight,
  TeamFixtures,
  TeamSummary,
  TickerItem,
  Tournament,
  TrendingPlayer,
  Video,
  RankingsData,
  Writer,
  WriterArticles,
} from "./types";

/**
 * One function per Laravel endpoint. Each is cached with Next.js Cache Components
 * ("use cache"); revalidate on demand with revalidateTag(<tag>) from a webhook or
 * route handler when the Laravel backend publishes new content.
 *
 *   GET /ticker                    -> getTicker
 *   GET /competitions?featured=1   -> getFeaturedSeries
 *   GET /matches?state=            -> getMatches
 *   GET /matches/{slug}            -> getMatchDetail
 *   GET /matches/summary           -> getMatchSummary
 *   GET /articles/featured         -> getFeaturedStories
 *   GET /articles?per_page=        -> getLatestNews
 *   GET /news?category=&team=&limit= -> getNewsPage
 *   GET /articles/{slug}           -> getArticle
 *   GET /matchday?view=&competition= -> getMatchday
 *   GET /articles/top-headlines    -> getTopHeadlines
 *   GET /articles/most-read        -> getMostRead
 *   GET /stats/highlights          -> getStatHighlights
 *   GET /stats/batting-leaders     -> getBattingLeaders
 *   GET /players/trending          -> getTrendingPlayers
 *   GET /teams                     -> getTeams
 *   GET /teams/{slug}/fixtures     -> getTeamFixtures
 *   GET /videos/highlights         -> getVideoHighlights
 *   GET /competitions/spotlight    -> getTournamentSpotlight
 *   GET /writers                   -> getWriters
 *   GET /search?q=&type=&limit=    -> getSearchResults
 *   GET /stats?scope=&format=      -> getStatsPage
 *   GET /records?group=&format=    -> getRecordsPage
 */

export async function getTicker(): Promise<TickerItem[]> {
  "use cache";
  // "minutes" (not "seconds") so the ticker stays part of the prerendered shell;
  // breaking news still refreshes immediately through revalidateTag("ticker").
  cacheLife("minutes");
  cacheTag("ticker");

  return apiGet<TickerItem[]>("ticker", { fallback: () => mockTicker });
}

export async function getFeaturedSeries(): Promise<CompetitionRef[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("competitions");

  return apiGet<CompetitionRef[]>("competitions", {
    query: { featured: 1 },
    fallback: () => mockSeriesChips,
  });
}

/** Matches filtered by state. "live" includes innings breaks. */
export async function getMatches(state: MatchState | "all", limit?: number): Promise<Match[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag("matches");

  return apiGet<Match[]>("matches", {
    query: { state: state === "all" ? null : state, limit },
    fallback: () => {
      const pool: Match[] =
        state === "live"
          ? mockLiveMatches
          : state === "upcoming"
            ? mockUpcomingMatches
            : state === "result"
              ? mockResultMatches
              : mockAllMatches;

      return limit ? pool.slice(0, limit) : pool;
    },
  });
}

/**
 * Fixtures grouped by competition for the Live Scores and Schedule pages.
 * GET /matchday?view=live|upcoming|result|yesterday|today|tomorrow|week&competition=<slug>
 */
export async function getMatchday(view: MatchdayView, competition?: string): Promise<Matchday> {
  "use cache";
  cacheLife("seconds");
  cacheTag("matches");

  return apiGet<Matchday>("matchday", {
    query: { view, competition },
    fallback: () => {
      const day = buildMockMatchday(view);

      return competition
        ? { ...day, groups: day.groups.filter((entry) => entry.competition.slug === competition) }
        : day;
    },
  });
}

/**
 * Match centre: header, overview, scorecard, commentary, squads, stats and related news.
 * GET /matches/{slug}. Resolves to null when the match does not exist.
 */
export async function getMatchDetail(slug: string): Promise<MatchDetail | null> {
  "use cache";
  cacheLife("seconds");
  cacheTag("matches");

  return apiGet<MatchDetail | null>(`matches/${encodeURIComponent(slug)}`, {
    fallback: () => buildMockMatchDetail(slug),
  });
}

export async function getMatchSummary(): Promise<MatchSummaryStats> {
  "use cache";
  cacheLife("seconds");
  cacheTag("matches");

  return apiGet<MatchSummaryStats>("matches/summary", {
    fallback: () => ({
      matchesToday: 6,
      liveNow: mockLiveMatches.length,
      competitionsTracked: 8,
      dataProvider: "TMN Sport Live",
    }),
  });
}

export async function getFeaturedStories(): Promise<FeaturedStories> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<FeaturedStories>("articles/featured", {
    fallback: () => buildMockArticles().featured,
  });
}

export async function getLatestNews(perPage = 9): Promise<Article[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<Article[]>("articles", {
    query: { per_page: perPage },
    fallback: () => buildMockArticles().latest.slice(0, perPage),
  });
}

/**
 * News listing with optional category and team filters.
 * GET /news?category=<slug>&team=<team-slug>&limit=<n>
 */
export async function getNewsPage(category: string | undefined, limit: number, team?: string): Promise<NewsPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<NewsPage>("news", {
    query: { category, team, limit },
    fallback: () => buildMockNewsPage(category, limit, team),
  });
}

/**
 * Single article with body blocks, tags and related stories. Resolves to null when unknown.
 * GET /articles/{slug}
 */
export async function getArticle(slug: string): Promise<ArticleDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<ArticleDetail | null>(`articles/${encodeURIComponent(slug)}`, {
    fallback: () => buildMockArticleDetail(slug),
  });
}

export async function getTopHeadlines(): Promise<Article[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<Article[]>("articles/top-headlines", {
    fallback: () => buildMockArticles().topHeadlines,
  });
}

export async function getMostRead(): Promise<Article[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles");

  return apiGet<Article[]>("articles/most-read", {
    fallback: () => buildMockArticles().mostRead,
  });
}

export async function getStatHighlights(): Promise<StatHighlight[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("stats");

  return apiGet<StatHighlight[]>("stats/highlights", { fallback: () => mockStatHighlights });
}

export async function getBattingLeaders(): Promise<BattingLeaders> {
  "use cache";
  cacheLife("hours");
  cacheTag("stats");

  return apiGet<BattingLeaders>("stats/batting-leaders", { fallback: () => mockBattingLeaders });
}

export async function getTrendingPlayers(): Promise<TrendingPlayer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("players");

  return apiGet<TrendingPlayer[]>("players/trending", { fallback: () => mockTrendingPlayers });
}

export async function getTeams(): Promise<TeamSummary[]> {
  "use cache";
  cacheLife("days");
  cacheTag("teams");

  return apiGet<TeamSummary[]>("teams", { fallback: () => mockTeamList });
}

export async function getTeamFixtures(slug: string): Promise<TeamFixtures | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("teams", "matches");

  return apiGet<TeamFixtures | null>(`teams/${encodeURIComponent(slug)}/fixtures`, {
    fallback: () => {
      const team = mockTeamList.find((candidate) => candidate.slug === slug);
      if (!team) {
        return null;
      }

      const matches =
        slug === "india"
          ? mockIndiaFixtures
          : mockAllMatches.filter(
              (match) => match.home.team.slug === slug || match.away.team.slug === slug,
            );

      return { team: { ...team, ...(mockTeamProfiles[slug] ?? emptyTeamProfile) }, matches };
    },
  });
}

export async function getVideoHighlights(): Promise<Video[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("videos");

  return apiGet<Video[]>("videos/highlights", { fallback: () => buildMockVideos() });
}

export async function getTournamentSpotlight(): Promise<Tournament[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("competitions");

  return apiGet<Tournament[]>("competitions/spotlight", { fallback: () => mockTournaments });
}

export async function getWriters(): Promise<Writer[]> {
  "use cache";
  cacheLife("days");
  cacheTag("writers");

  return apiGet<Writer[]>("writers", { fallback: () => mockWriters });
}

/** GET /videos/{slug} - single video page. */
export async function getVideo(slug: string): Promise<Video | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("videos");

  return apiGet<Video | null>(`videos/${encodeURIComponent(slug)}`, {
    fallback: () => {
      const page = buildMockVideosPage(undefined, 100);
      const all = [...(page.featured ? [page.featured] : []), ...page.videos, ...buildMockVideos()];

      return all.find((video) => video.slug === slug) ?? null;
    },
  });
}

/** GET /writers/{slug} - writer profile. */
export async function getWriter(slug: string): Promise<Writer | null> {
  "use cache";
  cacheLife("days");
  cacheTag("writers");

  return apiGet<Writer | null>(`writers/${encodeURIComponent(slug)}`, {
    fallback: () => mockWriters.find((writer) => writer.slug === slug) ?? null,
  });
}

/**
 * GET /writers/{slug}/articles - every published story of one author, newest first.
 * Cached under the "articles" tag, so a story published in the admin shows up on the profile straight away.
 */
export async function getWriterArticles(slug: string, limit: number): Promise<WriterArticles> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "writers");

  return apiGet<WriterArticles>(`writers/${encodeURIComponent(slug)}/articles`, {
    query: { limit },
    fallback: () => {
      const own = [...buildMockArticles().latest, ...listMockArticles()]
        .filter((entry) => entry.author.slug === slug)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

      return { articles: own.slice(0, limit), total: own.length };
    },
  });
}

/** GET /series - directory of series and tournaments grouped by current / upcoming / completed. */
export async function getSeriesDirectory(): Promise<Directory> {
  "use cache";
  cacheLife("hours");
  cacheTag("competitions");

  return apiGet<Directory>("series", { fallback: () => mockSeriesDirectory });
}

/** GET /series/{slug} - tournament overview, matches, points table, teams, statistics and news. */
export async function getTournament(slug: string): Promise<TournamentDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("competitions", "matches");

  return apiGet<TournamentDetail | null>(`series/${encodeURIComponent(slug)}`, {
    fallback: () => buildMockTournament(slug),
  });
}

/** GET /teams/directory - national and domestic sides grouped for the Teams page. */
export async function getTeamsDirectory(): Promise<Directory> {
  "use cache";
  cacheLife("days");
  cacheTag("teams");

  return apiGet<Directory>("teams/directory", { fallback: () => mockTeamsDirectory });
}

/**
 * GET /rankings - the official team rankings for every format, men's and women's.
 * Sample figures are only shown when the site runs without an API; with one, a missing table is reported as
 * not available, never filled with made-up numbers.
 */
export async function getRankings(): Promise<RankingsData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("teams");

  return apiGet<RankingsData>("rankings", {
    fallback: () => (apiConfig.useMocks ? buildMockRankings() : { formats: [], updatedAt: null, tables: {} }),
  });
}

/** GET /teams/{slug} - team profile with rankings and featured players. */
export async function getTeamPage(slug: string): Promise<TeamPage | null> {
  "use cache";
  // Minutes, not hours: a squad or ranking brought in by the data sync should show up soon after.
  cacheLife("minutes");
  cacheTag("teams", "players");

  return apiGet<TeamPage | null>(`teams/${encodeURIComponent(slug)}`, {
    fallback: () => buildMockTeamPage(slug),
  });
}

/** GET /players/{slug} - player profile, career statistics and related news. */
export async function getPlayerPage(slug: string): Promise<PlayerPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("players", "articles");

  return apiGet<PlayerPage | null>(`players/${encodeURIComponent(slug)}`, {
    fallback: () => buildMockPlayerPage(slug),
  });
}

/**
 * Statistics centre: leaderboards for a scope (player, team or tournament) and format.
 * GET /stats?scope=player|team|tournament&format=Test|ODI|T20I|T20
 */
export async function getStatsPage(scope: StatsScope, format?: string): Promise<StatsPageData> {
  "use cache";
  cacheLife("hours");
  cacheTag("stats");

  // Sample figures only without an API; a live site with no data says so instead of showing made-up numbers.
  return apiGet<StatsPageData>("stats", {
    query: { scope, format },
    fallback: () => (apiConfig.useMocks ? buildMockStatsPage(scope, format) : { scope, format: format ?? null, metricCount: 0, tables: [] }),
  });
}

/**
 * Records centre: landmark performances for a record group and format.
 * GET /records?group=batting|bowling|team|tournament&format=Test|ODI|T20I|T20
 */
export async function getRecordsPage(group?: RecordGroup, format?: string): Promise<RecordsPageData> {
  "use cache";
  cacheLife("hours");
  cacheTag("stats");

  return apiGet<RecordsPageData>("records", {
    query: { group, format },
    fallback: () =>
      apiConfig.useMocks
        ? buildMockRecordsPage(group, format)
        : { group: group ?? null, format: format ?? null, total: 0, groupCounts: { batting: 0, bowling: 0, team: 0, tournament: 0 }, records: [] },
  });
}

/** GET /videos?category=&limit= - video hub with a featured clip. */
export async function getVideosPage(category: string | undefined, limit: number): Promise<VideosPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("videos");

  return apiGet<VideosPage>("videos", {
    query: { category, limit },
    fallback: () => buildMockVideosPage(category, limit),
  });
}

/**
 * GET /ads - the advertisement running on each placement, edited in the admin dashboard. While the API is
 * unreachable no ad is shown, so a failure never breaks a page.
 */
export async function getAds(): Promise<AdMap> {
  "use cache";
  cacheLife("minutes");
  cacheTag("ads");

  return apiGet<AdMap>("ads", { fallback: () => ({}) }).catch((): AdMap => ({}));
}

/**
 * Website settings for the public site (GET /settings): contact details, Google tag IDs and consent
 * mode, all edited in the admin dashboard. Anything left empty there falls back to the environment
 * (GA_MEASUREMENT_ID, ADSENSE_CLIENT_ID, CONSENT_MODE, CONTACT_EMAIL, CONTACT_ADDRESS).
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");

  const stored = await apiGet<Partial<PublicSettings>>("settings", { fallback: () => ({}) }).catch(
    (): Partial<PublicSettings> => ({}),
  );
  const env = (name: string): string => process.env[name]?.trim() ?? "";

  return {
    websiteName: stored.websiteName || "TMN Sport",
    contactEmail: stored.contactEmail || env("CONTACT_EMAIL"),
    contactAddress: stored.contactAddress || env("CONTACT_ADDRESS"),
    gaMeasurementId: stored.gaMeasurementId || env("GA_MEASUREMENT_ID"),
    adsenseClientId: stored.adsenseClientId || env("ADSENSE_CLIENT_ID"),
    consentMode: (stored.consentMode || env("CONSENT_MODE")) === "google" ? "google" : "builtin",
  };
}

const defaultSeo: SeoData = {
  settings: {
    seoSiteUrl: "",
    seoTitleTemplate: "%s | TMN Sport",
    seoDefaultImage: "",
    seoTwitterHandle: "",
    seoIndexing: true,
    seoGoogleVerification: "",
    seoBingVerification: "",
  },
  pages: {},
};

/**
 * Search and share settings written in the admin SEO screen (GET /seo): the title format, default picture,
 * indexing switch and verification codes, and the text of every page. When the API cannot be reached the
 * built-in defaults apply, so the pages keep their own titles and descriptions.
 */
export async function getSeo(): Promise<SeoData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("seo", "settings");

  const stored = await apiGet<Partial<SeoData>>("seo", { fallback: () => defaultSeo }).catch((): Partial<SeoData> => ({}));

  return { settings: { ...defaultSeo.settings, ...stored.settings }, pages: stored.pages ?? {} };
}

/** The addresses sitemap.xml lists. GET /sitemap */
export async function getSitemap(): Promise<SitemapData> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", "seo");

  return apiGet<SitemapData>("sitemap", {
    fallback: () => ({ articles: [], writers: [], teams: [], players: [], series: [], matches: [] }),
  }).catch((): SitemapData => ({ articles: [], writers: [], teams: [], players: [], series: [], matches: [] }));
}

/**
 * GET /pages/{slug} - editorial legal pages (privacy policy, cookies, terms of use).
 * A page saved in the admin dashboard wins; until then (or if the API is unreachable) the text built
 * into the website is used, so these pages always render. The contact card comes from the settings.
 */
export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pages", "settings");

  const edited = await apiGet<LegalPage | null>(`pages/${encodeURIComponent(slug)}`, { fallback: () => null }).catch(
    () => null,
  );
  const page = edited ?? builtInLegalPage(slug);

  if (!page) {
    return null;
  }

  const settings = await getPublicSettings();

  return { ...page, contact: { email: settings.contactEmail, address: settings.contactAddress } };
}

/**
 * Site-wide search across stories, matches, teams, players and videos.
 * GET /search?q=<text>&type=all|news|matches|teams|players|videos&limit=<n>
 */
export async function getSearchResults(query: string, type: SearchType, limit: number): Promise<SearchResults> {
  "use cache";
  cacheLife("minutes");
  cacheTag("search", "articles", "matches", "teams", "players", "videos");

  return apiGet<SearchResults>("search", {
    query: { q: query, type: type === "all" ? null : type, limit },
    fallback: () => buildMockSearch(query, type, limit),
  });
}
