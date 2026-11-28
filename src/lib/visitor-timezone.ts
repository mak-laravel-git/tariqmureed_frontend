import "server-only";

import { cookies } from "next/headers";

import { apiConfig } from "@/lib/api/config";
import { isTimeZone, TIMEZONE_COOKIE } from "@/lib/moment";

/** The visitor's time zone as their browser reported it, else the site's own. Makes the caller per-request. */
export async function visitorTimezone(): Promise<string> {
  const reported = (await cookies()).get(TIMEZONE_COOKIE)?.value;

  return reported && isTimeZone(reported) ? reported : apiConfig.timezone;
}
