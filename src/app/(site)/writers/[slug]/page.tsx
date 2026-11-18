import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { getWriter } from "@/lib/api/endpoints";

async function WriterView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const writer = await getWriter(slug);

  if (!writer) {
    notFound();
  }

  return (
    <section className="bg-[#2d2d2d] text-white">
      <Container className="grid items-center gap-8 py-12 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative size-[200px] overflow-hidden rounded-full bg-[#09090b]">
          <Photo src={writer.avatar} alt={writer.name} priority sizes="200px" />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-4 font-black tracking-[0.6px] text-[#fdc700] uppercase">{writer.title}</p>
          <h1 className="pt-3 text-[48px] leading-[48px] font-bold text-white">{writer.name}</h1>
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
  );
}

export default function WriterPage(props: PageProps<"/writers/[slug]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading writer" className="min-h-[600px]" />}>
      <WriterView params={props.params} />
    </Suspense>
  );
}
