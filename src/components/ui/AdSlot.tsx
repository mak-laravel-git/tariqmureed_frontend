import Image from "next/image";

import { AdSenseUnit } from "@/components/ui/AdSenseUnit";
import { SampleAd } from "@/components/ui/SampleAd";
import { adPlacements, type AdPlacement } from "@/lib/ads";
import { getAds, getPublicSettings } from "@/lib/api/endpoints";
import { cn } from "@/lib/cn";

interface AdSlotProps {
  /** Which place of the site this is; the admin dashboard decides what runs there. */
  placement: AdPlacement;
  className?: string;
}

/**
 * An advertisement box. What it shows is set in the admin dashboard (Advertisement Management): an image banner
 * or a Google AdSense unit. A placement with no ad running shows a dummy ad, which gives way to the real one.
 */
export async function AdSlot({ placement, className }: AdSlotProps) {
  const [ads, settings] = await Promise.all([getAds(), getPublicSettings()]);
  const ad = ads[placement];
  const { width, height } = adPlacements[placement];

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

  return <SampleAd box={adPlacements[placement].sample} className={className} />;
}
