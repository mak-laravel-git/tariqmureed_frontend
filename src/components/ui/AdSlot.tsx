import { cn } from "@/lib/cn";

interface AdSlotProps {
  /** Human readable format, e.g. "300 × 250 — Medium Rectangle". Leave empty for a bare slot. */
  format?: string;
  note?: string;
  className?: string;
}

/** Placeholder rendered where an ad creative will be served. */
export function AdSlot({ format, note = "Sponsored · no creative available", className }: AdSlotProps) {
  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-[#d4d4d8] bg-[#f4f4f5] px-4 py-8 text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] leading-[15px] font-bold tracking-[2.2px] text-[#9f9fa9] uppercase">
          Advertisement
        </p>
        {format && <p className="pt-1 text-sm leading-5 font-semibold text-charade">{format}</p>}
        {format && note && <p className="text-[11px] leading-[16.5px] text-muted">{note}</p>}
      </div>
    </aside>
  );
}
