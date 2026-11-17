import Link from "next/link";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWriters } from "@/lib/api/endpoints";
import type { Writer } from "@/lib/api/types";

function WriterCard({ writer }: { writer: Writer }) {
  return (
    <article className="flex gap-3 rounded-lg border border-line bg-white p-3">
      <Link
        href={`/writers/${writer.slug}`}
        aria-label={writer.name}
        className="relative block size-[54px] shrink-0 overflow-hidden rounded-full ring-2 ring-gold/60 sm:size-[66px]"
      >
        <Photo src={writer.avatar} alt="" sizes="66px" />
      </Link>

      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="text-[15px] leading-[22px] font-bold text-ink">
          <Link href={`/writers/${writer.slug}`} className="hover:underline">
            {writer.name}
          </Link>
        </h3>
        <p className="text-xs leading-[18px] font-bold text-[#b38600]">{writer.title}</p>
        <p className="line-clamp-3 pt-0.5 text-[12.5px] leading-[19px] text-muted">{writer.bio}</p>
        <p className="pt-1 text-xs leading-[18px] font-semibold text-ink">
          {writer.articleCount} articles · since {writer.since}
        </p>
      </div>
    </article>
  );
}

export async function WritersSection() {
  const writers = await getWriters();

  return (
    <Section tone="surface" aria-labelledby="writers-title">
      <div className="flex flex-col gap-5">
        <SectionHeading
          id="writers-title"
          title="TMN Sport Writers"
          description="The journalists and analysts behind our coverage."
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {writers.map((writer) => (
            <WriterCard key={writer.id} writer={writer} />
          ))}
        </div>
      </div>
    </Section>
  );
}
