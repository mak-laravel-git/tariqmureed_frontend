/**
 * Admin API contract (Laravel). Every endpoint lives under {API_URL}/admin and requires
 * "Authorization: Bearer <token>" from POST /auth/login. Responses use the usual
 * { "data": ... } envelope.
 */

export type ResourceKey =
  | "content"
  | "categories"
  | "series"
  | "advertisements"
  | "staff"
  | "authors"
  | "activity";

export type StatusTab = "all" | "active" | "pending" | "archived";

/** Row shown in every admin table; the three text columns are re-labelled per module. */
export interface AdminRecord {
  id: string;
  /** Name / title */
  title: string;
  /** Category / email */
  subtitle: string;
  /** Owner / scope */
  owner: string;
  status: string;
  /** Human readable "last updated" ("Today, 10:42", "Yesterday", "24 Jun"). */
  updatedAt: string;
  notes?: string | null;
  /** Small picture shown beside the name in lists: cover image, author photo or latest story image. */
  thumbnail?: string | null;
  /** Article editor only. */
  summary?: string | null;
  body?: string | null;
  tags?: string | null;
  publishAt?: string | null;
  /** Article editor only: URL of the cover image from the media library. */
  image?: string | null;
  /** Article editor only. */
  slug?: string | null;
  imageCaption?: string | null;
  imageCredit?: string | null;
  socialImage?: string | null;
  /** Article editor only: extra pictures shown in a gallery under the story. */
  gallery?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFeatured?: boolean;
  isBreaking?: boolean;
  /** Article editor only: keep the story out of search results. */
  noindex?: boolean;
  /** Advertisement editor only. */
  placement?: string | null;
  adType?: string | null;
  linkUrl?: string | null;
  adsenseSlot?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  /** Staff accounts only: the role's identifier, e.g. "super-admin". */
  role?: string;
  /** What was done to this record, newest first. Missing for records that keep no history. */
  history?: HistoryEntry[];
}

/** The staff editor's fields, named as the API expects them. */
export interface StaffInput {
  /** Full name. */
  title: string;
  /** Email address. */
  subtitle: string;
  /** Role identifier. */
  owner: string;
  /** Empty on an edit keeps the current password. */
  password: string;
  password_confirmation: string;
}

/** A place on the website where an advertisement can run. */
export interface AdPlacementOption {
  key: string;
  label: string;
  size: string;
}

/** Choices offered by the advertisement editor. */
export interface AdOptions {
  placements: AdPlacementOption[];
  media: MediaAsset[];
}

/** Choices offered by the article editor. */
export interface ArticleOptions {
  categories: string[];
  authors: string[];
  /** Tags already used on other articles. */
  tags: string[];
  media: MediaAsset[];
}

export interface RecordInput {
  title: string;
  subtitle: string;
  owner: string;
  status: string;
  notes?: string;
  summary?: string;
  body?: string;
  tags?: string;
  publishAt?: string;
  image?: string;
  adType?: string;
  linkUrl?: string;
  adsenseSlot?: string;
  startsAt?: string;
  endsAt?: string;
  slug?: string;
  imageCaption?: string;
  imageCredit?: string;
  socialImage?: string;
  gallery?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: string;
  isBreaking?: string;
  noindex?: string;
}

export interface RecordList {
  records: AdminRecord[];
  total: number;
}

export interface HistoryEntry {
  title: string;
  meta: string;
}

export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  initials: string;
  role: string;
  jobTitle: string;
  bio: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  hint: string;
  icon: "article" | "globe" | "draft" | "clock" | "folder" | "users" | "image" | "user";
}

export interface ActivityEntry {
  actor: string;
  initials: string;
  action: string;
  target: string;
  relative: string;
  absolute: string;
}

export interface SystemStatusRow {
  name: string;
  detail: string;
  status: "Connected" | "Degraded" | "Offline";
  icon: "plug" | "storage" | "globe" | "card";
}

export interface Dashboard {
  stats: DashboardStat[];
  activity: ActivityEntry[];
  system: SystemStatusRow[];
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  relative: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  /** "JPG · 1.2 MB" */
  meta: string;
  /** Absolute or /public URL; gradient placeholder is used when empty. */
  url?: string | null;
}

export interface SyncJob {
  id: string;
  name: string;
  detail: string;
  status: "Success" | "Failed" | "Running";
}

export interface IntegrationStatus {
  provider: string;
  connection: string;
  lastSync: string;
  recordsUpdated: string;
  openErrors: string;
  jobs: SyncJob[];
}

export interface SiteSettings {
  websiteName: string;
  contactEmail: string;
  contactAddress: string;
  description: string;
  defaultStatus: string;
  timezone: string;
  requireApproval: boolean;
  notifyEditors: boolean;
  /** Google Analytics 4 Measurement ID ("G-…"); empty means analytics is off. */
  gaMeasurementId: string;
  /** AdSense publisher ID ("ca-pub-…"); empty means no ads. */
  adsenseClientId: string;
  consentMode: "builtin" | "google";
  /** Search and share settings (admin "SEO" screen). */
  seoSiteUrl: string;
  seoTitleTemplate: string;
  seoDefaultImage: string;
  seoTwitterHandle: string;
  seoIndexing: boolean;
  seoGoogleVerification: string;
  seoBingVerification: string;
}

/** One website page in the SEO screen: its built-in text and what the editor wrote over it. */
export interface AdminSeoPage {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  title: string;
  description: string;
  image: string;
  noindex: boolean;
}

export interface SeoHealthCheck {
  key: string;
  label: string;
  status: "good" | "warning" | "error" | "info";
  detail: string;
}

/** One competition in the series arrangement screen. */
export interface SeriesRow {
  id: string;
  name: string;
  /** "T20I · T20 · International" */
  detail: string;
  /** In progress, Upcoming, Completed or No matches yet. */
  status: string;
}

/** The website's series strip: competitions on show in their order, and the hidden ones. */
export interface SeriesArrangement {
  visible: SeriesRow[];
  hidden: SeriesRow[];
}

/** One team in the admin "Team Fixtures" screen. */
export interface HomeTeamRow {
  id: string;
  name: string;
  /** "International" or "Domestic" */
  detail: string;
  /** Matches of the team in the synced fixtures. */
  matches: number;
}

/** The teams chosen for the home page's Team Fixtures section, in order, and all the others. */
export interface HomeTeamChoice {
  /** Most teams that can be chosen. */
  limit: number;
  selected: HomeTeamRow[];
  available: HomeTeamRow[];
  /** Names the website shows by itself while nothing is chosen. */
  automatic: string[];
}

/** One competition in the admin "Live Match Center" screen. */
export interface LiveCentreRow {
  id: string;
  name: string;
  /** Category and format, e.g. "International · ODI". */
  detail: string;
  /** Matches live, or starting within `windowDays` days before or after today. */
  matches: number;
}

/** The competitions put first in the home page's Live Match Center, in order, and all the others. */
export interface LiveCentreChoice {
  windowDays: number;
  selected: LiveCentreRow[];
  available: LiveCentreRow[];
}

export interface AdminSeo {
  pages: AdminSeoPage[];
  health: SeoHealthCheck[];
}

/** A legal page listed in the admin "Legal Pages" screen. */
export interface AdminPageSummary {
  slug: string;
  label: string;
  /** False while the website's built-in text is still in use. */
  customised: boolean;
  updatedAt: string | null;
}

/** The saved text of a legal page, in the editor format ("## Heading", "- bullet", paragraphs). */
export interface AdminPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  updatedAt: string | null;
}

export interface PermissionModule {
  key: string;
  label: string;
  /** Restricted modules only allow "view". */
  restricted: boolean;
  granted: Record<string, boolean>;
}

export interface RoleSummary {
  slug: string;
  name: string;
  description: string;
  system: boolean;
}

export interface PermissionMatrix {
  roles: RoleSummary[];
  selected: string;
  actions: string[];
  modules: PermissionModule[];
  updatedAt: string;
}

export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
}
