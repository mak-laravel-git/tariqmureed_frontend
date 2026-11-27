import { cn } from "@/lib/cn";

import { Photo } from "./Photo";

interface PlayerPhotoProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Edge a head shot sits against when its frame is taller than the picture. */
  anchor?: "top" | "bottom";
}

/**
 * A player's picture in a portrait frame. The cricket data feed supplies small square head shots,
 * which are shown whole on white; any other picture fills the frame.
 */
export function PlayerPhoto({ anchor = "bottom", ...photo }: PlayerPhotoProps) {
  const isHeadShot = photo.src.startsWith("https://cdn.sportmonks.com/");

  return (
    <Photo
      {...photo}
      // "!" because Photo's own object-cover would otherwise win.
      className={isHeadShot ? cn("bg-white object-contain!", anchor === "top" ? "object-top" : "object-bottom") : undefined}
    />
  );
}
