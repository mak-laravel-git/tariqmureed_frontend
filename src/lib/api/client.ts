import "server-only";

import { apiConfig } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface ApiGetOptions<T> {
  /** Query string parameters; null/undefined values are skipped. */
  query?: Record<string, QueryValue>;
  /** Data used when no API is configured (or the request fails and fallback is enabled). */
  fallback: () => T | Promise<T>;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${apiConfig.baseUrl}/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * GET a resource from the Laravel API and return its payload.
 *
 * - Unwraps Laravel API Resource envelopes ({ data: ... }).
 * - Uses the `fallback` data while no API_URL is configured.
 * - Throws an ApiError on failure unless API_FALLBACK_TO_MOCKS=true.
 */
export async function apiGet<T>(path: string, options: ApiGetOptions<T>): Promise<T> {
  if (apiConfig.useMocks) {
    return options.fallback();
  }

  const url = buildUrl(path, options.query);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(apiConfig.token ? { Authorization: `Bearer ${apiConfig.token}` } : {}),
      },
      signal: AbortSignal.timeout(apiConfig.timeoutMs),
    });

    if (!response.ok) {
      throw new ApiError(`API responded with ${response.status}`, response.status, url);
    }

    const body: unknown = await response.json();

    if (body && typeof body === "object" && "data" in body) {
      return (body as { data: T }).data;
    }

    return body as T;
  } catch (error) {
    if (apiConfig.fallbackToMocks) {
      console.warn(`[api] ${url} failed, using mock data:`, error);
      return options.fallback();
    }

    throw error instanceof ApiError
      ? error
      : new ApiError(error instanceof Error ? error.message : "API request failed", undefined, url);
  }
}

interface ApiPostOptions<T> {
  /** Response used while no API is configured (or the request fails and fallback is enabled). */
  fallback: () => T | Promise<T>;
}

/**
 * POST JSON to the Laravel API. Mirrors apiGet: unwraps { data }, supports the mock
 * fallback and throws an ApiError (with the validation message, if any) on failure.
 */
export async function apiPost<T>(path: string, body: unknown, options: ApiPostOptions<T>): Promise<T> {
  if (apiConfig.useMocks) {
    return options.fallback();
  }

  const url = buildUrl(path);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(apiConfig.token ? { Authorization: `Bearer ${apiConfig.token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(apiConfig.timeoutMs),
      cache: "no-store",
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : `API responded with ${response.status}`;

      throw new ApiError(message, response.status, url);
    }

    return (payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: T }).data
      : payload) as T;
  } catch (error) {
    if (apiConfig.fallbackToMocks && !(error instanceof ApiError && error.status && error.status < 500)) {
      console.warn(`[api] POST ${url} failed, using mock data:`, error);
      return options.fallback();
    }

    throw error instanceof ApiError
      ? error
      : new ApiError(error instanceof Error ? error.message : "API request failed", undefined, url);
  }
}
