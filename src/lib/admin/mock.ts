import "server-only";

import type {
  ActivityEntry,
  AdminNotification,
  AdminRecord,
  AdminUser,
  Dashboard,
  IntegrationStatus,
  MediaAsset,
  PermissionMatrix,
  ResourceKey,
  SiteSettings,
} from "./types";

function record(
  id: string,
  title: string,
  subtitle: string,
  owner: string,
  status: string,
  updatedAt: string,
): AdminRecord {
  return { id, title, subtitle, owner, status, updatedAt, notes: null };
}

const activity: ActivityEntry[] = [
  { actor: "Nadia Rahman", initials: "NR", action: "published article", target: "Australia complete emphatic series win over India", relative: "12 min ago", absolute: "Today, 10:42" },
  { actor: "Omar Siddiqui", initials: "OS", action: "updated article", target: "Premier League title race enters decisive weekend", relative: "28 min ago", absolute: "Today, 10:26" },
  { actor: "Bilal Ahmed", initials: "BM", action: "approved article", target: "Champions Trophy: Pakistan announce final squad", relative: "1 hour ago", absolute: "Today, 09:45" },
  { actor: "Grace Mutiso", initials: "GM", action: "uploaded media", target: "stadium-night-final.jpg", relative: "2 hours ago", absolute: "Today, 08:31" },
  { actor: "Nadia Rahman", initials: "NR", action: "created article", target: "Wimbledon 2025: Players to watch", relative: "3 hours ago", absolute: "Today, 07:18" },
  { actor: "Bilal Ahmed", initials: "BM", action: "updated settings", target: "Homepage navigation and featured series", relative: "Yesterday", absolute: "Yesterday, 18:04" },
];

export const mockDashboard: Dashboard = {
  stats: [
    { label: "Total articles", value: "24", hint: "All content in the CMS", icon: "article" },
    { label: "Published", value: "14", hint: "Live on the public site", icon: "globe" },
    { label: "Drafts", value: "4", hint: "In progress", icon: "draft" },
    { label: "Pending approval", value: "3", hint: "Awaiting review", icon: "clock" },
    { label: "Categories", value: "8", hint: "Editorial taxonomy", icon: "folder" },
    { label: "Authors", value: "6", hint: "Published contributors", icon: "users" },
    { label: "Media assets", value: "12", hint: "Images and thumbnails", icon: "image" },
    { label: "Active staff", value: "4", hint: "Administrator accounts", icon: "user" },
  ],
  activity,
  system: [
    { name: "SportMonks API", detail: "Last sync 3 hours ago · 1,284 records", status: "Connected", icon: "plug" },
    { name: "Media storage", detail: "12 assets stored in the library", status: "Connected", icon: "storage" },
    { name: "Public website", detail: "All public routes responding normally", status: "Connected", icon: "globe" },
    { name: "Press card registry", detail: "8 verification records on file", status: "Connected", icon: "card" },
  ],
};

export const mockNotifications: AdminNotification[] = [
  { id: "n1", title: "Article pending approval", body: "“Ashes 2025: Day 3 Session Highlights” needs review.", relative: "12 min ago" },
  { id: "n2", title: "Press card expiring soon", body: "3 press cards expire within the next 14 days.", relative: "1 hour ago" },
  { id: "n3", title: "SportMonks sync completed", body: "1,284 fixture records updated successfully.", relative: "3 hours ago" },
];

export const mockUser: AdminUser = {
  id: 1,
  name: "Bilal Ahmed",
  email: "superadmin@tmnsports.com",
  initials: "BA",
  role: "Super Admin",
  jobTitle: "Head of Digital Operations",
  bio: "Leading digital publishing operations and platform strategy for TMN Sports.",
};

export const mockMedia: MediaAsset[] = [
  { id: "m1", title: "Stadium at night", meta: "JPG · 1.2 MB" },
  { id: "m2", title: "Cricket match", meta: "JPG · 1.3 MB" },
  { id: "m3", title: "Football final", meta: "JPG · 1.4 MB" },
  { id: "m4", title: "Champions Trophy", meta: "JPG · 1.5 MB" },
  { id: "m5", title: "Wimbledon court", meta: "JPG · 1.6 MB" },
  { id: "m6", title: "Formula 1 grid", meta: "JPG · 1.7 MB" },
  { id: "m7", title: "Team celebration", meta: "JPG · 1.8 MB" },
  { id: "m8", title: "Press conference", meta: "JPG · 1.9 MB" },
];

export const mockIntegration: IntegrationStatus = {
  provider: "SportMonks",
  connection: "Connected",
  lastSync: "3 hours ago",
  recordsUpdated: "1,284",
  openErrors: "0",
  jobs: [
    { id: "j1", name: "Fixtures & results", detail: "1 hours ago · 320 records", status: "Success" },
    { id: "j2", name: "Team profiles", detail: "2 hours ago · 273 records", status: "Success" },
    { id: "j3", name: "League standings", detail: "3 hours ago · 226 records", status: "Success" },
    { id: "j4", name: "Player statistics", detail: "4 hours ago · 179 records", status: "Success" },
  ],
};

export const mockSettings: SiteSettings = {
  websiteName: "TMN Sports",
  contactEmail: "editorial@tmnsports.com",
  description: "Independent sports news, scores and analysis from around the world.",
  defaultStatus: "Draft",
  timezone: "Asia/Karachi (UTC+5)",
  requireApproval: true,
  notifyEditors: true,
};

const allActions = ["view", "create", "edit", "delete", "publish", "manage"];

function module(key: string, label: string, restricted: boolean, grants: string[]) {
  return {
    key,
    label,
    restricted,
    granted: Object.fromEntries(allActions.map((action) => [action, grants.includes(action)])),
  };
}

export function buildMockPermissions(selected: string): PermissionMatrix {
  const isSuper = selected === "super-admin";
  const full = allActions;

  return {
    roles: [
      { slug: "super-admin", name: "Super Admin", description: "Full, permanent platform access", system: true },
      { slug: "staff-admin", name: "Staff Admin", description: "18 assigned staff members", system: false },
    ],
    selected: isSuper ? "super-admin" : "staff-admin",
    actions: allActions,
    updatedAt: "Last updated 3 days ago",
    modules: isSuper
      ? [
          module("articles", "Articles", false, full),
          module("categories", "Categories", false, full),
          module("tags", "Tags", false, full),
          module("media", "Media library", false, full),
          module("authors", "Authors", false, full),
          module("tournaments", "Tournaments", false, full),
          module("press-cards", "Press cards", false, full),
          module("staff", "Staff management", false, full),
          module("activity", "Activity logs", false, full),
          module("api", "API integration", false, full),
        ]
      : [
          module("articles", "Articles", false, ["view", "create", "edit", "delete", "publish", "manage"]),
          module("categories", "Categories", false, ["view", "create", "edit", "delete"]),
          module("tags", "Tags", false, ["view", "create", "edit", "delete"]),
          module("media", "Media library", false, ["view", "create", "edit", "delete"]),
          module("authors", "Authors", false, ["view", "create", "edit", "delete"]),
          module("tournaments", "Tournaments", false, ["view", "create", "edit", "delete"]),
          module("press-cards", "Press cards", true, ["view"]),
          module("staff", "Staff management", true, ["view"]),
          module("activity", "Activity logs", true, ["view"]),
          module("api", "API integration", true, ["view"]),
        ],
  };
}

interface Store {
  records: Record<ResourceKey, AdminRecord[]>;
  settings: SiteSettings;
  user: AdminUser;
  nextId: number;
}

function seed(): Store {
  return {
    nextId: 100,
    settings: { ...mockSettings },
    user: { ...mockUser },
    records: {
      content: [
        record("1", "Australia complete emphatic series win over India", "Cricket", "Nadia Rahman", "Published", "Today, 10:42"),
        record("2", "Premier League title race enters decisive weekend", "Football", "Omar Siddiqui", "Draft", "Today, 10:26"),
        record("3", "Champions Trophy: Pakistan announce final squad", "Cricket", "Bilal Ahmed", "Published", "Today, 09:45"),
        record("4", "Wimbledon 2025: Players to watch", "Tennis", "Nadia Rahman", "Pending", "Today, 07:18"),
        record("5", "Formula 1 calendar confirmed for next season", "Formula 1", "Grace Mutiso", "Scheduled", "Yesterday"),
      ],
      categories: [
        record("1", "Cricket", "cricket", "11 articles", "Active", "1"),
        record("2", "Football", "football", "7 articles", "Active", "2"),
        record("3", "Tennis", "tennis", "3 articles", "Active", "3"),
        record("4", "Formula 1", "formula-1", "2 articles", "Active", "4"),
        record("5", "Basketball", "basketball", "1 article", "Active", "5"),
      ],
      series: [
        record("1", "ICC Champions Trophy", "Cricket", "19 Feb – 9 Mar 2025", "Live", "Featured"),
        record("2", "Premier League", "Football", "Aug 2024 – May 2025", "Live", "Featured"),
        record("3", "Wimbledon", "Tennis", "30 Jun – 13 Jul 2025", "Upcoming", "Standard"),
        record("4", "Formula 1 World Championship", "Formula 1", "Mar – Dec 2025", "Live", "Featured"),
      ],
      advertisements: [
        record("1", "Homepage Leaderboard", "Global Sports Co.", "Homepage", "Active", "24 Jun"),
        record("2", "Article Sidebar", "Velocity Energy", "Article", "Scheduled", "1 Jul"),
        record("3", "Mobile Interstitial", "Champion Sportswear", "Mobile", "Active", "30 Jun"),
      ],
      staff: [
        record("1", "Bilal Ahmed", "superadmin@tmnsports.com", "Super Admin", "Active", "2 hours ago"),
        record("2", "Nadia Rahman", "nadia.rahman@tmnsports.com", "Staff Admin", "Active", "6 hours ago"),
        record("3", "Omar Siddiqui", "omar.siddiqui@tmnsports.com", "Staff Admin", "Active", "Yesterday"),
        record("4", "Grace Mutiso", "grace.mutiso@tmnsports.com", "Super Admin", "Active", "3 days ago"),
      ],
      authors: [
        record("1", "Arif Hossain", "Senior Cricket Correspondent", "412 articles", "Active", "Today"),
        record("2", "Lena Ford", "Chief Features Writer", "187 articles", "Active", "Yesterday"),
        record("3", "Daniel Okoye", "Data & Statistics Editor", "236 articles", "Active", "2 days ago"),
        record("4", "Saad Mehmood", "Pakistan Super League Reporter", "158 articles", "Active", "3 days ago"),
        record("5", "Priya Nair", "Live Match Editor", "301 articles", "Active", "4 days ago"),
        record("6", "Tom Whitfield", "Australia & Ashes Correspondent", "269 articles", "Active", "5 days ago"),
      ],
      activity: activity.map((entry, index) =>
        record(String(index + 1), `${entry.actor} ${entry.action}`, entry.target, entry.actor, "Active", entry.absolute),
      ),
    },
  };
}

type GlobalWithStore = typeof globalThis & { __tmnAdminStore?: Store };
const holder = globalThis as GlobalWithStore;

/** Process-wide mock database so create/edit/delete are visible while no Laravel API is configured. */
export function mockStore(): Store {
  holder.__tmnAdminStore ??= seed();
  return holder.__tmnAdminStore;
}
