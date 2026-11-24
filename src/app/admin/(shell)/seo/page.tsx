import type { Metadata } from "next";
import { connection } from "next/server";

import { PageHeader, primaryButtonClass } from "@/components/admin/AdminUi";
import { SeoForm } from "@/components/admin/SeoForm";
import { getAdminSeo, getMedia, getSettings } from "@/lib/admin/data";

export const metadata: Metadata = { title: "SEO Management" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function SeoPage() {
  await connection();

  const [settings, seo, media] = await Promise.all([getSettings(), getAdminSeo(), getMedia()]);

  return (
    <>
      <PageHeader
        title="SEO Management"
        description="Control how the website appears in Google, Bing and when links are shared."
        actions={
          <button type="submit" form="seo-form" className={primaryButtonClass()}>
            Save SEO
          </button>
        }
      />
      <SeoForm settings={settings} seo={seo} media={media} />
    </>
  );
}
