import { cn } from "@/lib/cn";

/** The width from which the two innings share a line; written out in full so Tailwind finds the classes. */
const oneLineFrom = {
  sm: { innings: "sm:inline", separator: "sm:pl-1.5" },
  xl: { innings: "xl:inline", separator: "xl:pl-1.5" },
};

/**
 * A side's score. A two-innings score ("342/10 & 238/10") is stacked on narrow screens, so the team name beside it
 * keeps its room, and runs on one line from the `inlineFrom` breakpoint up.
 */
export function ScoreText({ score, inlineFrom = "sm" }: { score: string; inlineFrom?: keyof typeof oneLineFrom }) {
  return (
    <>
      {score.split(" & ").map((innings, index) => (
        <span key={index} className={cn("block whitespace-nowrap", oneLineFrom[inlineFrom].innings)}>
          {index > 0 && <span className={oneLineFrom[inlineFrom].separator}>&amp; </span>}
          {innings}
        </span>
      ))}
    </>
  );
}
