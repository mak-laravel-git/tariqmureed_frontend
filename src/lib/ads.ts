/**
 * Every place on the website that can show an advertisement. The keys match App\Support\AdPlacements in the
 * Laravel app, which is where the dashboard's "Where it appears" list comes from; this copy gives each placement
 * its banner size and a label for the mock admin, and the design of the box drawn while nothing is running there.
 */

export interface PlaceholderBox {
  /** Format line under "Advertisement", e.g. "300 × 250 — Medium Rectangle". A bare box has none. */
  format?: string;
  /** Small line under the format; only shown together with it. */
  note?: string;
  className: string;
}

interface Placement {
  label: string;
  width: number;
  height: number;
  placeholder: PlaceholderBox;
}

const rectangle = "300 × 250 — Medium Rectangle";
const noCreative = "Sponsored · no creative available";
const noNetworkCreative = "TMN Ad Network · no creative available";
const sidebarStrip = "h-32 min-h-[128px] rounded-[4px] py-0";

export const adPlacements = {
  "home-top": {
    label: "Home page: top banner",
    width: 970,
    height: 90,
    placeholder: { format: "970 × 90 — Leaderboard", note: noCreative, className: "py-8" },
  },
  "home-sidebar-top": {
    label: "Home page: Latest News sidebar, first box",
    width: 300,
    height: 250,
    placeholder: { format: rectangle, note: noCreative, className: "min-h-[268px]" },
  },
  "home-sidebar-bottom": {
    label: "Home page: Latest News sidebar, second box",
    width: 300,
    height: 250,
    placeholder: { format: rectangle, note: noCreative, className: "min-h-[268px]" },
  },
  "home-stats": {
    label: "Home page: Stats section sidebar",
    width: 300,
    height: 250,
    placeholder: { format: rectangle, note: noCreative, className: "min-h-[268px]" },
  },
  "home-team": {
    label: "Home page: Team fixtures box",
    width: 300,
    height: 250,
    placeholder: { format: rectangle, note: noNetworkCreative, className: "min-h-[183px] lg:min-h-[250px]" },
  },
  "home-bottom": {
    label: "Home page: bottom banner above the footer",
    width: 728,
    height: 90,
    placeholder: { format: "728 × 90 — Footer banner", note: noNetworkCreative, className: "min-h-[110px] sm:min-h-[156px]" },
  },
  "news-sidebar": { label: "News page: sidebar", width: 320, height: 128, placeholder: { className: "h-32" } },
  "article-sidebar": {
    label: "Article page: sidebar above related stories",
    width: 320,
    height: 128,
    placeholder: { className: "h-32" },
  },
  "match-sidebar": { label: "Match page: below the match details", width: 320, height: 128, placeholder: { className: sidebarStrip } },
  "series-sidebar": { label: "Series page: sidebar", width: 320, height: 128, placeholder: { className: sidebarStrip } },
  "team-sidebar": { label: "Team page: sidebar", width: 320, height: 128, placeholder: { className: sidebarStrip } },
  "legal-sidebar": {
    label: "Privacy, Cookie and Terms pages: sidebar",
    width: 300,
    height: 250,
    placeholder: { format: rectangle, note: noCreative, className: "min-h-[260px] rounded-lg tracking-[0.1em] uppercase" },
  },
} as const satisfies Record<string, Placement>;

export type AdPlacement = keyof typeof adPlacements;
