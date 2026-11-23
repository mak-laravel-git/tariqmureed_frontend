import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminIcon } from "@/components/admin/icons";
import { Card, Flash, PageHeader, PrimaryLink } from "@/components/admin/AdminUi";
import { Photo } from "@/components/ui/Photo";
import { getMedia } from "@/lib/admin/data";
import { apiConfig } from "@/lib/api/config";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Media Library" };

const gradients = [
  "from-[#344553] to-[#8c9aa3]",
  "from-[#2f4a2a] to-[#a3b868]",
  "from-[#233a6e] to-[#7e9bd0]",
  "from-[#6b4a1b] to-[#e0b955]",
];

/** Private, request-time page: allowed to block during navigation. */
export const instant = false;

export default async function MediaLibraryPage(props: PageProps<"/admin/media">) {
  await connection();

  if (!apiConfig.useMocks) {
    return (
      <>
        <PageHeader title="Media Library" description="Browse and manage images, video thumbnails and editorial assets." />
        <Card>
          <p className="px-5 py-12 text-center text-sm text-muted">
            The media library is not connected to the server yet. It will work here as soon as its API is added.
          </p>
        </Card>
      </>
    );
  }

  const [assets, params] = await Promise.all([getMedia(), props.searchParams]);

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Browse and manage images, video thumbnails and editorial assets."
        actions={
          <PrimaryLink href="/admin/media/upload">
            <AdminIcon name="upload" width={14} height={14} />
            Upload media
          </PrimaryLink>
        }
      />

      {firstParam(params.uploaded) && <Flash>Asset uploaded.</Flash>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset, index) => (
          <li key={asset.id} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className={`relative flex aspect-[1.65] items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}>
              {asset.url ? (
                <Photo src={asset.url} alt={asset.title} sizes="(min-width: 1024px) 25vw, 50vw" />
              ) : (
                <AdminIcon name="image" width={22} height={22} className="text-white/70" />
              )}
            </div>
            <div className="px-3.5 py-3">
              <p className="text-xs leading-4 font-semibold text-ink">{asset.title}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">{asset.meta}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
