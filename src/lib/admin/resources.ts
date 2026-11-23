import type { ResourceKey, StatusTab } from "./types";

export interface ResourceConfig {
  key: ResourceKey;
  /** Sidebar and page title. */
  label: string;
  /** Singular noun used in buttons and breadcrumbs. */
  singular: string;
  description: string;
  /** "article" renders the rich article editor, "generic" the shared record form. */
  form: "article" | "advertisement" | "generic";
  /** Path segment below /admin/api on the Laravel side. */
  apiPath: string;
  readOnly?: boolean;
  /** Rows can be viewed and edited but not created here (staff accounts need a password). */
  noCreate?: boolean;
  newLabel?: string;
  /** Column heading overrides: [title, subtitle, owner, status, updated]. */
  columns?: [string, string, string, string, string];
}

export const resources: Record<ResourceKey, ResourceConfig> = {
  content: {
    key: "content",
    label: "Content Management",
    singular: "article",
    description: "Create, review and publish stories across the TMN Sport network.",
    form: "article",
    apiPath: "articles",
  },
  categories: {
    key: "categories",
    label: "Categories",
    singular: "category",
    description: "Organise the editorial taxonomy used across published content.",
    form: "generic",
    apiPath: "categories",
  },
  series: {
    key: "series",
    label: "Series & Tournaments",
    singular: "series",
    description: "Maintain competitions, fixtures and featured series shortcuts.",
    form: "generic",
    apiPath: "competitions",
    readOnly: true,
  },
  advertisements: {
    key: "advertisements",
    label: "Advertisement Management",
    singular: "advertisement",
    description: "Choose which advertisement runs on each place of the website.",
    form: "advertisement",
    apiPath: "advertisements",
  },
  staff: {
    key: "staff",
    label: "Staff Management",
    singular: "staff member",
    description: "Manage newsroom accounts, roles and account status.",
    form: "generic",
    apiPath: "staff",
    noCreate: true,
  },
  authors: {
    key: "authors",
    label: "Authors",
    singular: "author",
    description: "Maintain the journalists and analysts credited on stories.",
    form: "generic",
    apiPath: "writers",
  },
  activity: {
    key: "activity",
    label: "Activity Logs",
    singular: "log entry",
    description: "Review every action taken across the editorial platform.",
    form: "generic",
    apiPath: "activity-logs",
    readOnly: true,
  },
};

export function isResourceKey(value: string): value is ResourceKey {
  return value in resources;
}

export const statusTabs: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "archived", label: "Archived" },
];

export const statusOptions = ["Active", "Published", "Draft", "Pending", "Scheduled", "Archived"];

/** Statuses grouped by the filter tab above each table. */
export const tabStatuses: Record<StatusTab, string[] | null> = {
  all: null,
  active: ["Active", "Published", "Live"],
  pending: ["Pending", "Draft", "Scheduled", "Upcoming"],
  archived: ["Archived"],
};

export function resolveTab(value: string | undefined): StatusTab {
  return statusTabs.find((tab) => tab.key === value)?.key ?? "all";
}

export const adminNav: { heading?: string; items: { label: string; href: string; icon: string; match: string }[] }[] = [
  { items: [{ label: "Dashboard", href: "/admin", icon: "dashboard", match: "/admin" }] },
  {
    heading: "Content",
    items: [
      { label: "Content Management", href: "/admin/content", icon: "article", match: "/admin/content" },
      { label: "Categories", href: "/admin/categories", icon: "folder", match: "/admin/categories" },
      { label: "Media Library", href: "/admin/media", icon: "image", match: "/admin/media" },
      { label: "Authors", href: "/admin/authors", icon: "users", match: "/admin/authors" },
      { label: "Series & Tournaments", href: "/admin/series", icon: "trophy", match: "/admin/series" },
      { label: "Advertisement Management", href: "/admin/advertisements", icon: "megaphone", match: "/admin/advertisements" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "API Integration", href: "/admin/integrations", icon: "plug", match: "/admin/integrations" },
      { label: "Legal Pages", href: "/admin/pages", icon: "article", match: "/admin/pages" },
      { label: "Website Settings", href: "/admin/settings", icon: "sliders", match: "/admin/settings" },
    ],
  },
  {
    heading: "Administration",
    items: [
      { label: "Staff Management", href: "/admin/staff", icon: "user", match: "/admin/staff" },
      { label: "Roles & Permissions", href: "/admin/roles", icon: "shield", match: "/admin/roles" },
      { label: "Activity Logs", href: "/admin/activity", icon: "pulse", match: "/admin/activity" },
    ],
  },
];
