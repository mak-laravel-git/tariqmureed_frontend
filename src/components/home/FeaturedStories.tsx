import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { getFeaturedStories } from "@/lib/api/endpoints";
import type { Article } from "@/lib/api/types";

function LeadStory({ article }: { article: Article }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-ink text-white md:flex-row">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block h-64 shrink-0 md:h-auto md:w-[55%]"
      >
        <Photo
          src={article.image}
          alt={article.imageAlt ?? ""}
          priority
          sizes="(min-width: 1320px) 436px, (min-width: 768px) 30vw, 100vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="gold" className="px-2.5 py-1 text-[11px] tracking-[0.55px]">
            Top story
          </Tag>
          <span className="text-xs leading-[18px] font-semibold tracking-[0.6px] text-white/60 uppercase">
            {article.category}
          </span>
        </div>

        <h3 className="mt-[15px] text-2xl leading-[1.25] font-extrabold sm:text-[30px] lg:text-[34px] lg:leading-[42.5px]">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>

        <p className="mt-[11px] text-[15px] leading-[24.4px] text-white/70">{article.excerpt}</p>

        {article.caption && (
          <p className="mt-4 border-l-2 border-gold/70 pl-3 text-xs leading-[16.5px] text-white/45 italic">
            {article.caption}
            {article.credit && <span className="pl-1 text-white/60 not-italic">{article.credit}</span>}
          </p>
        )}

        <p className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-[12.5px] leading-[18.75px] text-white/60">
          <span className="font-semibold text-white">{article.author.name}</span>
          <TimeAgo iso={article.publishedAt} />
          <span aria-hidden="true">·</span>
          <span>{article.readMinutes} min read</span>
        </p>
      </div>
    </article>
  );
}

function SideStory({ article }: { article: Article }) {
  return (
    <article className="grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[144px_1fr]">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block h-36 overflow-hidden rounded-[4px] sm:h-[178px]"
      >
        <Photo src={article.image} alt={article.imageAlt ?? ""} sizes="144px" />
      </Link>

      <div className="flex min-w-0 flex-col items-start gap-1.5 pt-0.5">
        <Tag tone="gold" className="px-2 py-1 text-[11px] tracking-[0.55px]">
          {article.category}
        </Tag>
        <h3 className="text-[15px] leading-[20.63px] font-bold text-ink">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="text-xs leading-[18px] text-muted">
          {article.author.name} · <TimeAgo iso={article.publishedAt} />
        </p>
      </div>
    </article>
  );
}

export async function FeaturedStories() {
  const { lead, side } = await getFeaturedStories();

  return (
    <Section aria-labelledby="featured-stories-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="featured-stories-title"
          title="Featured Stories"
          titleClassName="text-ink"
          description="The reporting and analysis TMN Sports editors are leading with."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,790fr)_minmax(0,510fr)]">
          <LeadStory article={lead} />
          <div className="flex min-w-0 flex-col gap-5">
            {side.map((article) => (
              <SideStory key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
