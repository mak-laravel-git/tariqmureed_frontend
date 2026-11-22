import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Card, PageHeader } from "@/components/admin/AdminUi";
import { AdminIcon } from "@/components/admin/icons";
import { listPages } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Legal Pages" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function PagesPage() {
  await connection();

  const pages = await listPages();

  return (
    <>
      <PageHeader
        title="Legal Pages"
        description="Edit the Privacy Policy, Cookie Preferences and Terms of Use pages shown on the website."
      />

      <Card>
        <ul>
          {pages.map((page) => (
            <li key={page.slug} className="border-b border-line last:border-b-0">
              <Link
                href={`/admin/pages/${page.slug}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-surface text-charade">
                  <AdminIcon name="article" width={14} height={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-5 font-semibold text-ink">{page.label}</p>
                  <p className="text-[11px] leading-4 text-muted">/{page.slug}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-[9.5px] leading-3 font-bold tracking-[0.08em] uppercase ${page.customised ? "bg-[#e6f6ec] text-[#1a7f3d]" : "bg-chip text-muted"}`}
                >
                  {page.customised ? `Edited${page.updatedAt ? ` · ${page.updatedAt}` : ""}` : "Built-in text"}
                </span>
                <AdminIcon name="chevron" width={12} height={12} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
