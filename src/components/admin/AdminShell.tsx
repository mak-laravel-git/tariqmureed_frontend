"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { adminNav, isResourceKey, resources } from "@/lib/admin/resources";
import type { AdminNotification, AdminUser } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { AdminIcon } from "./icons";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

interface AdminShellProps {
  user: AdminUser;
  notifications: AdminNotification[];
  children: ReactNode;
}

const standalone: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/media": "Media Library",
  "/admin/media/upload": "Upload Media",
  "/admin/integrations": "SportMonks API Integration",
  "/admin/settings": "Website Settings",
  "/admin/seo": "SEO Management",
  "/admin/series/arrange": "Arrange Series Strip",
  "/admin/home-teams": "Team Fixtures",
  "/admin/live-centre": "Live Match Center",
  "/admin/pages": "Legal Pages",
  "/admin/roles": "Roles & Permissions",
  "/admin/profile": "Admin Profile",
  "/admin/password": "Password Management",
};

/** Breadcrumb trail and page title for the top bar, derived from the current route. */
function describeRoute(pathname: string): { crumb: string; title: string } {
  if (standalone[pathname]) {
    return {
      crumb: pathname === "/admin" ? "Dashboard" : `Dashboard / ${pathname === "/admin/integrations" ? "API Integration" : standalone[pathname]}`,
      title: standalone[pathname],
    };
  }

  if (pathname.startsWith("/admin/pages/")) {
    return { crumb: "Dashboard / Legal Pages", title: "Edit Legal Page" };
  }

  const [, , resource, id, action] = pathname.split("/");

  if (resource && isResourceKey(resource)) {
    const config = resources[resource];

    if (config.form === "staff" && (id === "new" || action === "edit")) {
      const heading = id === "new" ? "Add Staff Member" : "Edit Staff Member";

      return { crumb: `Dashboard / ${config.label}`, title: heading };
    }
    if (id === "new") {
      return { crumb: `Dashboard / New ${config.singular}`, title: `Create New ${config.form === "article" ? "Article" : config.form === "advertisement" ? "Advertisement" : config.label}` };
    }
    if (id && action === "edit") {
      return { crumb: `Dashboard / ${config.label} Editor`, title: `Edit ${config.label}` };
    }
    if (id) {
      return { crumb: `Dashboard / ${config.label} Detail`, title: `${config.label} Details` };
    }

    return { crumb: `Dashboard / ${config.label}`, title: config.label };
  }

  return { crumb: "Dashboard", title: "Administration" };
}

function isActive(pathname: string, match: string): boolean {
  return match === "/admin" ? pathname === "/admin" : pathname === match || pathname.startsWith(`${match}/`);
}

export function AdminShell({ user, notifications, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { crumb, title } = describeRoute(pathname);

  useEffect(() => {
    // Close the mobile drawer after navigating.
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-ink">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[233px] flex-col border-r border-line bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[50px] items-center justify-between border-b border-line px-4">
          <Link href="/admin" aria-label="TMN Sport admin home">
            <Image src="/images/brand/logo-white.png" alt="TMN Sport" width={134} height={20} style={{ width: 134, height: "auto" }} className="invert" priority />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-ink lg:hidden"
          >
            <AdminIcon name="panel" />
          </button>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2.5 py-4">
          {adminNav.map((group, index) => (
            <div key={group.heading ?? index} className={index === 0 ? "" : "mt-6"}>
              {group.heading && (
                <p className="px-2.5 pb-2 text-[10px] leading-4 font-bold tracking-[0.14em] text-muted uppercase">
                  {group.heading}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.match);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] leading-5 transition-colors",
                          active ? "bg-[#fff6d6] font-medium text-ink" : "text-[#4b5260] hover:bg-surface hover:text-ink",
                        )}
                      >
                        <AdminIcon name={item.icon} className={active ? "text-ink" : "text-muted"} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <Link
          href="/admin/profile"
          className="flex items-center gap-3 border-t border-line px-4 py-4 transition-colors hover:bg-surface"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
            {user.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs leading-4 font-semibold text-ink">{user.name}</span>
            <span className="block truncate text-[11px] leading-4 text-muted">{user.role}</span>
          </span>
          <AdminIcon name="chevron" width={14} height={14} className="text-muted" />
        </Link>
      </aside>

      <div className="lg:pl-[233px]">
        <header className="sticky top-0 z-30 flex h-[50px] items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex size-8 items-center justify-center rounded-md text-ink hover:bg-surface lg:hidden"
          >
            <AdminIcon name="menu" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10.5px] leading-4 text-muted">{crumb}</p>
            <p className="truncate text-[13px] leading-4 font-semibold text-ink">{title}</p>
          </div>

          <form action="/admin/content" className="hidden md:block">
            <label className="relative flex items-center">
              <span className="sr-only">Search</span>
              <AdminIcon name="search" width={14} height={14} className="absolute left-3 text-muted" />
              <input
                name="q"
                type="search"
                placeholder="Search articles, media, authors..."
                className="h-9 w-[250px] rounded-md border border-line bg-surface pr-3 pl-9 text-xs text-ink outline-none placeholder:text-muted focus-visible:border-ink lg:w-[290px]"
              />
            </label>
          </form>

          <NotificationsMenu notifications={notifications} />
          <UserMenu user={user} />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
