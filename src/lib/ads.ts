/**
 * Every place on the website that can show an advertisement. The keys match App\Support\AdPlacements in the
 * Laravel app, which is where the dashboard's "Where it appears" list comes from; this copy gives each placement
 * its banner size and a label for the mock admin.
 */
export const adPlacements = {
  "home-top": { label: "Home page: top banner", width: 970, height: 90 },
  "home-sidebar-top": { label: "Home page: Latest News sidebar, first box", width: 300, height: 250 },
  "home-sidebar-bottom": { label: "Home page: Latest News sidebar, second box", width: 300, height: 250 },
  "home-stats": { label: "Home page: Stats section sidebar", width: 300, height: 250 },
  "home-team": { label: "Home page: Team fixtures box", width: 300, height: 250 },
  "home-bottom": { label: "Home page: bottom banner above the footer", width: 728, height: 90 },
  "news-sidebar": { label: "News page: sidebar", width: 320, height: 128 },
  "article-sidebar": { label: "Article page: sidebar above related stories", width: 320, height: 128 },
  "match-sidebar": { label: "Match page: below the match details", width: 320, height: 128 },
  "series-sidebar": { label: "Series page: sidebar", width: 320, height: 128 },
  "team-sidebar": { label: "Team page: sidebar", width: 320, height: 128 },
  "legal-sidebar": { label: "Privacy, Cookie and Terms pages: sidebar", width: 300, height: 250 },
} as const;

export type AdPlacement = keyof typeof adPlacements;
