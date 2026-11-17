import { cn } from "@/lib/cn";

interface LiveDotProps {
  tone?: "live" | "white";
  /** Dot diameter in px. */
  size?: number;
  pulse?: boolean;
  className?: string;
}

/** Small round indicator; pulses to signal a live event. */
export function LiveDot({ tone = "live", size = 8, pulse = true, className }: LiveDotProps) {
  const color = tone === "live" ? "bg-live" : "bg-white";

  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {pulse && <span className={cn("live-ping absolute inset-0 rounded-full", color)} />}
      <span className={cn("relative rounded-full", color)} style={{ width: size, height: size }} />
    </span>
  );
}
