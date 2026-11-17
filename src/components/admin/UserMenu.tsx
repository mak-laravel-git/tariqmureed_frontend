"use client";

import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/admin/types";

import { AdminIcon } from "./icons";
import { useDismiss } from "./useDismiss";

export function UserMenu({ user }: { user: AdminUser }) {
  const { open, setOpen, ref } = useDismiss<HTMLDivElement>();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-md py-1 pr-1 pl-1.5 hover:bg-surface"
      >
        <span className="flex size-[30px] items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
          {user.initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs leading-4 font-semibold text-ink">{user.name}</span>
          <span className="block text-[10.5px] leading-4 text-muted">{user.role}</span>
        </span>
        <AdminIcon name="chevronDown" width={12} height={12} className="hidden text-muted sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-52 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-[0_12px_32px_rgba(17,17,17,0.14)]"
        >
          <Link role="menuitem" href="/admin/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs text-ink hover:bg-surface">
            Admin profile
          </Link>
          <Link role="menuitem" href="/admin/password" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs text-ink hover:bg-surface">
            Password management
          </Link>
          <Link role="menuitem" href="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs text-ink hover:bg-surface">
            View public site
          </Link>
          <form action={logoutAction} className="border-t border-line">
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-live hover:bg-surface">
              <AdminIcon name="logout" width={14} height={14} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
