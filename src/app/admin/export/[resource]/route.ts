import { listRecords } from "@/lib/admin/data";
import { apiConfig } from "@/lib/api/config";
import { isResourceKey, resources } from "@/lib/admin/resources";

function csvCell(value: string): string {
  // Quote every cell and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV download of every record in a module (GET /admin/export/{resource}). */
export async function GET(_request: Request, context: RouteContext<"/admin/export/[resource]">) {
  const { resource } = await context.params;

  if (!isResourceKey(resource) || (resources[resource].unavailable && !apiConfig.useMocks)) {
    return new Response("Not found", { status: 404 });
  }

  const { records } = await listRecords(resource, { tab: "all", page: 1 });
  const header = ["Name / Title", "Category / Email", "Owner / Scope", "Status", "Updated"];
  const lines = [header, ...records.map((record) => [record.title, record.subtitle, record.owner, record.status, record.updatedAt])];

  return new Response(`${lines.map((line) => line.map(csvCell).join(",")).join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${resources[resource].key}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
