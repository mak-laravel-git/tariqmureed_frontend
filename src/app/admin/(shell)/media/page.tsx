import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminIcon } from "@/components/admin/icons";
import { Flash, PageHeader, PrimaryLink } from "@/components/admin/AdminUi";
import { Photo } from "@/components/ui/Photo";
import { deleteMediaAction } from "@/app/admin/actions";
import { getMedia } from "@/lib/admin/data";
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
      {firstParam(params.removed) && <Flash>Asset removed from the library.</Flash>}
      {firstParam(params.error) && (
        <p role="alert" className="mb-4 rounded-md border border-[#f1c0c0] bg-[#fdecec] px-4 py-2.5 text-xs font-medium text-[#b42318]">
          The asset could not be removed. Please try again.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset, index) => (
          <li key={asset.id} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className={`relative flex aspect-[1.65] items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}>
              {asset.url ? (
                <Photo src={asset.url} alt={asset.title} sizes="(min-width: 1024px) 25vw, 50vw" />
              ) : (
                <AdminIcon name="image" width={22} height={22} className="text-white/70" />
              )}
              <form action={deleteMediaAction.bind(null, asset.id)} className="absolute top-2 right-2">
                <button
                  type="submit"
                  aria-label={`Remove ${asset.title}`}
                  title="Remove"
                  className="flex size-7 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition-colors hover:bg-[#b42318] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <AdminIcon name="x" width={14} height={14} />
                </button>
              </form>
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
