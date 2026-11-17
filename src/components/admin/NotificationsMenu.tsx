"use client";

import type { AdminNotification } from "@/lib/admin/types";

import { AdminIcon } from "./icons";
import { useDismiss } from "./useDismiss";

export function NotificationsMenu({ notifications }: { notifications: AdminNotification[] }) {
  const { open, setOpen, ref } = useDismiss<HTMLDivElement>();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications (${notifications.length} new)`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-8 items-center justify-center rounded-md text-ink hover:bg-surface"
      >
        <AdminIcon name="bell" />
        {notifications.length > 0 && <span aria-hidden="true" className="absolute top-1 right-1.5 size-1.5 rounded-full bg-live" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-lg border border-line bg-white shadow-[0_12px_32px_rgba(17,17,17,0.14)]"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs leading-4 font-semibold text-ink">Notifications</p>
            {notifications.length > 0 && (
              <span className="rounded-full bg-[#fff2c2] px-2 py-0.5 text-[10px] leading-4 font-semibold text-[#8a6500]">
                {notifications.length} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="border-t border-line px-4 py-8 text-center text-xs text-muted">You are all caught up.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className="flex gap-3 border-t border-line px-4 py-3.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-muted">
                    <AdminIcon name="article" width={14} height={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs leading-4 font-semibold text-ink">{notification.title}</p>
                    <p className="mt-1 text-[11.5px] leading-[17px] text-charade">{notification.body}</p>
                    <p className="mt-1 text-[10.5px] leading-4 text-muted">{notification.relative}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
