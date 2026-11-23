import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { AdminIcon } from "@/components/admin/icons";
import { Card, CardHeader, PageHeader, PrimaryLink, SecondaryLink } from "@/components/admin/AdminUi";
import { getCurrentAdmin, getDashboard } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Dashboard" };

const quickActions = [
  { label: "Create new article", href: "/admin/content/new", icon: "plus" },
  { label: "Upload media", href: "/admin/media/upload", icon: "upload" },
  { label: "Manage categories", href: "/admin/categories", icon: "folder" },
  { label: "View all articles", href: "/admin/content", icon: "article" },
  { label: "Edit legal pages", href: "/admin/pages", icon: "article" },
  { label: "Website settings (Google tags, contact)", href: "/admin/settings", icon: "sliders" },
  { label: "Manage staff", href: "/admin/staff", icon: "user" },
  { label: "View activity logs", href: "/admin/activity", icon: "pulse" },
];

function greeting(hour: number): string {
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function DashboardPage() {
  await connection();

  const [dashboard, user] = await Promise.all([getDashboard(), getCurrentAdmin()]);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`${greeting(new Date().getHours())}, ${firstName}`}
        description="Here is the current state of the TMN Sport newsroom, match data and platform integrations."
        actions={
          <>
            <PrimaryLink href="/admin/content/new">
              <AdminIcon name="plus" width={14} height={14} />
              New article
            </PrimaryLink>
            <SecondaryLink href="/admin/activity">
              <AdminIcon name="pulse" width={14} height={14} />
              Activity log
            </SecondaryLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <Card key={stat.label} className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs leading-4 text-charade">{stat.label}</p>
              <p className="mt-2 text-[28px] leading-9 font-medium tracking-[-0.02em] text-ink">{stat.value}</p>
              <p className="mt-1.5 text-[11px] leading-4 text-muted">{stat.hint}</p>
            </div>
            <span className={`flex size-8 items-center justify-center rounded-md ${stat.icon === "clock" ? "bg-[#fff2c2] text-[#8a6500]" : "bg-surface text-charade"}`}>
              <AdminIcon name={stat.icon} width={15} height={15} />
            </span>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <Card className="self-start">
          <CardHeader
            title="Recent activity"
            description="Latest actions in the dashboard and data syncs"
            action={
              <Link href="/admin/activity" className="text-xs font-semibold text-ink hover:underline">
                View all
              </Link>
            }
          />
          <ul>
            {dashboard.activity.map((entry, index) => (
              <li key={index} className="flex items-start gap-4 border-b border-line px-5 py-4 last:border-b-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-charade">
                  {entry.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-5 text-muted">
                    <strong className="font-semibold text-ink">{entry.actor}</strong> {entry.action}
                  </p>
                  <p className="truncate text-xs leading-[18px] text-charade">{entry.target}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] leading-4 text-charade">{entry.relative}</p>
                  <p className="text-[10.5px] leading-4 text-muted">{entry.absolute}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Quick actions" description="Common editorial tasks" />
            <ul className="flex flex-col gap-2.5 p-4">
              {quickActions.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="flex items-center gap-3 rounded-md border border-line px-3.5 py-3 text-[13px] text-ink transition-colors hover:border-ink"
                  >
                    <span className="flex size-6 items-center justify-center rounded bg-surface text-charade">
                      <AdminIcon name={action.icon} width={13} height={13} />
                    </span>
                    <span className="flex-1">{action.label}</span>
                    <AdminIcon name="chevron" width={12} height={12} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="System status" description="Connection and data status reported by the server" />
            <ul>
              {dashboard.system.map((row) => (
                <li key={row.name} className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-surface text-charade">
                    <AdminIcon name={row.icon} width={14} height={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-5 font-semibold text-ink">{row.name}</p>
                    <p className="truncate text-[11.5px] leading-4 text-muted">{row.detail}</p>
                  </div>
                  <span className="rounded bg-[#e6f6ec] px-2 py-1 text-[9.5px] leading-3 font-bold tracking-[0.08em] text-[#1a7f3d] uppercase">
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/admin/integrations" className="block px-5 py-3.5 text-xs font-semibold text-ink hover:underline">
              Open integration monitor →
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
