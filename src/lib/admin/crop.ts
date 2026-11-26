/** Geometry of the crop box. Every value is in pixels of the original picture. */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

/** Shape of a crop box as width : height. */
export interface CropRatio {
  width: number;
  height: number;
}

/** What is dragged: the whole box or one of its corners. */
export type CropHandle = "move" | "nw" | "ne" | "sw" | "se";

/** Smallest side the API accepts. */
export const MIN_CROP = 10;

/** The shape each picture place of the website works best with. Ad banners take theirs from lib/ads. */
export const cropRatios = {
  featured: { width: 1600, height: 840 },
  social: { width: 1200, height: 630 },
  gallery: { width: 3, height: 2 },
  avatar: { width: 1, height: 1 },
  category: { width: 16, height: 9 },
} satisfies Record<string, CropRatio>;

function clamp(value: number, min: number, max: number): number {
  // The maximum wins when the picture is smaller than the minimum.
  return Math.min(Math.max(value, min), max);
}

/** The largest centred box of the given shape, or the whole picture when the shape is free. */
export function initialCrop(image: ImageSize, ratio: number | null): CropRect {
  if (!ratio) {
    return { x: 0, y: 0, width: image.width, height: image.height };
  }

  const width = Math.min(image.width, image.height * ratio);
  const height = width / ratio;

  return { x: (image.width - width) / 2, y: (image.height - height) / 2, width, height };
}

export function moveCrop(rect: CropRect, dx: number, dy: number, image: ImageSize): CropRect {
  return {
    ...rect,
    x: clamp(rect.x + dx, 0, image.width - rect.width),
    y: clamp(rect.y + dy, 0, image.height - rect.height),
  };
}

/** Drags one corner; the opposite corner stays where it is and the box stays inside the picture. */
export function resizeCrop(
  rect: CropRect,
  handle: Exclude<CropHandle, "move">,
  dx: number,
  dy: number,
  image: ImageSize,
  ratio: number | null,
): CropRect {
  const fromLeft = handle.endsWith("w");
  const fromTop = handle.startsWith("n");
  const anchorX = fromLeft ? rect.x + rect.width : rect.x;
  const anchorY = fromTop ? rect.y + rect.height : rect.y;
  const maxWidth = fromLeft ? anchorX : image.width - anchorX;
  const maxHeight = fromTop ? anchorY : image.height - anchorY;
  const growX = fromLeft ? -dx : dx;
  const growY = fromTop ? -dy : dy;

  let width: number;
  let height: number;

  if (ratio) {
    // Follow whichever direction the pointer moved further.
    const wanted = Math.abs(growX) >= Math.abs(growY * ratio) ? rect.width + growX : (rect.height + growY) * ratio;
    width = clamp(wanted, Math.max(MIN_CROP, MIN_CROP * ratio), Math.min(maxWidth, maxHeight * ratio));
    height = width / ratio;
  } else {
    width = clamp(rect.width + growX, MIN_CROP, maxWidth);
    height = clamp(rect.height + growY, MIN_CROP, maxHeight);
  }

  return { x: fromLeft ? anchorX - width : anchorX, y: fromTop ? anchorY - height : anchorY, width, height };
}

/** Whole pixels that are guaranteed to lie inside the picture. */
export function toPixels(rect: CropRect, image: ImageSize): CropRect {
  const x = Math.max(0, Math.round(rect.x));
  const y = Math.max(0, Math.round(rect.y));

  return {
    x,
    y,
    width: Math.min(Math.round(rect.width), image.width - x),
    height: Math.min(Math.round(rect.height), image.height - y),
  };
}
