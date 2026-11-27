import "server-only";

const rawBaseUrl = (process.env.API_URL ?? "").trim().replace(/\/+$/, "");

/**
 * Runtime configuration for the Laravel API client. Everything here is read on the
 * server only, so tokens and internal URLs never reach the browser bundle.
 */
export const apiConfig = {
  baseUrl: rawBaseUrl,
  /** No API_URL configured: serve the bundled mock data. */
  useMocks: rawBaseUrl === "",
  /** Fall back to mock data when a request fails (development convenience). */
  fallbackToMocks: process.env.API_FALLBACK_TO_MOCKS === "true",
  token: process.env.API_TOKEN?.trim() || undefined,
  timeoutMs: 8000,
  /** The admin dashboard waits longer: a slow answer is better there than a failed page or an unsaved change. */
  adminTimeoutMs: 30_000,
  timezone: process.env.SITE_TIMEZONE?.trim() || "Asia/Dhaka",
} as const;
