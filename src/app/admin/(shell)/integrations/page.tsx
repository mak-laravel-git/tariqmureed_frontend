import type { Metadata } from "next";
import { connection } from "next/server";

import { syncAction } from "@/app/admin/actions";
import { AdminIcon } from "@/components/admin/icons";
import { Card, CardHeader, Flash, primaryButtonClass } from "@/components/admin/AdminUi";
import { getIntegration } from "@/lib/admin/data";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "API Integration" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function IntegrationPage(props: PageProps<"/admin/integrations">) {
  await connection();

  const [integration, params] = await Promise.all([getIntegration(), props.searchParams]);
  const stats = [
    { label: "API connection", value: integration.connection },
    { label: "Last sync", value: integration.lastSync },
    { label: "Records updated", value: integration.recordsUpdated },
    { label: "Open errors", value: integration.openErrors },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl leading-8 font-normal tracking-[-0.01em] text-ink sm:text-[26px]">{integration.provider} API Integration</h1>
          <p className="mt-1 text-xs leading-[18px] text-muted sm:text-[13px]">Monitor synchronisation jobs, provider health and integration errors.</p>
        </div>
        <form action={syncAction}>
          <button type="submit" className={primaryButtonClass()}>
            <AdminIcon name="pulse" width={14} height={14} />
            Sync now
          </button>
        </form>
      </div>

      {firstParam(params.synced) && <Flash>Synchronisation started.</Flash>}

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="px-5 py-4">
            <dt className="text-[11px] leading-4 text-charade">{stat.label}</dt>
            <dd className="mt-2 text-xl leading-7 font-medium text-ink">{stat.value}</dd>
          </Card>
        ))}
      </dl>

      <Card className="mt-5">
        <CardHeader title="Recent synchronisation" description="Latest provider import jobs" />
        <ul>
          {integration.jobs.map((job) => (
            <li key={job.id} className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0">
              <span className="flex size-7 items-center justify-center rounded-md bg-surface text-charade">
                <AdminIcon name="pulse" width={13} height={13} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-4 font-semibold text-ink">{job.name}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted">{job.detail}</p>
              </div>
              <span
                className={`rounded px-2 py-1 text-[9.5px] leading-3 font-bold tracking-[0.08em] uppercase ${job.status === "Failed" ? "bg-[#fde8e7] text-live" : "bg-[#e6f6ec] text-[#1a7f3d]"}`}
              >
                {job.status}
              </span>
              <AdminIcon name="chevron" width={12} height={12} className="text-muted" />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
