import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";

import { adminRequest, adminRequestRaw } from "./api";
import type { CropRect } from "./crop";
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
import { adPlacements } from "@/lib/ads";
import type {
  AdminNotification,
  AdminSeo,
  AdminSeoPage,
  SeriesArrangement,
  HomeTeamChoice,
  AdOptions,
  AdPlacementOption,
  ArticleOptions,
  AdminPage,
  AdminPageSummary,
  AdminRecord,
  AdminUser,
  Dashboard,
  StaffInput,
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

/** Pages editable in the dashboard (kept in step with SitePage::SLUGS in the Laravel app). */
export const pageLabels: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "cookie-preferences": "Cookie Preferences",
  "terms-of-use": "Terms of Use",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface MePayload {
  data: { id: number; name: string; email: string; roles?: string[] };
}

/**
 * Signed-in administrator (GET /auth/me), falling back to the mock profile. Null means "not signed in"; an
 * ApiError means the server could not say, which must not sign anyone out. One request per page view, however
 * many components ask.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  if (apiConfig.useMocks) {
    return (await getAdminToken()) ? mockStore().user : null;
  }

  const token = await getAdminToken();

  if (!token) {
    return null;
  }

  let payload: MePayload;

  try {
    const response = await fetch(`${apiConfig.baseUrl}/auth/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(apiConfig.adminTimeoutMs),
    });

    if (response.status === 401 || response.status === 403) {
      return null;
    }

    if (!response.ok) {
      throw new ApiError(`The server responded with ${response.status}.`, response.status);
    }

    payload = (await response.json()) as MePayload;
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError("The server did not answer.");
  }

  const { data } = payload;
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
});

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
        Object.assign(existing, input, { isFeatured: input.isFeatured === "1", isBreaking: input.isBreaking === "1", noindex: input.noindex === "1", updatedAt: "Just now" });
        return existing;
      }

      store.nextId += 1;
      const created: AdminRecord = {
        id: String(store.nextId),
        ...input,
        isFeatured: input.isFeatured === "1",
        isBreaking: input.isBreaking === "1",
        noindex: input.noindex === "1",
        updatedAt: "Just now",
      };
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

/** Creates a staff account (POST /admin/staff) or saves changes to one (PUT /admin/staff/{id}). */
export async function saveStaff(id: string | null, input: StaffInput): Promise<void> {
  await adminRequest<AdminRecord | null>(id ? `staff/${encodeURIComponent(id)}` : "staff", {
    method: id ? "PUT" : "POST",
    body: input,
    fallback: () => {
      const store = mockStore();
      const details = { title: input.title, subtitle: input.subtitle, owner: input.owner, role: input.owner, updatedAt: "Just now" };
      const existing = id ? store.records.staff.find((entry) => entry.id === id) : undefined;

      if (existing) {
        Object.assign(existing, details);
      } else {
        store.nextId += 1;
        store.records.staff.unshift({ id: String(store.nextId), status: "Active", ...details });
      }

      return null;
    },
  });
}

export async function getDashboard(): Promise<Dashboard> {
  return adminRequest<Dashboard>("dashboard", { fallback: () => mockDashboard });
}

export async function getNotifications(): Promise<AdminNotification[]> {
  try {
    return await adminRequest<AdminNotification[]>("notifications", { fallback: () => mockNotifications });
  } catch {
    // No notifications endpoint yet (404), or a transient API failure: keep the shell usable.
    return [];
  }
}

export async function getMedia(): Promise<MediaAsset[]> {
  return adminRequest<MediaAsset[]>("media", { fallback: () => mockMedia });
}

export async function deleteMedia(id: string): Promise<void> {
  await adminRequest<null>(`media/${encodeURIComponent(id)}`, {
    method: "DELETE",
    fallback: () => {
      const index = mockMedia.findIndex((asset) => asset.id === id);

      if (index >= 0) {
        mockMedia.splice(index, 1);
      }

      return null;
    },
  });
}

/** Where an ad can run, and the images the advertisement editor offers. */
export async function getAdOptions(): Promise<AdOptions> {
  const [body, media] = await Promise.all([
    adminRequestRaw("advertisements/placements", {
      fallback: () =>
        Object.entries(adPlacements).map(([key, placement]) => ({
          key,
          label: placement.label,
          size: `${placement.width} x ${placement.height}`,
        })),
    }) as Promise<{ data: AdPlacementOption[] }>,
    getMedia(),
  ]);

  return { placements: body.data, media };
}

/** Categories, authors and images the article editor offers. */
export async function getArticleOptions(): Promise<ArticleOptions> {
  const names = async (apiPath: string, mocked: string[]): Promise<string[]> => {
    const body = (await adminRequestRaw(apiPath, {
      query: { per_page: 100 },
      fallback: () => mocked.map((title) => ({ title })),
    })) as { data: { title: string }[] };

    return body.data.map((entry) => entry.title);
  };

  const [categories, authors, media, tags] = await Promise.all([
    names("categories", ["Cricket", "Football", "Tennis"]),
    names("writers", ["Bilal Ahmed"]),
    getMedia(),
    adminRequestRaw("articles/tags", { fallback: () => ["IPL 2026", "Premier League", "Transfer News"] }) as Promise<{ data: string[] }>,
  ]);

  return { categories, authors, media, tags: tags.data };
}

/** Adds an image to the media library and returns the saved asset. */
export async function uploadMedia(form: FormData): Promise<MediaAsset> {
  return adminRequest<MediaAsset>("media", {
    method: "POST",
    form,
    fallback: () => ({ id: `mock-${Date.now()}`, title: "Uploaded image", meta: "Mock · 0 KB", url: null }),
  });
}

/** The full picture to crop for an image address; fails for linked pictures and GIFs. */
export async function getImageSource(url: string): Promise<MediaAsset> {
  return adminRequest<MediaAsset>("media/source", {
    query: { url },
    fallback: () => {
      const asset = mockMedia.find((entry) => entry.url === url);

      if (!asset) {
        throw new ApiError("This image cannot be cropped.", 404);
      }

      return asset;
    },
  });
}

/** Saves a rectangle of a library picture (in its own pixels) as a new file. */
export async function cropImage(id: string, area: CropRect): Promise<MediaAsset> {
  return adminRequest<MediaAsset>(`media/${encodeURIComponent(id)}/crop`, {
    method: "POST",
    body: area,
    // Without an API there is no file to cut, so the mock keeps the full picture.
    fallback: () => mockMedia.find((entry) => entry.id === id) ?? { id, title: "Cropped image", meta: "Mock · 0 KB", url: null },
  });
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

export async function saveSettings(input: Partial<SiteSettings>): Promise<void> {
  await adminRequest<SiteSettings>("settings", {
    method: "PUT",
    body: input,
    fallback: () => Object.assign(mockStore().settings, input),
  });
}

/** Competitions on show in the website's series strip (in order) and the hidden ones (GET /admin/competitions/arrangement). */
export async function getSeriesArrangement(): Promise<SeriesArrangement> {
  return adminRequest<SeriesArrangement>("competitions/arrangement", {
    fallback: () => ({
      visible: [{ id: "1", name: "Andhra T20 League", detail: "T20", status: "Upcoming" }],
      hidden: [{ id: "2", name: "Sample Series", detail: "ODI", status: "No matches yet" }],
    }),
  });
}

/** Saves which competitions show in the strip and in what order; every other one is hidden. */
export async function saveSeriesArrangement(visible: number[]): Promise<void> {
  await adminRequest<SeriesArrangement>("competitions/arrangement", {
    method: "PUT",
    body: { visible },
    fallback: () => ({ visible: [], hidden: [] }),
  });
}

/** Teams of the home page's Team Fixtures section and the ones to choose from (GET /admin/home-teams). */
export async function getHomeTeamChoice(): Promise<HomeTeamChoice> {
  return adminRequest<HomeTeamChoice>("home-teams", {
    fallback: () => ({
      limit: 15,
      selected: [{ id: "1", name: "India", detail: "International", matches: 4 }],
      available: [{ id: "2", name: "Australia", detail: "International", matches: 2 }],
      automatic: [],
    }),
  });
}

/** Saves which teams the home page shows and in what order; an empty list returns to the automatic choice. */
export async function saveHomeTeams(teams: number[]): Promise<void> {
  await adminRequest<HomeTeamChoice>("home-teams", {
    method: "PUT",
    body: { teams },
    fallback: () => ({ limit: 15, selected: [], available: [], automatic: [] }),
  });
}

/** Search and share text of every page plus the site's SEO health checks (GET /admin/seo). */
export async function getAdminSeo(): Promise<AdminSeo> {
  return adminRequest<AdminSeo>("seo", {
    fallback: () => ({
      pages: [{ path: "/", label: "Home", defaultTitle: "TMN Sport", defaultDescription: "Live cricket scores, news and statistics.", title: "", description: "", image: "", noindex: false }],
      health: [{ key: "indexing", label: "Search engines are allowed", status: "good", detail: "The site can appear in Google and Bing." }],
    }),
  });
}

/** Saves the global SEO settings and the text of every page. */
export async function saveSeo(settings: Partial<SiteSettings>, pages: Pick<AdminSeoPage, "path" | "title" | "description" | "image" | "noindex">[]): Promise<void> {
  await adminRequest<SiteSettings>("settings", {
    method: "PUT",
    body: settings,
    fallback: () => Object.assign(mockStore().settings, settings),
  });
  await adminRequest<AdminSeo>("seo", { method: "PUT", body: { pages }, fallback: () => ({ pages: [], health: [] }) });
}

/** The legal pages the dashboard can edit, and whether each one has been customised. */
export async function listPages(): Promise<AdminPageSummary[]> {
  return adminRequest<AdminPageSummary[]>("pages", {
    fallback: () =>
      Object.entries(pageLabels).map(([slug, label]) => {
        const saved = mockStore().pages[slug];

        return { slug, label, customised: Boolean(saved), updatedAt: saved?.updatedAt ?? null };
      }),
  });
}

/** The saved text of a page, or null while the website's built-in text is still in use. */
export async function getPage(slug: string): Promise<AdminPage | null> {
  try {
    return await adminRequest<AdminPage | null>(`pages/${encodeURIComponent(slug)}`, {
      fallback: () => mockStore().pages[slug] ?? null,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function savePage(slug: string, input: { title: string; description: string; content: string }): Promise<void> {
  await adminRequest<AdminPage>(`pages/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: input,
    fallback: () => (mockStore().pages[slug] = { slug, ...input, updatedAt: "Just now" }),
  });
}

/** Deletes the saved text so the website's built-in text is used again. */
export async function resetPage(slug: string): Promise<void> {
  await adminRequest<null>(`pages/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    fallback: () => {
      delete mockStore().pages[slug];

      return null;
    },
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
