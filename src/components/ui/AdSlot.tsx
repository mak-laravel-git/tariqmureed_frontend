import Image from "next/image";

import { AdSenseUnit } from "@/components/ui/AdSenseUnit";
import { adPlacements, type AdPlacement } from "@/lib/ads";
import { apiConfig } from "@/lib/api/config";
import { getAds, getPublicSettings } from "@/lib/api/endpoints";
import { cn } from "@/lib/cn";

interface AdSlotProps {
  /** Which place of the site this is; the admin dashboard decides what runs there. */
  placement: AdPlacement;
  className?: string;
}

/**
 * An advertisement box. What it shows is set in the admin dashboard (Advertisement Management): an image banner
 * or a Google AdSense unit. A placement with no ad running shows nothing on the live site (a dashed placeholder
 * is drawn instead while the site runs on mock data, so the layout can still be reviewed).
 */
export async function AdSlot({ placement, className }: AdSlotProps) {
  const [ads, settings] = await Promise.all([getAds(), getPublicSettings()]);
  const ad = ads[placement];
  const { width, height, label } = adPlacements[placement];

  if (ad?.type === "image" && ad.image) {
    const banner = <Image src={ad.image} alt={ad.name} width={width} height={height} unoptimized className="h-auto max-w-full" />;

    return (
      <aside aria-label="Advertisement" className={cn("flex flex-col items-center justify-center gap-1 overflow-hidden", className)}>
        <p className="text-[10px] leading-[15px] font-bold tracking-[2.2px] text-[#9f9fa9] uppercase">Advertisement</p>
        {ad.href ? (
          <a href={ad.href} target="_blank" rel="sponsored noopener noreferrer" className="block max-w-full">
            {banner}
          </a>
        ) : (
          banner
        )}
      </aside>
    );
  }

  if (ad?.type === "adsense" && ad.slot && settings.adsenseClientId) {
    return (
      <aside aria-label="Advertisement" className={cn("flex flex-col items-center justify-center gap-1 overflow-hidden", className)}>
        <p className="text-[10px] leading-[15px] font-bold tracking-[2.2px] text-[#9f9fa9] uppercase">Advertisement</p>
        <AdSenseUnit clientId={settings.adsenseClientId} slot={ad.slot} />
      </aside>
    );
  }

  if (!apiConfig.useMocks) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-[#d4d4d8] bg-[#f4f4f5] px-4 py-8 text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] leading-[15px] font-bold tracking-[2.2px] text-[#9f9fa9] uppercase">Advertisement</p>
        <p className="pt-1 text-sm leading-5 font-semibold text-charade">{label}</p>
        <p className="text-[11px] leading-[16.5px] text-muted">
          {width} × {height} · no ad set in the dashboard
        </p>
      </div>
    </aside>
  );
}
