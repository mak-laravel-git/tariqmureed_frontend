import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PageHeader } from "@/components/admin/AdminUi";
import { AdvertisementForm, ArticleForm, GenericRecordForm } from "@/components/admin/RecordForms";
import { getAdOptions, getArticleOptions, getMedia, getRecord } from "@/lib/admin/data";
import { isResourceKey, resources } from "@/lib/admin/resources";

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function EditRecordPage(props: PageProps<"/admin/[resource]/[id]/edit">) {
  await connection();

  const { resource, id } = await props.params;

  if (!isResourceKey(resource) || resources[resource].readOnly) {
    notFound();
  }

  const record = await getRecord(resource, id);

  if (!record) {
    notFound();
  }

  const config = resources[resource];

  return (
    <>
      <PageHeader
        back={{ href: `/admin/${resource}`, label: `Back to ${config.label.toLowerCase()}` }}
        title={`Edit ${record.title}`}
        description="Update the fields below and save the record."
      />

      {config.form === "article" ? (
        <ArticleForm resource={resource} record={record} cancelHref={`/admin/${resource}/${id}`} options={await getArticleOptions()} />
      ) : config.form === "advertisement" ? (
        <AdvertisementForm resource={resource} record={record} cancelHref={`/admin/${resource}/${id}`} options={await getAdOptions()} />
      ) : (
        <GenericRecordForm
          resource={resource}
          record={record}
          cancelHref={`/admin/${resource}/${id}`}
          imageLabel={config.imageLabel}
          media={config.imageLabel ? await getMedia() : undefined}
        />
      )}
    </>
  );
}
