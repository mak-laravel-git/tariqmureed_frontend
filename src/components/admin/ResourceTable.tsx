import Link from "next/link";

import { PER_PAGE } from "@/lib/admin/data";
import { resources, statusTabs } from "@/lib/admin/resources";
import type { AdminRecord, ResourceKey, StatusTab } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { pageHref, type SearchParams } from "@/lib/url";

import { PrimaryLink, SecondaryLink, StatusBadge } from "./AdminUi";
import { AdminIcon } from "./icons";

interface ResourceTableProps {
  resource: ResourceKey;
  records: AdminRecord[];
  total: number;
  tab: StatusTab;
  query?: string;
  page: number;
  params: SearchParams;
}

const headings = ["Name / Title", "Category / Email", "Owner / Scope", "Status", "Updated", "Actions"];

/** Filterable, paginated table shared by every admin module. */
export function ResourceTable({ resource, records, total, tab, query, page, params }: ResourceTableProps) {
  const config = resources[resource];
  const base = `/admin/${resource}`;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <div className="rounded-lg border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <nav aria-label="Status filter" className="flex flex-wrap gap-1">
            {statusTabs.map((entry) => (
              <Link
                key={entry.key}
                href={pageHref(params, { tab: entry.key === "all" ? null : entry.key, page: null }, undefined, base)}
                aria-current={entry.key === tab ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs leading-4 font-medium transition-colors",
                  entry.key === tab ? "bg-[#fff2c2] text-ink" : "text-[#4b5260] hover:bg-surface",
                )}
              >
                {entry.label}
              </Link>
            ))}
          </nav>

          <form action={base} className="w-full sm:w-auto">
            {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
            <label className="relative flex items-center">
              <span className="sr-only">Filter records</span>
              <AdminIcon name="search" width={14} height={14} className="absolute left-3 text-muted" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Filter records..."
                className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-xs text-ink outline-none placeholder:text-muted focus-visible:border-ink sm:w-[220px]"
              />
            </label>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">{config.label}</caption>
            <thead>
              <tr className="bg-surface text-[10.5px] leading-4 font-bold tracking-[0.08em] text-charade uppercase">
                {headings.map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 font-bold first:pl-5">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-line text-[13px] leading-5 text-charade">
                  <th scope="row" className="px-4 py-3.5 pl-5 font-semibold text-ink">
                    {record.title}
                  </th>
                  <td className="px-4 py-3.5">{record.subtitle}</td>
                  <td className="px-4 py-3.5">{record.owner}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3.5">{record.updatedAt}</td>
                  <td className="px-4 py-3.5">
                    <span className="flex gap-3 text-xs font-medium text-ink">
                      <Link href={`${base}/${record.id}`} className="hover:underline">
                        View
                      </Link>
                      {!config.readOnly && (
                        <Link href={`${base}/${record.id}/edit`} className="hover:underline">
                          Edit
                        </Link>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && <p className="border-t border-line px-5 py-12 text-center text-sm text-muted">No records match this view.</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-xs text-charade">
          <p>
            Showing {records.length} record{records.length === 1 ? "" : "s"}
            {total > records.length ? ` of ${total}` : ""}
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={pageHref(params, { page: String(page - 1) }, undefined, base)} className="rounded-md border border-line px-3 py-1.5 hover:border-ink">
                Previous
              </Link>
            ) : (
              <span className="rounded-md border border-line px-3 py-1.5 text-[#b4b9c1]">Previous</span>
            )}
            <span className="rounded-md border border-gold bg-[#fff2c2] px-2.5 py-1.5 font-semibold text-ink">{page}</span>
            {page < lastPage ? (
              <Link href={pageHref(params, { page: String(page + 1) }, undefined, base)} className="rounded-md border border-line px-3 py-1.5 hover:border-ink">
                Next
              </Link>
            ) : (
              <span className="rounded-md border border-line px-3 py-1.5 text-[#b4b9c1]">Next</span>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

/** Header actions: CSV export and "Add new". */
export function ResourceActions({ resource }: { resource: ResourceKey }) {
  const config = resources[resource];

  return (
    <>
      <SecondaryLink href={`/admin/export/${resource}`} prefetch={false}>
        Export
      </SecondaryLink>
      {!config.readOnly && (
        <PrimaryLink href={`/admin/${resource}/new`}>
          <AdminIcon name="plus" width={14} height={14} />
          Add new
        </PrimaryLink>
      )}
    </>
  );
}
