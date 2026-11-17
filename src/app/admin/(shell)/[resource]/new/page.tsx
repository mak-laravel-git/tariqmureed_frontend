import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PageHeader } from "@/components/admin/AdminUi";
import { ArticleForm, GenericRecordForm } from "@/components/admin/RecordForms";
import { isResourceKey, resources } from "@/lib/admin/resources";

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function NewRecordPage(props: PageProps<"/admin/[resource]/new">) {
  await connection();

  const { resource } = await props.params;

  if (!isResourceKey(resource) || resources[resource].readOnly) {
    notFound();
  }

  const config = resources[resource];
  const article = config.form === "article";

  return (
    <>
      <PageHeader
        back={{ href: `/admin/${resource}`, label: article ? "Back to articles" : `Back to ${config.label.toLowerCase()}` }}
        title={article ? "Create New Article" : `Add ${config.singular}`}
        description={
          article
            ? "Complete the story details, then save it as a draft or submit it for review."
            : "Fill in the fields below to create the record."
        }
      />

      {article ? (
        <ArticleForm resource={resource} cancelHref={`/admin/${resource}`} />
      ) : (
        <GenericRecordForm resource={resource} cancelHref={`/admin/${resource}`} />
      )}
    </>
  );
}
