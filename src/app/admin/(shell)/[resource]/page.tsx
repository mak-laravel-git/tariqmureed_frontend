import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Flash, PageHeader } from "@/components/admin/AdminUi";
import { ResourceActions, ResourceTable } from "@/components/admin/ResourceTable";
import { listRecords } from "@/lib/admin/data";
import { isResourceKey, resolveTab, resources } from "@/lib/admin/resources";
import { firstParam } from "@/lib/url";

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function ResourceListPage(props: PageProps<"/admin/[resource]">) {
  await connection();

  const { resource } = await props.params;

  if (!isResourceKey(resource)) {
    notFound();
  }

  const params = await props.searchParams;
  const tab = resolveTab(firstParam(params.tab));
  const query = firstParam(params.q);
  const page = Math.max(1, Number(firstParam(params.page)) || 1);
  const config = resources[resource];

  const { records, total } = await listRecords(resource, { tab, q: query, page });

  return (
    <>
      <PageHeader title={config.label} description={config.description} actions={<ResourceActions resource={resource} />} />

      {firstParam(params.saved) && <Flash>Record saved.</Flash>}
      {firstParam(params.deleted) && <Flash>Record deleted.</Flash>}

      <ResourceTable resource={resource} records={records} total={total} tab={tab} query={query} page={page} params={params} />
    </>
  );
}
