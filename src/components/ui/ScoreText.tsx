/**
 * A side's score. A two-innings score ("342/10 & 238/10") is stacked on phones, so the team name beside it keeps
 * its room, and runs on one line from the small breakpoint up.
 */
export function ScoreText({ score }: { score: string }) {
  return (
    <>
      {score.split(" & ").map((innings, index) => (
        <span key={index} className="block whitespace-nowrap sm:inline">
          {index > 0 && <span className="sm:pl-1.5">&amp; </span>}
          {innings}
        </span>
      ))}
    </>
  );
}
