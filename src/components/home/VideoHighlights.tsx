import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { getVideoHighlights } from "@/lib/api/endpoints";
import type { Video } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function VideoCard({ video, wide }: { video: Video; wide: boolean }) {
  return (
    <article className={cn("flex flex-col gap-3", wide && "lg:flex-row lg:gap-3")}>
      <Link
        href={`/videos/${video.slug}`}
        aria-label={`Play: ${video.title}`}
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-lg",
          wide ? "aspect-[456/258] lg:w-[58.5%]" : "aspect-[518/277]",
        )}
      >
        <Photo
          src={video.thumbnail}
          alt=""
          sizes={wide ? "(min-width: 1320px) 456px, (min-width: 1024px) 35vw, 100vw" : "(min-width: 1320px) 518px, (min-width: 1024px) 40vw, 100vw"}
        />

        <Tag tone="gold" className="absolute top-3 left-3 px-2.5 py-1 text-[11px] tracking-[0.55px]">
          {video.category}
        </Tag>

        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 pl-0.5 text-sm text-white"
        >
          ▶
        </span>

        <span className="absolute right-2.5 bottom-2.5 rounded-[4px] bg-ink/85 px-2 py-1 text-xs leading-4 font-bold text-white">
          {video.duration}
        </span>
      </Link>

      <div className={cn("flex min-w-0 flex-col gap-2", wide && "lg:pt-0")}>
        <h3
          className={cn(
            "font-bold text-ink",
            wide ? "text-[22px] leading-[1.25] lg:text-[26px] lg:leading-[33px]" : "text-[17px] leading-[22px]",
          )}
        >
          <Link href={`/videos/${video.slug}`} className="hover:underline">
            {video.title}
          </Link>
        </h3>

        {wide && video.description && (
          <p className="text-[15px] leading-6 text-muted">{video.description}</p>
        )}

        <p className="text-[13px] leading-[19.5px] text-muted">
          <TimeAgo iso={video.publishedAt} /> · {video.views} views
        </p>
      </div>
    </article>
  );
}

export async function VideoHighlights() {
  const videos = await getVideoHighlights();

  return (
    <Section aria-labelledby="video-highlights-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="video-highlights-title"
          title="Video Highlights"
          description="Highlights, analysis shows and press conferences."
          action={{ href: "/videos", label: "View all" }}
        />

        <div className="grid grid-cols-1 gap-x-[22px] gap-y-8 lg:grid-cols-[minmax(0,780fr)_minmax(0,518fr)] lg:gap-y-[22px]">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} wide={index % 2 === 0} />
          ))}
        </div>
      </div>
    </Section>
  );
}
