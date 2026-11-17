import "server-only";

import { apiConfig } from "@/lib/api/config";

import { adminRequest, adminRequestRaw } from "./api";
import {
  buildMockPermissions,
  mockDashboard,
  mockIntegration,
  mockMedia,
  mockNotifications,
  mockStore,
} from "./mock";
import { resources, tabStatuses } from "./resources";
import { getAdminToken } from "./session";
import type {
  AdminNotification,
  AdminRecord,
  AdminUser,
  Dashboard,
  HistoryEntry,
  IntegrationStatus,
  MediaAsset,
  PermissionMatrix,
  RecordInput,
  RecordList,
  ResourceKey,
  SiteSettings,
  StatusTab,
} from "./types";

export const PER_PAGE = 10;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Signed-in administrator (GET /auth/me), falling back to the mock profile. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (apiConfig.useMocks) {
    return (await getAdminToken()) ? mockStore().user : null;
  }

  const token = await getAdminToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${apiConfig.baseUrl}/auth/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(apiConfig.timeoutMs),
  });

  if (!response.ok) {
    return null;
  }

  const { data } = (await response.json()) as { data: { id: number; name: string; email: string; roles?: string[] } };
  const role = (data.roles?.[0] ?? "admin").replace(/-/g, " ");

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    initials: initials(data.name),
    role: role.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    jobTitle: "",
    bio: "",
  };
}

export async function listRecords(
  resource: ResourceKey,
  params: { tab: StatusTab; q?: string; page: number },
): Promise<RecordList> {
  const config = resources[resource];

  if (apiConfig.useMocks) {
    const statuses = tabStatuses[params.tab];
    const query = params.q?.trim().toLowerCase();

    const matching = mockStore().records[resource].filter(
      (entry) =>
        (!statuses || statuses.includes(entry.status)) &&
        (!query || [entry.title, entry.subtitle, entry.owner].some((value) => value.toLowerCase().includes(query))),
    );

    return {
      total: matching.length,
      records: matching.slice((params.page - 1) * PER_PAGE, params.page * PER_PAGE),
    };
  }

  const body = (await adminRequestRaw(config.apiPath, {
    query: { tab: params.tab, q: params.q, page: params.page, per_page: PER_PAGE },
    fallback: () => [],
  })) as { data: AdminRecord[]; meta?: { total?: number } };

  return { records: body.data, total: body.meta?.total ?? body.data.length };
}

export async function getRecord(resource: ResourceKey, id: string): Promise<AdminRecord | null> {
  if (apiConfig.useMocks) {
    return mockStore().records[resource].find((entry) => entry.id === id) ?? null;
  }

  try {
    return await adminRequest<AdminRecord>(`${resources[resource].apiPath}/${encodeURIComponent(id)}`, { fallback: () => null as never });
  } catch {
    return null;
  }
}

export async function saveRecord(resource: ResourceKey, id: string | null, input: RecordInput): Promise<AdminRecord> {
  return adminRequest<AdminRecord>(id ? `${resources[resource].apiPath}/${encodeURIComponent(id)}` : resources[resource].apiPath, {
    method: id ? "PUT" : "POST",
    body: input,
    fallback: () => {
      const store = mockStore();
      const list = store.records[resource];
      const existing = id ? list.find((entry) => entry.id === id) : undefined;

      if (existing) {
        Object.assign(existing, input, { updatedAt: "Just now" });
        return existing;
      }

      store.nextId += 1;
      const created: AdminRecord = { id: String(store.nextId), ...input, updatedAt: "Just now" };
      list.unshift(created);

      return created;
    },
  });
}

export async function deleteRecord(resource: ResourceKey, id: string): Promise<void> {
  await adminRequest<null>(`${resources[resource].apiPath}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    fallback: () => {
      const list = mockStore().records[resource];
      const index = list.findIndex((entry) => entry.id === id);

      if (index >= 0) {
        list.splice(index, 1);
      }

      return null;
    },
  });
}

/** Recent history timeline on the record detail page (GET {resource}/{id}/history). */
export function buildHistory(record: AdminRecord, actor: string): HistoryEntry[] {
  return [
    { title: "Record updated", meta: `${actor} · ${record.updatedAt}` },
    { title: `Status changed to ${record.status}`, meta: "Nadia Rahman · Yesterday" },
    { title: "Record created", meta: "Omar Siddiqui · 12 Jun 2025" },
  ];
}

export async function getDashboard(): Promise<Dashboard> {
  return adminRequest<Dashboard>("dashboard", { fallback: () => mockDashboard });
}

export async function getNotifications(): Promise<AdminNotification[]> {
  return adminRequest<AdminNotification[]>("notifications", { fallback: () => mockNotifications });
}

export async function getMedia(): Promise<MediaAsset[]> {
  return adminRequest<MediaAsset[]>("media", { fallback: () => mockMedia });
}

export async function uploadMedia(form: FormData): Promise<void> {
  await adminRequest<null>("media", { method: "POST", form, fallback: () => null });
}

export async function getIntegration(): Promise<IntegrationStatus> {
  return adminRequest<IntegrationStatus>("integrations/sportmonks", { fallback: () => mockIntegration });
}

export async function runSync(): Promise<void> {
  await adminRequest<null>("integrations/sportmonks/sync", { method: "POST", fallback: () => null });
}

export async function getSettings(): Promise<SiteSettings> {
  return adminRequest<SiteSettings>("settings", { fallback: () => mockStore().settings });
}

export async function saveSettings(input: SiteSettings): Promise<void> {
  await adminRequest<SiteSettings>("settings", {
    method: "PUT",
    body: input,
    fallback: () => Object.assign(mockStore().settings, input),
  });
}

export async function getPermissions(role: string | undefined): Promise<PermissionMatrix> {
  return adminRequest<PermissionMatrix>("roles/permissions", {
    query: { role },
    fallback: () => buildMockPermissions(role ?? "staff-admin"),
  });
}

export async function savePermissions(role: string, granted: Record<string, string[]>): Promise<void> {
  await adminRequest<null>(`roles/${encodeURIComponent(role)}/permissions`, {
    method: "PUT",
    body: { permissions: granted },
    fallback: () => null,
  });
}

export async function updateProfile(input: { name: string; email: string; jobTitle: string; bio: string }): Promise<void> {
  await adminRequest<null>("profile", {
    method: "PUT",
    body: input,
    fallback: () => {
      const user = mockStore().user;
      user.name = input.name;
      user.email = input.email;
      user.jobTitle = input.jobTitle;
      user.bio = input.bio;
      user.initials = initials(input.name);

      return null;
    },
  });
}

export async function updatePassword(input: { current: string; password: string; confirmation: string }): Promise<void> {
  await adminRequest<null>("profile/password", {
    method: "PUT",
    body: {
      current_password: input.current,
      password: input.password,
      password_confirmation: input.confirmation,
    },
    fallback: () => null,
  });
}
