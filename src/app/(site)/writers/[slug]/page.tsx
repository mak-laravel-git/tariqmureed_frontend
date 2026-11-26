import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NewsCard } from "@/components/news/NewsCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { getSeo, getWriter, getWriterArticles } from "@/lib/api/endpoints";
import { absoluteUrl, breadcrumbSchema, getSiteUrl, sharingMetadata } from "@/lib/seo";
import { firstParam, pageHref, type SearchParams } from "@/lib/url";

const PAGE_SIZE = 12;

export async function generateMetadata(props: PageProps<"/writers/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const writer = await getWriter(slug);

  if (!writer) {
    return {};
  }

  const seo = await getSeo();
  const title = `${writer.name}: articles and profile`;
  const description = writer.bio || `Read every story written by ${writer.name} for TMN Sport.`;
  const path = `/writers/${writer.slug}`;

  return { title, description, alternates: { canonical: path }, ...sharingMetadata(seo, { title, description, image: writer.avatar, path }) };
}

/** The reporter's published stories, newest first. A story shows up here as soon as it goes live. */
async function WriterArticles({ slug, name, searchParams }: { slug: string; name: string; searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const requested = Number(firstParam(params.limit));
  const limit = Number.isFinite(requested) && requested >= PAGE_SIZE ? Math.min(requested, 96) : PAGE_SIZE;
  const { articles, total } = await getWriterArticles(slug, limit);

  return (
    <Container className="pt-10 pb-16">
      <div className="border-b border-[#e4e4e7] pb-4">
        <h2 className="text-[30px] leading-9 font-bold text-[#09090b]">Articles by {name}</h2>
        <p className="pt-1 text-sm leading-5 text-[#71717b]">Newest first</p>
      </div>

      {articles.length > 0 ? (
        <ul className="grid gap-x-6 gap-y-10 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <NewsCard article={article} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-muted">
          No stories have been published by {name} yet.
        </p>
      )}

      {total > articles.length && (
        <div className="flex justify-center pt-10">
          <Link
            href={pageHref(params, { limit: String(limit + PAGE_SIZE) }, undefined, `/writers/${slug}`)}
            replace
            scroll={false}
            className="flex h-11 items-center rounded-[4px] border border-[#09090b] px-6 text-xs font-black tracking-[0.6px] uppercase transition-colors hover:bg-[#09090b] hover:text-white"
          >
            Show more stories
          </Link>
        </div>
      )}
    </Container>
  );
}

async function WriterView({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> }) {
  const { slug } = await params;
  const writer = await getWriter(slug);

  if (!writer) {
    notFound();
  }

  const site = await getSiteUrl();
  const path = `/writers/${writer.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${site}${path}`,
          mainEntity: {
            "@type": "Person",
            "@id": `${site}${path}#person`,
            name: writer.name,
            url: `${site}${path}`,
            ...(writer.title ? { jobTitle: writer.title } : {}),
            ...(writer.bio ? { description: writer.bio } : {}),
            ...(writer.avatar ? { image: absoluteUrl(site, writer.avatar) } : {}),
            worksFor: { "@type": "Organization", name: "TMN Sport", url: site },
          },
        }}
      />
      <JsonLd data={breadcrumbSchema(site, [{ name: "Home", path: "/" }, { name: "News", path: "/news" }, { name: writer.name, path }])} />
      <section className="bg-[#2d2d2d] text-white">
        <Container className="grid items-center gap-8 py-12 md:grid-cols-[200px_minmax(0,1fr)]">
          <div className="relative size-[200px] overflow-hidden rounded-full bg-[#09090b]">
            <Photo src={writer.avatar} alt={writer.name} priority sizes="200px" />
          </div>
          <div className="min-w-0">
            <p className="text-xs leading-4 font-black tracking-[0.6px] text-[#fdc700] uppercase">{writer.title}</p>
            <h1 className="pt-3 text-4xl leading-[1.05] font-bold text-white sm:text-[48px] sm:leading-[48px]">{writer.name}</h1>
            <p className="max-w-[640px] pt-5 text-base leading-7 text-[#d4d4d8]">{writer.bio}</p>
            <dl className="flex flex-wrap gap-8 pt-7">
              <div>
                <dt className="text-sm leading-5 text-[#71717b]">Articles</dt>
                <dd className="text-sm leading-5 font-bold text-white">{writer.articleCount}</dd>
              </div>
              <div>
                <dt className="text-sm leading-5 text-[#71717b]">With TMN Sport since</dt>
                <dd className="text-sm leading-5 font-bold text-white">{writer.since}</dd>
              </div>
            </dl>
            <Link href="/news" className="mt-8 inline-block text-sm font-bold text-[#fdc700] hover:underline">
              Read the latest news →
            </Link>
          </div>
        </Container>
      </section>

      <Suspense fallback={<div role="status" aria-label="Loading articles" className="min-h-[480px]" />}>
        <WriterArticles slug={writer.slug} name={writer.name} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

export default function WriterPage(props: PageProps<"/writers/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading writer" className="min-h-[600px]" />}>
      <WriterView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
