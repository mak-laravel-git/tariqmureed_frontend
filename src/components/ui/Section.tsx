import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  tone?: "white" | "surface";
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
}

export function Section({ children, tone = "white", id, className, ...aria }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(tone === "surface" ? "bg-surface" : "bg-white", "py-10 sm:py-14 lg:py-20", className)}
      {...aria}
    >
      <Container>{children}</Container>
    </section>
  );
}
