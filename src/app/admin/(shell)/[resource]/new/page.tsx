import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PageHeader } from "@/components/admin/AdminUi";
import { AdvertisementForm, ArticleForm, GenericRecordForm } from "@/components/admin/RecordForms";
import { StaffForm } from "@/components/admin/StaffForm";
import { getAdOptions, getArticleOptions, getCurrentAdmin, getMedia } from "@/lib/admin/data";
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

  if (config.form === "staff") {
    const user = await getCurrentAdmin();

    return (
      <>
        <PageHeader
          back={{ href: `/admin/${resource}`, label: `Back to ${config.label.toLowerCase()}` }}
          title="Add staff member"
          description="Create an account, choose its role and password, and give the password to the person."
        />
        <StaffForm cancelHref={`/admin/${resource}`} canGrantSuperAdmin={user?.role === "Super Admin"} />
      </>
    );
  }

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
        <ArticleForm resource={resource} cancelHref={`/admin/${resource}`} options={await getArticleOptions()} />
      ) : config.form === "advertisement" ? (
        <AdvertisementForm resource={resource} cancelHref={`/admin/${resource}`} options={await getAdOptions()} />
      ) : (
        <GenericRecordForm resource={resource} cancelHref={`/admin/${resource}`} imageLabel={config.imageLabel} imageRatio={config.imageRatio} media={config.imageLabel ? await getMedia() : undefined} />
      )}
    </>
  );
}
