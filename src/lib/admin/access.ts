import type { AdminUser } from "./types";

/**
 * The permission each admin screen needs (the same ones the API asks for). The first match wins, so a longer
 * address comes before a shorter one. Screens not listed, such as the profile, are open to everyone signed in.
 */
const screens: [path: string, permission: string][] = [
  ["/admin/content", "articles.index"],
  ["/admin/categories", "categories.index"],
  ["/admin/media", "media.index"],
  ["/admin/authors", "writers.index"],
  ["/admin/series/arrange", "settings.view"],
  ["/admin/series", "integrations.view"],
  ["/admin/home-teams", "settings.view"],
  ["/admin/advertisements", "advertisements.index"],
  ["/admin/integrations", "integrations.view"],
  ["/admin/seo", "settings.view"],
  ["/admin/pages", "pages.view"],
  ["/admin/settings", "settings.view"],
  ["/admin/staff", "users.index"],
  ["/admin/roles", "roles.view"],
  ["/admin/activity", "activity.index"],
];

/**
 * Whether the signed-in account's role includes a screen. This only decides what the menu offers: the API checks
 * every request itself.
 */
export function canOpen(user: AdminUser, pathname: string): boolean {
  if (user.isSuperAdmin || !user.permissions) {
    return true;
  }

  const needed =
    pathname === "/admin" ? "dashboard.view" : screens.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1];

  return needed === undefined || user.permissions.includes(needed);
}
