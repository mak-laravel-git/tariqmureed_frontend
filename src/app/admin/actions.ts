"use server";

import { updateTag } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { ApiError, apiPost } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type { CropRect } from "@/lib/admin/crop";
import {
  cropImage,
  deleteMedia,
  deleteRecord,
  getImageSource,
  pageLabels,
  resetPage,
  runSync,
  saveHomeTeams,
  saveLiveCentreOrder,
  saveSeo,
  saveSeriesArrangement,
  savePage,
  saveRecord,
  savePermissions,
  saveSettings,
  saveStaff,
  updatePassword,
  updateProfile,
  uploadMedia,
} from "@/lib/admin/data";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { clearAdminToken, getAdminToken, MOCK_TOKEN, mockAccounts, setAdminToken } from "@/lib/admin/session";
import type { FormState, MediaAsset, RecordInput } from "@/lib/admin/types";

const text = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();

function failure(error: unknown, fallback = "Something went wrong. Please try again."): FormState {
  return { status: "error", message: error instanceof ApiError && error.status && error.status < 500 ? error.message : fallback };
}

/**
 * The article editor's three buttons set the status: Save Draft keeps Scheduled or Archived when that is chosen in the
 * Status list (and is a draft otherwise), Submit for Approval means Pending, Publish Now means Published.
 */
function articleStatus(selected: string, intent: string): string {
  if (intent === "publish") {
    return "Published";
  }

  if (intent === "approval") {
    return "Pending";
  }

  if (intent === "draft") {
    return selected === "Scheduled" || selected === "Archived" ? selected : "Draft";
  }

  return selected;
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

/** The gallery field sends its image addresses as a JSON list. */
function parseGallery(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");

    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "") : [];
  } catch {
    return [];
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
        {
          timeoutMs: apiConfig.adminTimeoutMs,
          // With an API there is no stand-in sign-in: a failed request must not look like a successful one.
          fallback: (): { token: string; expires_at?: string | null } => {
            throw new ApiError("The server did not answer.");
          },
        },
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
    status: articleStatus(text(formData, "status") || "Draft", text(formData, "intent")),
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
    slug: text(formData, "slug"),
    imageCaption: text(formData, "imageCaption"),
    imageCredit: text(formData, "imageCredit"),
    socialImage: text(formData, "socialImage"),
    gallery: parseGallery(text(formData, "gallery")),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    isFeatured: formData.has("isFeatured") ? "1" : "0",
    isBreaking: formData.has("isBreaking") ? "1" : "0",
    noindex: formData.has("noindex") ? "1" : "0",
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

/** Returns only when the record could not be deleted, with the reason; otherwise it goes back to the list. */
export async function deleteRecordAction(resource: string, id: string): Promise<FormState> {
  if (isResourceKey(resource) && !resources[resource].readOnly) {
    try {
      await deleteRecord(resource, id);
    } catch (error) {
      // An expired session redirects to the sign-in page by throwing: let that through.
      unstable_rethrow(error);

      return failure(error, "This record could not be deleted. Please try again.");
    }

    refreshPublicStories(resource);
  }

  redirect(`/admin/${resource}?deleted=1`);
}

/** Creates or updates a staff account. */
export async function saveStaffAction(id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const input = {
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    owner: text(formData, "owner"),
    // Passwords are sent exactly as typed.
    password: String(formData.get("password") ?? ""),
    password_confirmation: String(formData.get("password_confirmation") ?? ""),
  };

  if (!input.title || !input.subtitle) {
    return { status: "error", message: "Enter the name and the email address." };
  }

  if (input.password !== input.password_confirmation) {
    return { status: "error", message: "The two passwords do not match." };
  }

  try {
    await saveStaff(id, input);
  } catch (error) {
    unstable_rethrow(error);

    return failure(error);
  }

  redirect("/admin/staff?saved=1");
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

/** Saves the SEO screen: the global search/share settings and the text of every page. */
export async function saveSeoAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const template = text(formData, "seoTitleTemplate");

  if (!template.includes("%s")) {
    return { status: "error", message: "The page title format must contain %s, where the page title goes (for example %s | TMN Sport)." };
  }

  const paths = formData.getAll("pagePath").map(String);
  const titles = formData.getAll("pageTitle").map((value) => String(value).trim());
  const descriptions = formData.getAll("pageDescription").map((value) => String(value).trim());
  const images = formData.getAll("pageImage").map((value) => String(value).trim());
  const hidden = new Set(formData.getAll("pageNoindex").map(String));

  try {
    await saveSeo(
      {
        seoSiteUrl: text(formData, "seoSiteUrl").replace(/\/+$/, ""),
        seoTitleTemplate: template,
        seoDefaultImage: text(formData, "seoDefaultImage"),
        seoTwitterHandle: text(formData, "seoTwitterHandle"),
        seoIndexing: formData.has("seoIndexing"),
        seoGoogleVerification: text(formData, "seoGoogleVerification"),
        seoBingVerification: text(formData, "seoBingVerification"),
      },
      paths.map((path, index) => ({
        path,
        title: titles[index] ?? "",
        description: descriptions[index] ?? "",
        image: images[index] ?? "",
        noindex: hidden.has(path),
      })),
    );
  } catch (error) {
    return failure(error);
  }

  // Titles, robots.txt and the sitemap are cached by the public site: refresh them right away.
  updateTag("seo");
  updateTag("settings");

  return { status: "success", message: "SEO saved. The website now uses the new titles, descriptions and search settings." };
}

/** Saves the series strip: the listed competitions are shown in that order, the rest are hidden. */
export async function saveSeriesArrangementAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let ids: number[];

  try {
    const parsed: unknown = JSON.parse(text(formData, "visible") || "[]");
    ids = Array.isArray(parsed) ? parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
  } catch {
    return { status: "error", message: "The list could not be read. Reload the page and try again." };
  }

  try {
    await saveSeriesArrangement(ids);
  } catch (error) {
    return failure(error);
  }

  // The strip, the home spotlight and the series directory are cached by the public site.
  updateTag("competitions");

  return {
    status: "success",
    message: ids.length === 0 ? "Saved. No series is shown on the website now." : `Saved. The website now shows ${ids.length} series, in this order.`,
  };
}

/** Saves the teams of the home page's Team Fixtures section, in the listed order. */
export async function saveHomeTeamsAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let ids: number[];

  try {
    const parsed: unknown = JSON.parse(text(formData, "teams") || "[]");
    ids = Array.isArray(parsed) ? parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
  } catch {
    return { status: "error", message: "The list could not be read. Reload the page and try again." };
  }

  try {
    await saveHomeTeams(ids);
  } catch (error) {
    return failure(error);
  }

  updateTag("teams");

  return {
    status: "success",
    message: ids.length === 0 ? "Saved. The home page now picks the teams automatically." : `Saved. The home page now shows ${ids.length} ${ids.length === 1 ? "team" : "teams"}, in this order.`,
  };
}

/** Saves which competitions the home page's Live Match Center puts first, in the listed order. */
export async function saveLiveCentreAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let ids: number[];

  try {
    const parsed: unknown = JSON.parse(text(formData, "leagues") || "[]");
    ids = Array.isArray(parsed) ? parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
  } catch {
    return { status: "error", message: "The list could not be read. Reload the page and try again." };
  }

  try {
    await saveLiveCentreOrder(ids);
  } catch (error) {
    return failure(error);
  }

  updateTag("matches");

  return {
    status: "success",
    message: ids.length === 0 ? "Saved. Live matches and results show internationals first, then league matches." : `Saved. ${ids.length} ${ids.length === 1 ? "competition goes" : "competitions go"} first in live matches and results, in this order.`,
  };
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
  const hasFile = file instanceof File && file.size > 0;

  if (!hasFile && !text(formData, "url")) {
    return { status: "error", message: "Choose an image to upload, or paste the address of an image." };
  }
  if (hasFile && file.size > 10 * 1024 * 1024) {
    return { status: "error", message: "Images must be 10 MB or smaller." };
  }
  if (!hasFile) {
    formData.delete("file");
  }

  try {
    await uploadMedia(formData);
  } catch (error) {
    return failure(error);
  }

  redirect("/admin/media?uploaded=1");
}

/** Upload from an image field inside an editor: saves the picture to the media library and returns it to the field. */
export async function uploadImageAction(formData: FormData): Promise<{ asset?: MediaAsset; error?: string }> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Images must be 10 MB or smaller." };
  }

  try {
    return { asset: await uploadMedia(formData) };
  } catch (error) {
    return { error: failure(error, "The image could not be uploaded.").message };
  }
}

/** The full picture behind an image address, for the crop window. */
export async function imageSourceAction(url: string): Promise<{ asset?: MediaAsset; error?: string }> {
  try {
    return { asset: await getImageSource(url) };
  } catch (error) {
    // 404 = not a croppable Media Library file. The API words every 404 the same, so explain it here.
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Only JPG, PNG and WebP images stored in the Media Library can be cropped." };
    }

    return { error: failure(error, "The image could not be opened for cropping.").message };
  }
}

export async function cropImageAction(id: string, area: CropRect): Promise<{ asset?: MediaAsset; error?: string }> {
  try {
    return { asset: await cropImage(id, area) };
  } catch (error) {
    return { error: failure(error, "The image could not be cropped.").message };
  }
}

export async function deleteMediaAction(id: string): Promise<void> {
  try {
    await deleteMedia(id);
  } catch {
    redirect("/admin/media?error=1");
  }

  updateTag("articles");
  redirect("/admin/media?removed=1");
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
