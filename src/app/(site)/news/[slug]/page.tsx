import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { ShareButton } from "@/components/ui/ShareButton";
import { getArticle } from "@/lib/api/endpoints";
import type { ArticleBlock } from "@/lib/api/types";
import { formatPublishedDate } from "@/lib/format";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="text-lg leading-[30px] font-semibold text-[#18181b] md:text-xl md:leading-[33px]">{block.text}</p>
      );
    case "heading":
      return (
        <h2 className="text-2xl leading-9 font-bold text-[#09090b] md:text-[28px] md:leading-[51.8px]">{block.text}</h2>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#facc15] py-2 pl-6 text-xl leading-8 font-extrabold text-[#18181b] md:text-2xl md:leading-[34.8px]">
          {block.text}
        </blockquote>
      );
    default:
      return (
        <p className="text-base leading-[30px] text-[#3f3f46] md:text-[16.8px] md:leading-[31.08px]">{block.text}</p>
      );
  }
}

async function ArticleContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <Container className="pt-8 pb-16">
      <Breadcrumbs
        variant="article"
        items={[
          { label: "News", href: "/news" },
          ...article.breadcrumb.map((label) => ({ label })),
        ]}
      />

      <header className="mt-10">
        <div className="flex pt-[3px]">
          <span className="inline-flex items-center rounded-[4px] bg-[#fdc700] px-2.5 py-1 text-[10px] leading-[15px] font-black tracking-[1.5px] text-black uppercase">
            {article.category}
          </span>
        </div>
        <h1 className="mt-5 text-[34px] leading-[1.1] font-bold text-[#09090b] sm:text-5xl lg:text-[60px] lg:leading-[63px]">
          {article.title}
        </h1>
        {article.subtitle && <p className="mt-6 text-lg leading-8 text-[#52525c]">{article.subtitle}</p>}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-[#e4e4e7] py-4">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fdc700] text-xs leading-4 font-black text-[#09090b]"
            >
              {initials(article.author.name)}
            </span>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs leading-4">
              <span className="font-bold text-[#09090b]">{article.author.name}</span>
              <span className="text-[#9f9fa9]">
                Published {formatPublishedDate(article.publishedAt)} · {article.readMinutes} min read
              </span>
            </p>
          </div>
          <ShareButton title={article.title} />
        </div>
      </header>

      <figure className="mt-8">
        <div className="relative aspect-[1320/560] overflow-hidden rounded-lg">
          <Photo
            src={article.image}
            alt={article.imageAlt ?? ""}
            priority
            sizes="(min-width: 1320px) 1320px, 100vw"
          />
        </div>
        {article.caption && <figcaption className="text-xs leading-4 text-[#71717b]">{article.caption}</figcaption>}
      </figure>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <div className="flex flex-col [&>*+*]:mt-6 [&>*+blockquote]:mt-10 [&>*+h2]:mt-10 [&>blockquote+*]:mt-10 [&>h2+*]:mt-4">
            {article.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </div>

          {article.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="block rounded-[4px] border border-[#e4e4e7] bg-white px-3 py-2 text-xs leading-4 font-bold text-[#3f3f46] transition-colors hover:border-[#09090b] hover:bg-[#09090b] hover:text-white"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside aria-label="Related" className="flex min-w-0 flex-col lg:self-start">
          <AdSlot className="h-32" />

          <section className="pt-8">
            <h2 className="text-sm leading-5 font-black tracking-[0.7px] text-[#09090b] uppercase">Related stories</h2>
            <div className="mt-4 flex flex-col">
              {article.related.map((related) => (
                <div key={related.id} className="border-b border-line pt-3 pb-3 first:pt-0 last:border-b-0 last:pb-0">
                  <NewsCard article={related} compact />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </Container>
  );
}

export default function ArticlePage(props: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading article" className="min-h-[1200px]" />}>
      <ArticleContent params={props.params} />
    </Suspense>
  );
}
