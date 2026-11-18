import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PlayIcon } from "@/components/ui/icons";
import { PageIntro } from "@/components/ui/PageIntro";
import { Photo } from "@/components/ui/Photo";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { getVideosPage } from "@/lib/api/endpoints";
import type { Video } from "@/lib/api/types";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Videos",
  description: "Highlights, interviews, analysis and original TMN Sport features.",
};

const PAGE_SIZE = 6;

function PlayButton({ className, iconSize }: { className: string; iconSize: number }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-[#fdc700] pl-0.5 text-[#09090b] ${className}`}
    >
      <PlayIcon width={iconSize} height={iconSize} />
    </span>
  );
}

function FeaturedVideo({ video }: { video: Video }) {
  return (
    <article className="grid overflow-hidden rounded-[4px] bg-[#09090b] md:grid-cols-[minmax(0,1fr)_544px]">
      <Link
        href={`/videos/${video.slug}`}
        aria-label={`Play: ${video.title}`}
        className="relative block aspect-[16/10] md:aspect-auto md:min-h-[459px]"
      >
        <Photo
          src={video.thumbnail}
          alt=""
          priority
          sizes="(min-width: 1320px) 776px, (min-width: 768px) 55vw, 100vw"
          className="grayscale"
        />
        <PlayButton className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2" iconSize={20} />
      </Link>

      <div className="flex flex-col justify-end p-8">
        <span className="inline-flex w-full items-center rounded-[4px] bg-[#fdc700] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] text-black uppercase">
          Featured video
        </span>
        <h2 className="pt-5 text-[30px] leading-9 font-black text-white">
          <Link href={`/videos/${video.slug}`} className="hover:underline">
            {video.title}
          </Link>
        </h2>
        <p className="pt-4 text-sm leading-5 text-[#9f9fa9]">
          {video.duration} · Published <TimeAgo iso={video.publishedAt} />
        </p>
      </div>
    </article>
  );
}

function VideoTile({ video }: { video: Video }) {
  return (
    <article className="group">
      <Link
        href={`/videos/${video.slug}`}
        aria-label={`Play: ${video.title}`}
        className="relative block aspect-[419/243] overflow-hidden rounded-[4px]"
      >
        <Photo
          src={video.thumbnail}
          alt=""
          sizes="(min-width: 1320px) 420px, (min-width: 768px) 30vw, 100vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <PlayButton className="absolute bottom-3 left-3 size-10" iconSize={16} />
      </Link>
      <p className="pt-3 text-[10px] leading-[15px] font-black text-[#d08700] uppercase">{video.category}</p>
      <h3 className="pt-2 text-base leading-6 font-black text-[#09090b]">
        <Link href={`/videos/${video.slug}`} className="hover:underline">
          {video.title}
        </Link>
      </h3>
    </article>
  );
}

async function VideosBody({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const category = firstParam(params.category);
  const requested = Number(firstParam(params.limit));
  const limit = Number.isFinite(requested) && requested >= PAGE_SIZE ? Math.min(requested, 96) : PAGE_SIZE;

  const page = await getVideosPage(category, limit);

  return (
    <Container className="pt-8 pb-16">
      <FilterTabs
        className="py-6"
        label="Video categories"
        tabs={[
          { label: "All", active: !category, href: pageHref(params, { category: null, limit: null }, undefined, "/videos") },
          ...page.categories.map((name) => ({
            label: name,
            active: name.toLowerCase() === category?.toLowerCase(),
            href: pageHref(params, { category: name.toLowerCase(), limit: null }, undefined, "/videos"),
          })),
        ]}
      />

      {page.featured && <FeaturedVideo video={page.featured} />}

      <div className="grid gap-8 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {page.videos.map((video) => (
          <VideoTile key={video.id} video={video} />
        ))}
      </div>

      {page.videos.length === 0 && !page.featured && (
        <p className="rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-[#71717b]">
          No videos in this category yet.
        </p>
      )}

      {page.total > page.videos.length && (
        <Link
          href={pageHref(params, { limit: String(limit + PAGE_SIZE) }, undefined, "/videos")}
          scroll={false}
          className="mt-10 flex h-11 w-full items-center justify-center rounded-[4px] border border-[#09090b] bg-white text-[11px] font-bold tracking-[0.16em] text-[#09090b] uppercase transition-colors hover:bg-[#09090b] hover:text-white"
        >
          Load more videos
        </Link>
      )}
    </Container>
  );
}

export default function VideosPage(props: PageProps<"/videos">) {
  return (
    <>
      <PageIntro title="Videos" description="Highlights, interviews, analysis and original TMN Sport features." />
      <Suspense fallback={<div role="status" aria-label="Loading videos" className="min-h-[900px]" />}>
        <VideosBody searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
