import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Article } from "@/lib/api/types";

export function CategoryLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] leading-[15px] font-black tracking-[1.6px] text-[#d08700] uppercase">{children}</p>
  );
}

/** Image-led story tile used in the news grid and the "Related stories" sidebar. */
export function NewsCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article className="group">
      <Link
        href={`/news/${article.slug}`}
        aria-label={article.title}
        className={`relative block overflow-hidden ${compact ? "aspect-[240/84] rounded-[4px] bg-[#e4e4e7]" : "aspect-[419/270] rounded-[4px] bg-[#e4e4e7]"}`}
      >
        <Photo
          src={article.image}
          alt={article.imageAlt ?? ""}
          sizes={compact ? "260px" : "(min-width: 1320px) 480px, (min-width: 768px) 45vw, 100vw"}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className={compact ? "mt-3" : "mt-4"}>
        <CategoryLabel>{article.category}</CategoryLabel>
        <h3
          className={
            compact
              ? "mt-2 text-sm leading-[17.5px] font-extrabold text-[#09090b]"
              : "mt-2 text-lg leading-[22.5px] font-extrabold text-[#09090b]"
          }
        >
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p
          className={
            "mt-3 text-xs leading-4 text-[#71717b]"
          }
        >
          <TimeAgo iso={article.publishedAt} /> · By {article.author.name}
        </p>
      </div>
    </article>
  );
}
