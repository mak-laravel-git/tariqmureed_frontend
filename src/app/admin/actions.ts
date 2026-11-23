"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, apiPost } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import {
  deleteRecord,
  pageLabels,
  resetPage,
  runSync,
  savePage,
  saveRecord,
  savePermissions,
  saveSettings,
  updatePassword,
  updateProfile,
  uploadMedia,
} from "@/lib/admin/data";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { clearAdminToken, getAdminToken, MOCK_TOKEN, mockAccounts, setAdminToken } from "@/lib/admin/session";
import type { FormState, RecordInput } from "@/lib/admin/types";

const text = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();

function failure(error: unknown, fallback = "Something went wrong. Please try again."): FormState {
  return { status: "error", message: error instanceof ApiError && error.status && error.status < 500 ? error.message : fallback };
}

/** Stories, categories and authors feed the public news pages: refresh their cache right after a change. */
function refreshPublicStories(resource: string): void {
  if (["content", "categories", "authors"].includes(resource)) {
    updateTag("articles");
    updateTag("writers");
  }

  if (resource === "advertisements") {
    updateTag("ads");
  }
}

/** Only allow redirects back into the admin area. */
function safeNext(value: string): string {
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Enter your email address and password." };
  }

  if (apiConfig.useMocks) {
    if (mockAccounts[email.toLowerCase()] !== password) {
      return { status: "error", message: "These credentials do not match our records." };
    }

    await setAdminToken(MOCK_TOKEN);
  } else {
    try {
      const result = await apiPost<{ token: string; expires_at?: string | null }>(
        "auth/login",
        { email, password, device_name: "tmn-admin" },
        { fallback: () => ({ token: MOCK_TOKEN }) },
      );

      await setAdminToken(result.token, result.expires_at);
    } catch (error) {
      return failure(error, "We could not sign you in right now. Please try again.");
    }
  }

  redirect(safeNext(text(formData, "next")));
}

export async function logoutAction(): Promise<void> {
  const token = await getAdminToken();

  if (token && token !== MOCK_TOKEN && !apiConfig.useMocks) {
    try {
      await fetch(`${apiConfig.baseUrl}/auth/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(apiConfig.timeoutMs),
      });
    } catch {
      // The cookie is removed below even when the API is unreachable.
    }
  }

  await clearAdminToken();
  redirect("/admin/login");
}

export async function saveRecordAction(
  resource: string,
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isResourceKey(resource) || resources[resource].readOnly) {
    return { status: "error", message: "This record cannot be edited." };
  }

  const input: RecordInput = {
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    owner: text(formData, "owner"),
    status: text(formData, "status") || "Draft",
    notes: text(formData, "notes"),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    tags: text(formData, "tags"),
    publishAt: text(formData, "publishAt"),
    image: text(formData, "image"),
    adType: text(formData, "adType"),
    linkUrl: text(formData, "linkUrl"),
    adsenseSlot: text(formData, "adsenseSlot"),
    startsAt: text(formData, "startsAt"),
    endsAt: text(formData, "endsAt"),
  };

  if (!input.title) {
    return { status: "error", message: "A name or title is required." };
  }

  try {
    await saveRecord(resource, id, input);
  } catch (error) {
    return failure(error);
  }

  refreshPublicStories(resource);

  redirect(`/admin/${resource}?saved=1`);
}

export async function deleteRecordAction(resource: string, id: string): Promise<void> {
  if (isResourceKey(resource) && !resources[resource].readOnly) {
    await deleteRecord(resource, id);
    refreshPublicStories(resource);
  }

  redirect(`/admin/${resource}?deleted=1`);
}

export async function saveSettingsAction(_previous: FormState, formData: FormData): Promise<FormState> {
  try {
    await saveSettings({
      websiteName: text(formData, "websiteName"),
      contactEmail: text(formData, "contactEmail"),
      contactAddress: text(formData, "contactAddress"),
      description: text(formData, "description"),
      defaultStatus: text(formData, "defaultStatus"),
      timezone: text(formData, "timezone"),
      requireApproval: formData.get("requireApproval") === "on",
      notifyEditors: formData.get("notifyEditors") === "on",
      gaMeasurementId: text(formData, "gaMeasurementId"),
      adsenseClientId: text(formData, "adsenseClientId"),
      consentMode: text(formData, "consentMode") === "google" ? "google" : "builtin",
    });
  } catch (error) {
    return failure(error);
  }

  // The public site caches these (banner, Google tags, contact card): refresh them right away.
  updateTag("settings");

  return { status: "success", message: "Settings saved. The website now uses the new values." };
}

export async function savePageAction(slug: string, _previous: FormState, formData: FormData): Promise<FormState> {
  if (!(slug in pageLabels)) {
    return { status: "error", message: "This page cannot be edited." };
  }

  const title = text(formData, "title");
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    return { status: "error", message: "A title and the page text are required." };
  }

  try {
    await savePage(slug, { title, description: text(formData, "description"), content });
  } catch (error) {
    return failure(error);
  }

  updateTag("pages");

  return { status: "success", message: "Page saved. It is live on the website now." };
}

export async function resetPageAction(slug: string): Promise<void> {
  if (slug in pageLabels) {
    await resetPage(slug);
    updateTag("pages");
  }

  redirect(`/admin/pages/${slug}?reset=1`);
}

export async function savePermissionsAction(role: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const granted: Record<string, string[]> = {};

  for (const entry of formData.getAll("permission")) {
    const [moduleKey, action] = String(entry).split(":");

    if (moduleKey && action) {
      (granted[moduleKey] ??= []).push(action);
    }
  }

  try {
    await savePermissions(role, granted);
  } catch (error) {
    return failure(error);
  }

  return { status: "success", message: "Permissions saved." };
}

export async function updateProfileAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const email = text(formData, "email");

  if (!name || !email) {
    return { status: "error", message: "Name and email address are required." };
  }

  try {
    await updateProfile({ name, email, jobTitle: text(formData, "jobTitle"), bio: text(formData, "bio") });
  } catch (error) {
    return failure(error);
  }

  return { status: "success", message: "Profile updated." };
}

export async function updatePasswordAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!current || !password) {
    return { status: "error", message: "Enter your current and new password." };
  }
  if (password.length < 8) {
    return { status: "error", message: "The new password must be at least 8 characters." };
  }
  if (password !== confirmation) {
    return { status: "error", message: "The new passwords do not match." };
  }

  try {
    await updatePassword({ current, password, confirmation });
  } catch (error) {
    return failure(error);
  }

  return { status: "success", message: "Password updated." };
}

export async function uploadMediaAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image to upload." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { status: "error", message: "Images must be 10 MB or smaller." };
  }

  try {
    await uploadMedia(formData);
  } catch (error) {
    return failure(error);
  }

  redirect("/admin/media?uploaded=1");
}

export async function syncAction(): Promise<void> {
  try {
    await runSync();
  } catch (error) {
    const message = failure(error, "The synchronisation could not be started.").message ?? "";
    redirect(`/admin/integrations?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/integrations?synced=1");
}
