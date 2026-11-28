import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { AdminIcon } from "@/components/admin/icons";
import { PageHeader } from "@/components/admin/AdminUi";
import { CreateRoleForm, DeleteRoleButton } from "@/components/admin/RoleForms";
import { PermissionsForm } from "@/components/admin/SettingsForms";
import { getPermissions } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Roles & Permissions" };

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function RolesPage(props: PageProps<"/admin/roles">) {
  await connection();

  const params = await props.searchParams;
  const matrix = await getPermissions(firstParam(params.role));
  const selected = matrix.roles.find((role) => role.slug === matrix.selected);
  const notice = firstParam(params.created)
    ? "Role created. Tick what it may do, then press Save permissions."
    : firstParam(params.deleted)
      ? "Role deleted."
      : null;

  return (
    <>
      <PageHeader title="Roles & Permissions" description="Control module-level access for every administration role." />

      {notice && (
        <p role="status" className="mb-4 rounded-lg border border-[#bfe3cb] bg-[#e8f7ee] px-4 py-3 text-xs leading-4 text-[#1c6b39]">
          {notice}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {matrix.roles.map((role) => {
          const active = role.slug === matrix.selected;

          return (
            <Link
              key={role.slug}
              href={`/admin/roles?role=${role.slug}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex items-center gap-4 rounded-lg border bg-white px-5 py-4 transition-colors",
                active ? "border-gold ring-1 ring-gold" : "border-line hover:border-ink",
              )}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-md", role.system ? "bg-[#fff2c2] text-[#8a6500]" : "bg-[#e8eefc] text-[#3a5aa8]")}>
                <AdminIcon name={role.system ? "shield" : "users"} width={16} height={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs leading-4 font-semibold text-ink">{role.name}</span>
                <span className="block truncate text-[11px] leading-4 text-muted">{role.description}</span>
              </span>
              {role.system ? (
                <span className="rounded-full bg-[#fff2c2] px-2 py-0.5 text-[9.5px] font-semibold text-[#8a6500]">System role</span>
              ) : (
                <AdminIcon name="chevron" width={14} height={14} className="text-ink" />
              )}
            </Link>
          );
        })}
      </div>

      {matrix.can?.create && (
        <div className="mt-4">
          <CreateRoleForm />
        </div>
      )}

      <div className="mt-5">
        <PermissionsForm matrix={matrix} />
      </div>

      {selected?.custom && matrix.can?.delete && (
        <div className="mt-3">
          <DeleteRoleButton key={selected.slug} role={selected.slug} name={selected.name} />
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-[#eef1f6] px-5 py-4">
        <AdminIcon name="shield" width={15} height={15} className="mt-0.5 text-charade" />
        <div>
          <p className="text-xs leading-4 font-semibold text-ink">Super Admin protection</p>
          <p className="mt-0.5 text-[11px] leading-4 text-charade">
            The Super Admin system role always retains full administrative access and cannot be restricted or deleted.
          </p>
        </div>
      </div>
    </>
  );
}
