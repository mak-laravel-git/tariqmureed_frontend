import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Card, CardHeader, PageHeader, PrimaryLink, StatusBadge } from "@/components/admin/AdminUi";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { getCurrentAdmin, getRecord } from "@/lib/admin/data";
import { isResourceKey, resources } from "@/lib/admin/resources";

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function RecordDetailPage(props: PageProps<"/admin/[resource]/[id]">) {
  await connection();

  const { resource, id } = await props.params;

  if (!isResourceKey(resource)) {
    notFound();
  }

  const [record, user] = await Promise.all([getRecord(resource, id), getCurrentAdmin()]);

  if (!record) {
    notFound();
  }

  const config = resources[resource];
  const [titleLabel, subtitleLabel, ownerLabel] = config.columns ?? ["Name / Title", "Category / Email", "Owner / Scope"];
  const ownAccount = resource === "staff" && String(user?.id) === record.id;
  const rows: [string, React.ReactNode][] = [
    [titleLabel, record.title],
    [subtitleLabel, record.subtitle],
    [ownerLabel, record.owner],
    ["Status", <StatusBadge key="status" status={record.status} />],
    ["Last updated", record.updatedAt],
  ];

  if (config.imageLabel) {
    rows.splice(
      1,
      0,
      [
        config.imageLabel,
        record.image ? (
          <span key="image" className="relative block size-20 overflow-hidden rounded-md border border-line bg-surface">
            <Image src={record.image} alt={record.title} fill unoptimized sizes="80px" className="object-cover" />
          </span>
        ) : (
          <span key="image" className="font-normal text-muted">
            Not set
          </span>
        ),
      ],
    );
  }

  return (
    <>
      <PageHeader
        back={{ href: `/admin/${resource}`, label: `Back to ${config.label.toLowerCase()}` }}
        title={record.title}
        description="Complete record details and administration history."
        actions={
          !config.readOnly && (
            <>
              {!ownAccount && <DeleteRecordButton resource={resource} id={record.id} />}
              <PrimaryLink href={`/admin/${resource}/${record.id}/edit`}>Edit record</PrimaryLink>
            </>
          )
        }
      />

      <div className={record.history ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" : "grid gap-5"}>
        <Card className="self-start">
          <CardHeader title="Record details" description="Current saved information" />
          <dl>
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-line px-5 py-4 text-[13px] last:border-b-0 sm:grid-cols-[170px_1fr]">
                <dt className="text-charade">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
            {record.notes && (
              <div className="grid gap-1 border-t border-line px-5 py-4 text-[13px] sm:grid-cols-[170px_1fr]">
                <dt className="text-charade">Internal notes</dt>
                <dd className="text-ink">{record.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        {record.history && (
          <Card className="self-start">
            <CardHeader title="Recent history" description="Latest changes to this record" />
            {record.history.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-muted">No changes have been recorded yet.</p>
            ) : (
              <ol className="px-5 py-2">
                {record.history.map((entry, index) => (
                  <li key={`${index}-${entry.title}`} className="flex gap-3 border-b border-line py-3.5 last:border-b-0">
                    <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="text-xs leading-4 font-semibold text-ink">{entry.title}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted">{entry.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
