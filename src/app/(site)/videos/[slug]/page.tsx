import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { PlayIcon } from "@/components/ui/icons";
import { Photo } from "@/components/ui/Photo";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { getVideo } from "@/lib/api/endpoints";
import { profileMetadata } from "@/lib/seo";

export async function generateMetadata(props: PageProps<"/videos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const video = await getVideo(slug);

  if (!video) {
    return {};
  }

  return profileMetadata({
    path: `/videos/${video.slug}`,
    title: video.title,
    description: video.description || `${video.title}. Watch ${video.category.toLowerCase()} video from TMN Sport.`,
    image: video.thumbnail,
  });
}

async function VideoView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  return (
    <Container className="py-10">
      <Link href="/videos" className="text-xs font-bold tracking-[0.6px] text-[#d08700] uppercase hover:underline">
        ← All videos
      </Link>

      <div className="relative mt-6 aspect-video overflow-hidden rounded-[4px] bg-[#09090b]">
        <Photo src={video.thumbnail} alt="" priority sizes="(min-width: 1320px) 1200px, 100vw" className="grayscale" />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand pl-0.5 text-[#09090b]"
        >
          <PlayIcon width={20} height={20} />
        </span>
      </div>

      <div className="max-w-[768px] pt-8">
        <p className="text-[10px] leading-[15px] font-black tracking-[1.5px] text-[#d08700] uppercase">{video.category}</p>
        <h1 className="pt-3 text-[36px] leading-10 font-bold text-[#09090b]">{video.title}</h1>
        <p className="pt-3 text-sm leading-5 text-[#71717b]">
          {video.duration} · {video.views} views · Published <TimeAgo iso={video.publishedAt} />
        </p>
        {video.description && <p className="pt-6 text-base leading-7 text-[#52525c]">{video.description}</p>}
      </div>
    </Container>
  );
}

export default function VideoPage(props: PageProps<"/videos/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading video" className="min-h-[800px]" />}>
      <VideoView params={props.params} />
    </Suspense>
  );
}
