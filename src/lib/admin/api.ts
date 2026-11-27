import "server-only";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";

import { getAdminToken } from "./session";

interface RequestOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | null | undefined>;
  body?: unknown;
  /** Multipart body (file uploads); mutually exclusive with `body`. */
  form?: FormData;
  /** Answer used while no API_URL is configured. */
  fallback: () => T | Promise<T>;
}

function buildUrl(path: string, query?: RequestOptions<unknown>["query"]): string {
  const url = new URL(`${apiConfig.baseUrl}/admin/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/** Extracts the first validation message from a Laravel 422 payload. */
function errorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const { errors, message } = payload as { errors?: Record<string, string[]>; message?: string };
    const first = errors ? Object.values(errors)[0]?.[0] : undefined;

    if (first) {
      return first;
    }
    if (message) {
      return message;
    }
  }

  return `The server responded with ${status}.`;
}

/**
 * Calls the authenticated Laravel admin API ({API_URL}/admin/...). Redirects to the login page
 * when the session cookie is missing or rejected, and returns the raw JSON body.
 */
export async function adminRequestRaw<T>(path: string, options: RequestOptions<T>): Promise<unknown> {
  if (apiConfig.useMocks) {
    return { data: await options.fallback() };
  }

  const token = await getAdminToken();

  if (!token) {
    redirect("/admin/login");
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    signal: AbortSignal.timeout(apiConfig.adminTimeoutMs),
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/admin/login?expired=1");
  }

  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.status), response.status);
  }

  return payload;
}

export async function adminRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const payload = await adminRequestRaw(path, options);

  return (payload && typeof payload === "object" && "data" in payload ? (payload as { data: T }).data : payload) as T;
}
