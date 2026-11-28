import { apiConfig } from "@/lib/api/config";
import { formatMoment, type MomentStyle } from "@/lib/moment";

import { LocalTime } from "./LocalTime";

/**
 * When a match starts, in the visitor's time zone. Pages are cached and shared by everyone, so the server
 * writes the site's own time zone (SITE_TIMEZONE) and the browser replaces it.
 */
export function MatchTime({ iso, show }: { iso: string; show: MomentStyle }) {
  return <LocalTime iso={iso} show={show} initial={formatMoment(iso, show, apiConfig.timezone)} />;
}
