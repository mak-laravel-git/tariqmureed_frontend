import type { ReactNode } from "react";

import { Container } from "./Container";

interface PageIntroProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Renders the title in capitals (used by the legal pages). */
  uppercase?: boolean;
  children?: ReactNode;
}

/** Grey page header used by the listing pages: eyebrow, large title and one-line summary. */
export function PageIntro({ title, description, eyebrow = "TMN Sport", uppercase, children }: PageIntroProps) {
  return (
    <section className="bg-surface">
      <Container className="py-16">
        <p className="text-[11px] leading-[16.5px] font-black tracking-[2.42px] text-[#d08700] uppercase">{eyebrow}</p>
        <h1
          className={`pt-3 ${uppercase ? "uppercase tracking-[-1.5px] text-[#151617] " : "text-[#111111] "}text-[40px] leading-[1.1] font-bold sm:text-5xl lg:text-[60px] lg:leading-[60px]`}
        >
          {title}
        </h1>
        {description && <p className="max-w-[672px] pt-4 text-base leading-6 text-[#2f343d]">{description}</p>}
        {children}
      </Container>
    </section>
  );
}
