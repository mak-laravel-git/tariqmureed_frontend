import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import type { Article } from "@/lib/api/types";

export function FeaturedNewsCard({ article }: { article: Article }) {
  return (
    <article className="grid grid-cols-1 overflow-hidden rounded-lg bg-[#09090b] md:grid-cols-[minmax(0,1fr)_420px]">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className="relative block aspect-[16/10] md:aspect-auto md:min-h-[288px]"
      >
        <Photo
          src={article.image}
          alt={article.imageAlt ?? ""}
          priority
          sizes="(min-width: 1320px) 570px, (min-width: 768px) 55vw, 100vw"
        />
      </Link>

      <div className="flex flex-col justify-end p-6 lg:p-7">
        <span className="block w-full rounded-[4px] bg-[#fed402] px-2.5 py-1 text-xs leading-[15px] font-black tracking-[1.5px] text-black capitalize">
          Featured
        </span>
        <h2 className="pt-5 text-[26px] leading-[1.2] font-black text-white lg:text-[30px] lg:leading-[37.5px]">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="pt-4 text-sm leading-5 text-[#9f9fa9]">{article.excerpt}</p>
      </div>
    </article>
  );
}
