"use client";

import { useActionState, useState } from "react";

import { saveSeoAction } from "@/app/admin/actions";
import { cropRatios } from "@/lib/admin/crop";
import type { AdminSeo, AdminSeoPage, FormState, MediaAsset, SiteSettings } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { Card, CardHeader, Field, FormMessage, TextArea, TextInput } from "./AdminUi";
import { ImageField } from "./ImageField";
import { LengthMeter, SEO_DESCRIPTION, SEO_TITLE, SerpPreview } from "./SeoTools";

const initial: FormState = { status: "idle", message: "" };

const dot: Record<AdminSeo["health"][number]["status"], string> = {
  good: "bg-[#1a7f3d]",
  warning: "bg-[#e6a700]",
  error: "bg-[#b42318]",
  info: "bg-[#6b7280]",
};

/** What to fix first: one line per check, with a coloured dot (green is fine, amber needs a look, red blocks Google). */
function Health({ checks }: { checks: AdminSeo["health"] }) {
  const open = checks.filter((check) => check.status === "warning" || check.status === "error").length;

  return (
    <Card>
      <CardHeader
        title="SEO health"
        description={open === 0 ? "Everything checked is in good shape." : `${open} thing${open === 1 ? "" : "s"} to look at.`}
      />
      <ul className="divide-y divide-line">
        {checks.map((check) => (
          <li key={check.key} className="flex items-start gap-3 px-5 py-3.5">
            <span aria-hidden="true" className={cn("mt-[7px] size-2 shrink-0 rounded-full", dot[check.status])} />
            <div className="min-w-0">
              <p className="text-[13px] leading-5 font-semibold text-ink">{check.label}</p>
              <p className="text-xs leading-[18px] text-charade">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PageCard({ page, siteUrl, siteName, media }: { page: AdminSeoPage; siteUrl: string; siteName: string; media: MediaAsset[] }) {
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description);
  const [hidden, setHidden] = useState(page.noindex);
  const edited = Boolean(title || description || page.image || hidden);
  const host = siteUrl.replace(/^https?:\/\//, "") || "tmnsport.com";

  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface/60">
        <span className="min-w-0">
          <span className="block text-[13px] leading-5 font-semibold text-ink">{page.label}</span>
          <span className="block truncate text-xs leading-[18px] text-muted">{page.path}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {hidden && <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[10.5px] font-semibold text-[#b42318]">Hidden from Google</span>}
          <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold", edited ? "bg-[#e6f6ec] text-[#1a7f3d]" : "bg-surface text-charade")}>
            {edited ? "Customised" : "Built-in text"}
          </span>
          <span aria-hidden="true" className="text-xs text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>

      <div className="grid gap-5 border-t border-line bg-white px-5 py-5 lg:grid-cols-2">
        <input type="hidden" name="pagePath" value={page.path} />
        <div className="flex flex-col gap-5">
          <Field label="Search title" hint={`Built-in: ${page.defaultTitle}`}>
            <TextInput name="pageTitle" maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={page.defaultTitle} />
            <LengthMeter value={title || page.defaultTitle} range={SEO_TITLE} />
          </Field>
          <Field label="Search description" hint={`Built-in: ${page.defaultDescription}`}>
            <TextArea
              name="pageDescription"
              maxLength={300}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={page.defaultDescription}
              className="min-h-[92px]"
            />
            <LengthMeter value={description || page.defaultDescription} range={SEO_DESCRIPTION} />
          </Field>
          <label className="flex items-center gap-2.5 text-xs text-ink">
            <input
              type="checkbox"
              name="pageNoindex"
              value={page.path}
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
              className="size-4 accent-[#f5c400]"
            />
            Hide this page from Google (do not index)
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <SerpPreview
            title={title || page.defaultTitle}
            description={description || page.defaultDescription}
            address={page.path === "/" ? host : `${host} › ${page.path.slice(1)}`}
            siteName={siteName}
          />
          <ImageField name="pageImage" label="Share picture" initial={page.image} media={media} cropRatio={cropRatios.social} hint="Shown when this page is shared on social networks. Leave empty to use the default picture." />
        </div>
      </div>
    </details>
  );
}

interface SeoFormProps {
  settings: SiteSettings;
  seo: AdminSeo;
  media: MediaAsset[];
}

/** The SEO screen: search engine switches, title format and share picture, and the text of every page. */
export function SeoForm({ settings, seo, media }: SeoFormProps) {
  const [state, action, pending] = useActionState(saveSeoAction, initial);
  const [siteUrl, setSiteUrl] = useState(settings.seoSiteUrl);
  const [template, setTemplate] = useState(settings.seoTitleTemplate);
  const [indexing, setIndexing] = useState(settings.seoIndexing);
  const origin = siteUrl.trim().replace(/\/+$/, "");

  return (
    <form action={action} id="seo-form" aria-busy={pending} className="flex flex-col gap-5">
      <FormMessage status={state.status} message={state.message} />

      <Health checks={seo.health} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader title="Search engines" description="Who may list the website, and how Google and Bing find it" />
          <div className="flex flex-col gap-5 p-5">
            <label className="flex items-start gap-2.5 text-[13px] leading-5 text-ink">
              <input
                type="checkbox"
                name="seoIndexing"
                checked={indexing}
                onChange={(event) => setIndexing(event.target.checked)}
                className="mt-0.5 size-4 accent-[#f5c400]"
              />
              <span>
                <strong className="font-semibold">Allow search engines to list this website</strong>
                <span className="block text-xs text-charade">
                  {indexing ? "On: Google and Bing may show the site in search results." : "Off: robots.txt and every page ask search engines to stay away. Use it only while the site is not ready."}
                </span>
              </span>
            </label>

            <Field label="Website address" hint="The live address, with https:// and no slash at the end. Used for the sitemap, canonical links and share links.">
              <TextInput name="seoSiteUrl" type="url" value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} placeholder="https://tmnsport.com" autoComplete="off" spellCheck={false} />
            </Field>

            <Field label="Google Search Console verification code" hint="Only the code from the “content” part of the tag, for example abc123… Leave empty if you verify another way.">
              <TextInput name="seoGoogleVerification" defaultValue={settings.seoGoogleVerification} placeholder="Verification code" autoComplete="off" spellCheck={false} />
            </Field>
            <Field label="Bing Webmaster Tools verification code" hint="Optional. The code from the “content” part of the msvalidate.01 tag.">
              <TextInput name="seoBingVerification" defaultValue={settings.seoBingVerification} placeholder="Verification code" autoComplete="off" spellCheck={false} />
            </Field>

            <div className="rounded-md bg-surface px-4 py-3 text-xs leading-[18px] text-charade">
              <p className="font-semibold text-ink">Built for you automatically</p>
              <ul className="mt-1 list-disc pl-4">
                <li>
                  Sitemap: <span className="break-all text-ink">{origin ? `${origin}/sitemap.xml` : "/sitemap.xml"}</span>. Submit it in Search Console.
                </li>
                <li>
                  Robots file: <span className="break-all text-ink">{origin ? `${origin}/robots.txt` : "/robots.txt"}</span>
                </li>
                <li>Stories get Google news markup (NewsArticle) and a canonical address on their own.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Titles and sharing" description="How every page title looks, and the picture used when links are shared" />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Page title format" hint="%s is replaced by the page title. Example: Live Scores | TMN Sport.">
              <TextInput name="seoTitleTemplate" value={template} onChange={(event) => setTemplate(event.target.value)} placeholder="%s | TMN Sport" autoComplete="off" />
              <p className="mt-1.5 text-[11px] leading-4 text-muted">
                Example: {template.includes("%s") ? template.replace("%s", "Live Scores") : "The format must contain %s"}
              </p>
            </Field>

            <ImageField
              name="seoDefaultImage"
              label="Default share picture"
              initial={settings.seoDefaultImage}
              media={media}
              cropRatio={cropRatios.social}
              hint="Used when a page or story has no picture of its own. 1200 × 630 pixels works best."
            />

            <Field label="X (Twitter) handle" hint="Optional, for example @tmnsport. Added to share previews on X.">
              <TextInput name="seoTwitterHandle" defaultValue={settings.seoTwitterHandle} placeholder="@tmnsport" autoComplete="off" spellCheck={false} />
            </Field>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Page SEO"
          description="Open a page to change its Google title and description. Leave a field empty to keep the page's built-in text. Stories have their own SEO box in the article editor."
        />
        <div>
          {seo.pages.map((page) => (
            <PageCard key={page.path} page={page} siteUrl={siteUrl} siteName={settings.websiteName || "TMN Sport"} media={media} />
          ))}
        </div>
      </Card>
    </form>
  );
}
