import "server-only";

import { cookies } from "next/headers";

import { apiConfig } from "@/lib/api/config";

export const SESSION_COOKIE = "tmn_admin_token";

/** Prefix of tokens issued by the built-in mock login (never accepted by the real API). */
export const MOCK_TOKEN = "mock-admin-session";

export async function getAdminToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function setAdminToken(token: string, expiresAt?: string | null): Promise<void> {
  const expires = expiresAt ? new Date(expiresAt) : undefined;

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(expires && !Number.isNaN(expires.getTime()) ? { expires } : { maxAge: 60 * 60 * 12 }),
  });
}

export async function clearAdminToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Accounts accepted by the mock login (they mirror the Laravel UserSeeder). */
export const mockAccounts: Record<string, string> = {
  "superadmin@dev.com": "superadmin@dev.com",
  "admin@dev.com": "admin@dev.com",
};

export const usingMockAuth = apiConfig.useMocks;
