import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Flash, PageHeader } from "@/components/admin/AdminUi";
import { PageEditor } from "@/components/admin/PageEditor";
import { getPage, pageLabels } from "@/lib/admin/data";
import { builtInLegalPage } from "@/lib/legal-content";
import { legalPageToMarkup } from "@/lib/legal-markup";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Edit Legal Page" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function EditLegalPage(props: PageProps<"/admin/pages/[slug]">) {
  await connection();

  const [{ slug }, query] = await Promise.all([props.params, props.searchParams]);

  if (!(slug in pageLabels)) {
    notFound();
  }

  const saved = await getPage(slug);
  const builtIn = builtInLegalPage(slug);

  if (!saved && !builtIn) {
    notFound();
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/pages", label: "Back to legal pages" }}
        title={pageLabels[slug]}
        description="Changes are published to the website as soon as you save."
      />

      {firstParam(query.reset) && <Flash>The page was reset to the text built into the website.</Flash>}

      <PageEditor
        // A fresh form after saving or resetting, so the fields show what is now stored.
        key={`${slug}-${saved?.updatedAt ?? "built-in"}`}
        slug={slug}
        title={saved?.title ?? builtIn?.title ?? pageLabels[slug]}
        description={saved?.description ?? builtIn?.description ?? ""}
        content={saved?.content ?? (builtIn ? legalPageToMarkup(builtIn) : "")}
        customised={Boolean(saved)}
      />
    </>
  );
}
