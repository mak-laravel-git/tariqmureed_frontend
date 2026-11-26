/**
 * API contract between this Next.js frontend and the Laravel backend.
 *
 * Every endpoint returns a Laravel API Resource payload, optionally wrapped in
 * { "data": ... }. Dates are ISO 8601 strings (with offset) and image fields are
 * absolute URLs (or paths below /public for bundled assets).
 */

export interface TeamColors {
  /** CSS colour at the start of the 145deg badge gradient. */
  from: string;
  /** CSS colour at the end of the gradient. */
  to: string;
}

export interface TeamSummary {
  id: number | string;
  slug: string;
  name: string;
  /** 2-3 letter code shown inside the circular badge, e.g. "MI". */
  shortName: string;
  colors: TeamColors;
  /** The team's logo from the data feed; drawn in the badge for teams that have no country flag. */
  image?: string | null;
}

export interface TeamProfile extends TeamSummary {
  membership: string;
  captain: string;
  coach: string;
  homeGround: string;
  titles: string;
}

export interface CompetitionRef {
  slug: string;
  name: string;
  /** Format tag shown next to the competition name, e.g. "T20", "ODI". */
  format: string;
  /** Group heading on fixture lists, e.g. "International" or "Domestic". */
  category?: string | null;
}

export type MatchState = "live" | "break" | "upcoming" | "result";

export interface MatchSide {
  team: TeamSummary;
  /** "148/3" - present once the side has batted. */
  score?: string | null;
  /** "15.2" - overs bowled when the score was recorded. */
  overs?: string | null;
  /** Free text shown instead of a score, e.g. "Yet to bat". */
  note?: string | null;
  /** Scheduled start time label (HH:mm) used for upcoming fixtures. */
  startTime?: string | null;
  /** True for the side currently batting (renders the live dot). */
  isBatting?: boolean;
}

export interface Match {
  id: number | string;
  slug: string;
  competition: CompetitionRef;
  state: MatchState;
  home: MatchSide;
  away: MatchSide;
  /** Headline under the scoreboard, e.g. "MI need 44 runs in 28 balls". */
  summary?: string | null;
  summaryTone?: "live" | "default";
  venue?: string | null;
  startsAt: string;
  /** "Match 12" label used on fixture lists. */
  stage?: string | null;
  city?: string | null;
  /** Status line under a fixture card, e.g. "Bangladesh chose to bat · Updated now". */
  statusText?: string | null;
  /** True when the match is scheduled for the current day (computed by the API). */
  isToday?: boolean;
}

export type MatchdayView = "live" | "upcoming" | "result" | "yesterday" | "today" | "tomorrow" | "week";

export interface MatchGroup {
  competition: CompetitionRef;
  matches: Match[];
}

export interface Matchday {
  /** ISO date the page is anchored to (usually "today"). */
  date: string;
  /** Competitions available in the filter drop-down. */
  competitions: CompetitionRef[];
  groups: MatchGroup[];
}

export interface MatchSummaryStats {
  matchesToday: number;
  liveNow: number;
  competitionsTracked: number;
  dataProvider: string;
}

export interface TickerItem {
  id: number | string;
  text: string;
  href?: string | null;
}

export interface Author {
  slug: string;
  name: string;
  /** False when the author has no public profile page (a desk byline), so the name is not made a link. */
  hasProfile?: boolean;
}

export interface Article {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt?: string;
  /** Category chip text, e.g. "BPL 2026", "International". */
  category: string;
  author: Author;
  publishedAt: string;
  readMinutes: number;
  caption?: string | null;
  /** Photo credit shown after the caption, e.g. "TMN Sport / Action Images". */
  credit?: string | null;
}

export interface FeaturedStories {
  lead: Article;
  side: Article[];
}

export interface StatHighlight {
  value: string;
  label: string;
  context: string;
}

export interface TrendingPlayer {
  id: number | string;
  slug: string;
  name: string;
  image: string;
  role: string;
  team: string;
  country: string;
  rankLabel: string;
  matches: number;
  runs: number;
  average: number;
}

export interface TeamFixtures {
  team: TeamProfile;
  matches: Match[];
}

export interface Video {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  category: string;
  duration: string;
  publishedAt: string;
  views: string;
}

export interface Tournament {
  id: number | string;
  slug: string;
  name: string;
  image: string;
  format: string;
  location: string;
  status: string;
  description: string;
  dateRange: string;
  matchCount: number;
}

export interface BattingRow {
  playerName: string;
  team: string;
  matches: number;
  runs: number;
  highScore: string;
  average: number;
  strikeRate: number;
  hundreds: number;
}

export interface BattingLeaders {
  seasonLabel: string;
  note: string;
  rows: BattingRow[];
}

export interface Writer {
  id: number | string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  articleCount: number;
  since: number;
}

/** One author's published stories, newest first. */
export interface WriterArticles {
  articles: Article[];
  /** All published stories of the author, used to decide whether "Show more" is shown. */
  total: number;
}

export interface NewsCategory {
  slug: string;
  name: string;
}

export interface NewsPage {
  featured: Article | null;
  articles: Article[];
  categories: NewsCategory[];
  /** Total articles matching the filter, used to decide whether "Load more" is shown. */
  total: number;
}

export interface ArticleBlock {
  type: "lead" | "paragraph" | "heading" | "quote" | "list" | "image" | "video" | "table";
  text: string;
  /** list: the items, and whether they are numbered. */
  items?: string[];
  ordered?: boolean;
  /** image and video: the address. */
  src?: string;
  /** table: the rows of cells. */
  rows?: string[][];
}

export interface ArticleDetail extends Article {
  subtitle?: string | null;
  /** When the story was last edited; search engines read it as the "modified" date. */
  updatedAt?: string | null;
  /** Trail shown after "News /", e.g. ["International", "Match analysis"]. */
  breadcrumb: string[];
  /** Search and social sharing details set in the dashboard. */
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialImage?: string | null;
  /** True when the story must stay out of search results and sitemap.xml. */
  noindex?: boolean;
  /** Extra pictures shown as a gallery under the story. */
  gallery?: string[];
  blocks: ArticleBlock[];
  tags: string[];
  related: Article[];
}

export interface ScorecardRow {
  batter: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
}

export interface BowlingRow {
  bowler: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
  wides: number;
  noBalls: number;
}

export interface Innings {
  team: string;
  /** 2 for a side's second innings of a first-class match. */
  number?: number;
  rows: ScorecardRow[];
  total?: { runs: number; wickets: number; overs: string; runRate: string | null } | null;
  extras?: { total: number; wides: number; noBalls: number; byes: number; legByes: number; penalty: number } | null;
  bowling?: BowlingRow[];
  fallOfWickets?: { wicket: number; score: number; over: string; batter: string }[];
  yetToBat?: string[];
}

export interface CommentaryEntry {
  id?: number;
  /** "England innings" */
  innings?: string;
  over: string;
  /** "1", "4", "6", "W" or "•" for a dot ball. */
  outcome: string;
  text: string;
}

export interface SquadPlayer {
  /** Player profile slug; null when the player has no profile page yet. */
  slug: string | null;
  name: string;
  image?: string | null;
  /** "Batsman", "Bowler", "Allrounder", "Wicketkeeper" ... as supplied by the data feed. */
  role?: string | null;
  captain?: boolean;
  wicketkeeper?: boolean;
  /** Named substitute rather than one of the starting players. */
  substitute?: boolean;
  /** "Right hand bat" */
  battingStyle?: string | null;
  /** "Slow left arm orthodox" */
  bowlingStyle?: string | null;
}

export interface SquadList {
  team: TeamSummary;
  players: SquadPlayer[];
}

export interface MatchStatRow {
  label: string;
  home: string | null;
  away: string | null;
}

export interface AwardWinner {
  name: string;
  image?: string | null;
  slug?: string | null;
}

export interface MatchDetail extends Match {
  title: string;
  /** "12th Match · Gaddafi Stadium, Lahore" */
  subtitle: string;
  /** "Bangladesh chose to bat first" */
  tossNote?: string | null;
  updatedAt: string;
  overview: {
    currentRunRate?: string | null;
    projectedScore?: string | null;
    partnership?: string | null;
    requiredRunRate?: string | null;
    target?: string | null;
    atCrease: { name: string; runs: number; balls: number; fours?: number; sixes?: number }[];
    bowler?: { name: string; figures: string } | null;
    /** Marks of the latest deliveries, oldest first. */
    recentBalls?: string[];
    result?: string | null;
    toss?: string | null;
    playerOfMatch?: AwardWinner | null;
    playerOfSeries?: AwardWinner | null;
    officials?: { role: string; name: string }[];
    /** "England tour of Australia · 2026" */
    series?: string | null;
    /** The leading batter and bowler of each innings. */
    performers?: { team: string; batter: string | null; bowler: string | null }[];
  };
  innings: Innings[];
  commentary: CommentaryEntry[];
  squads: SquadList[];
  stats: MatchStatRow[];
  relatedNews: Article[];
}

/** Card on the Series & Tournaments and Teams directories. */
export interface DirectoryItem {
  slug: string;
  name: string;
  /** Two or three letters inside the circular badge. */
  badge: string;
  colors: TeamColors;
  /** The team's logo from the data feed, when it has one. */
  image?: string | null;
  /** "In progress" | "Upcoming" | "Completed" */
  status: string;
  description: string;
  /** Filter group the item belongs to ("current", "international", ...). */
  group: string;
}

export interface Directory {
  groups: { slug: string; name: string }[];
  items: DirectoryItem[];
}

export interface PointsRow {
  position: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  /** Tied or abandoned matches. */
  noResult: number;
  /** Latest results, oldest first: "W", "L" or "N" (no result). */
  form: string[];
  points: number;
  netRunRate: string;
}

export interface TournamentDetail {
  slug: string;
  name: string;
  /** Short mark inside the yellow circle, e.g. "BPL". */
  abbreviation: string;
  status: string;
  /** "2 January — 7 February 2026 · Bangladesh" */
  dateline: string;
  overview: string;
  upcoming: Match[];
  matches: Match[];
  pointsTable: PointsRow[];
  teams: string[];
  stats: MatchStatRow[];
  news: Article[];
}

export interface FeaturedPlayerRef {
  slug: string;
  name: string;
  role: string;
  image: string;
}

export interface TeamPage {
  slug: string;
  name: string;
  badge: string;
  colors: TeamColors;
  kind: string;
  membership: string;
  nickname: string;
  /** The team's logo from the data feed, when it has one. */
  image?: string | null;
  /** Match record (played, won, lost); empty until the team has a finished match. */
  ranks: { label: string; value: string }[];
  players: FeaturedPlayerRef[];
  /** Leading batters and bowlers of the team per format, from the players' career statistics. */
  playerRankings?: PlayerRankings;
}

export interface RankedBatter {
  rank: number;
  slug: string;
  name: string;
  image: string;
  role: string;
  matches: number;
  runs: number;
  average: number | null;
  hundreds: number;
  highScore: number;
}

export interface RankedBowler {
  rank: number;
  slug: string;
  name: string;
  image: string;
  role: string;
  matches: number;
  wickets: number;
  average: number;
  fiveWickets: number;
}

export interface PlayerRankings {
  /** Formats that have figures, e.g. { key: "ODI", label: "ODI" }. */
  formats: { key: string; label: string }[];
  batting: Record<string, RankedBatter[]>;
  bowling: Record<string, RankedBowler[]>;
}

export interface TeamRankingRow {
  position: number;
  team: TeamSummary;
  matches: number;
  points: number;
  rating: number;
}

/** The official team rankings: one table per gender and format. */
export interface RankingsData {
  formats: { key: string; label: string }[];
  updatedAt?: string | null;
  tables: Record<string, Record<string, TeamRankingRow[]>>;
}

export interface PlayerPage {
  slug: string;
  name: string;
  image: string;
  teamAndRole: string;
  facts: { label: string; value: string }[];
  career: { format: string; matches: number; runs: string; average: string; hundreds: number; highScore: string }[];
  news: Article[];
}

export type StatsScope = "player" | "team" | "tournament";

export interface StatsMetricRow {
  rank: number;
  /** Player, team or tournament side the figure belongs to. */
  name: string;
  /** Qualification shown in the Competition column, e.g. "Min. 500 runs". */
  note: string;
  /** Pre-formatted figure, e.g. "11168" or "172.10". */
  value: string;
}

/** One leaderboard: a single metric ranked within a scope and format. */
export interface StatsMetricTable {
  id: string;
  /** "PLAYER · ODI" */
  eyebrow: string;
  /** "Most runs" */
  title: string;
  /** Heading of the first name column: "Player" or "Team". */
  subject: string;
  /** Heading of the value column, e.g. "Most runs". */
  valueLabel: string;
  rows: StatsMetricRow[];
}

export interface StatsPageData {
  scope: StatsScope;
  /** Applied format filter, or null for all formats. */
  format: string | null;
  metricCount: number;
  tables: StatsMetricTable[];
}

export type RecordGroup = "batting" | "bowling" | "team" | "tournament";

export interface RecordEntry {
  id: string;
  /** "Highest individual score" */
  title: string;
  group: RecordGroup;
  holder: string;
  /** "Test", "ODI", "T20I" or "T20". */
  format: string;
  detail: string;
  /** Pre-formatted figure, e.g. "400*" or "10/53". */
  value: string;
}

export interface RecordsPageData {
  /** Applied record group filter, or null for all groups. */
  group: RecordGroup | null;
  /** Applied format filter, or null for all formats. */
  format: string | null;
  total: number;
  /** Records per group under the current format filter. */
  groupCounts: Record<RecordGroup, number>;
  records: RecordEntry[];
}

export interface VideosPage {
  categories: string[];
  featured: Video | null;
  videos: Video[];
  total: number;
}

export interface LegalPage {
  slug: string;
  title: string;
  description: string;
  /** Paragraphs may contain `[label](https://…)` links; `bullets` render as a list after them. */
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  contact: { email: string; address: string };
  /** Shows a button that reopens the visitor's cookie choices. */
  privacySettings?: boolean;
}

/** Website settings the public site reads (GET /settings), edited in the admin dashboard. */
/** An advertisement running on one placement of the site (GET /ads), managed in the admin dashboard. */
export interface Ad {
  id: number;
  type: "image" | "adsense";
  name: string;
  /** Banner image (type "image"). */
  image: string | null;
  /** Where a click on the banner goes. */
  href: string | null;
  /** Google AdSense ad unit ID (type "adsense"). */
  slot: string | null;
}

/** The running ads, keyed by placement; a placement with no ad is missing. */
export type AdMap = Record<string, Ad | undefined>;

export interface PublicSettings {
  websiteName: string;
  contactEmail: string;
  contactAddress: string;
  /** Google Analytics 4 Measurement ID ("G-…"); empty means analytics is off. */
  gaMeasurementId: string;
  /** AdSense publisher ID ("ca-pub-…"); empty means no ads. */
  adsenseClientId: string;
  /** "builtin": the site's own cookie banner. "google": Google's certified message from AdSense. */
  consentMode: "builtin" | "google";
}

/** Global search and share settings (admin "SEO" screen). */
export interface SeoSettings {
  /** The live address ("https://tmnsport.com"); empty falls back to SITE_URL. */
  seoSiteUrl: string;
  /** Page title format, "%s | TMN Sport". */
  seoTitleTemplate: string;
  /** Picture used when a shared page has none of its own. */
  seoDefaultImage: string;
  seoTwitterHandle: string;
  /** False tells search engines to stay away from the whole site. */
  seoIndexing: boolean;
  seoGoogleVerification: string;
  seoBingVerification: string;
}

/** Search and share text of one page, with the built-in text already filled in where nothing was edited. */
export interface SeoPageText {
  title: string;
  description: string;
  image: string;
  noindex: boolean;
}

export interface SeoData {
  settings: SeoSettings & { websiteName?: string };
  /** Keyed by path: "/", "/news", "/live-scores"... */
  pages: Record<string, SeoPageText | undefined>;
}

/** Addresses for sitemap.xml (GET /sitemap). */
export interface SitemapData {
  articles: { slug: string; updatedAt: string; publishedAt: string | null }[];
  writers: string[];
  teams: string[];
  players: string[];
  series: string[];
  matches: string[];
}

export type SearchType = "all" | "news" | "matches" | "teams" | "players" | "videos";

export interface SearchResult {
  id: string;
  type: Exclude<SearchType, "all">;
  href: string;
  title: string;
  /** Eyebrow above the title: story category, competition, "Team", "Player", ... */
  label: string;
  /** Photo for stories, players and videos. Teams and matches use crests instead. */
  image?: string | null;
  imageAlt?: string;
  /** Team crests (one for a team, two for a match). */
  teams?: Pick<TeamSummary, "name" | "shortName" | "colors">[];
  /** Publication time for stories and videos. */
  publishedAt?: string | null;
  /** Free text under the title, e.g. "By TMN Desk" or "ODI Series · Tue 13 Nov". */
  meta?: string | null;
  /** Clip length for videos. */
  duration?: string | null;
}

export interface SearchResults {
  query: string;
  type: SearchType;
  /** Results matching the query and type, before the page limit is applied. */
  total: number;
  results: SearchResult[];
}
