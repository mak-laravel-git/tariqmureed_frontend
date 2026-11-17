import { cn } from "@/lib/cn";

import { Container } from "./Container";

interface SectionSkeletonProps {
  tone?: "white" | "surface";
  /** Approximate height (px) of the content block to avoid layout shift. */
  height: number;
  label?: string;
}

/** Pulsing placeholder shown while a streamed section is loading. */
export function SectionSkeleton({ tone = "white", height, label = "Loading" }: SectionSkeletonProps) {
  return (
    <div role="status" aria-label={label} className={cn("py-12 lg:py-20", tone === "surface" ? "bg-surface" : "bg-white")}>
      <Container>
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-chip" />
        <div
          className="animate-pulse rounded-lg bg-chip/70"
          style={{ minHeight: Math.max(height - 160, 120) }}
        />
      </Container>
    </div>
  );
}
