import type { SampleCreative } from "@/components/ui/SampleAd";

/**
 * Every place on the website that can show an advertisement. The keys match App\Support\AdPlacements in the
 * Laravel app, which is where the dashboard's "Where it appears" list comes from; this copy gives each placement
 * its banner size and a label for the mock admin, and the dummy ad shown while nothing is running there.
 */

export interface SampleBox {
  creative: SampleCreative;
  /** A wide banner, a 300 x 250 style box or a short sidebar strip. */
  shape: "banner" | "rectangle" | "strip";
  /** The height the box keeps. */
  className: string;
}

interface Placement {
  label: string;
  width: number;
  height: number;
  sample: SampleBox;
}

const rectangle = (creative: SampleCreative, className = "min-h-[268px]"): SampleBox => ({ creative, shape: "rectangle", className });
const strip = (creative: SampleCreative): SampleBox => ({ creative, shape: "strip", className: "min-h-[136px]" });

export const adPlacements = {
  "home-top": {
    label: "Home page: top banner",
    width: 970,
    height: 90,
    sample: { creative: "rankings", shape: "banner", className: "min-h-[126px]" },
  },
  "home-sidebar-top": { label: "Home page: Latest News sidebar, first box", width: 300, height: 250, sample: rectangle("live") },
  "home-sidebar-bottom": { label: "Home page: Latest News sidebar, second box", width: 300, height: 250, sample: rectangle("sponsor") },
  "home-stats": { label: "Home page: Stats section sidebar", width: 300, height: 250, sample: rectangle("live") },
  "home-team": {
    label: "Home page: Team fixtures box",
    width: 300,
    height: 250,
    sample: rectangle("rankings", "min-h-[200px] lg:min-h-[250px]"),
  },
  "home-bottom": {
    label: "Home page: bottom banner above the footer",
    width: 728,
    height: 90,
    sample: { creative: "sponsor", shape: "banner", className: "min-h-[140px] sm:min-h-[156px]" },
  },
  "news-sidebar": { label: "News page: sidebar", width: 320, height: 128, sample: strip("live") },
  "article-sidebar": { label: "Article page: sidebar above related stories", width: 320, height: 128, sample: strip("rankings") },
  "match-sidebar": { label: "Match page: below the match details", width: 320, height: 128, sample: strip("sponsor") },
  "series-sidebar": { label: "Series page: sidebar", width: 320, height: 128, sample: strip("rankings") },
  "team-sidebar": { label: "Team page: sidebar", width: 320, height: 128, sample: strip("live") },
  "legal-sidebar": { label: "Privacy, Cookie and Terms pages: sidebar", width: 300, height: 250, sample: rectangle("sponsor", "min-h-[260px]") },
} as const satisfies Record<string, Placement>;

export type AdPlacement = keyof typeof adPlacements;
