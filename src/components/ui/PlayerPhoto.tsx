import { cn } from "@/lib/cn";

import { Photo } from "./Photo";

/** The cricket data feed's own "no photo" picture, also used when a player has none at all. */
const PLACEHOLDER_IMAGE = "https://cdn.sportmonks.com/images/cricket/placeholder.png";

/** Whether the picture shows the player, rather than a stand-in. */
export function hasPlayerPhoto(image: string): boolean {
  return image !== "" && !image.includes("placeholder");
}

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
export function PlayerPhoto({ src, anchor = "bottom", ...photo }: PlayerPhotoProps) {
  const image = src || PLACEHOLDER_IMAGE;
  const isFromFeed = image.startsWith("https://cdn.sportmonks.com/");
  const position = !hasPlayerPhoto(image) ? "p-6 object-center" : anchor === "top" ? "object-top" : "object-bottom";

  return (
    <Photo
      {...photo}
      src={image}
      // "!" because Photo's own object-cover would otherwise win.
      className={isFromFeed ? cn("bg-white object-contain!", position) : undefined}
    />
  );
}
