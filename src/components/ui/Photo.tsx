import Image from "next/image";

import { cn } from "@/lib/cn";

interface PhotoProps {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Cover-fit image that fills its (relatively positioned) parent. Works with bundled
 * /public paths and with absolute URLs served by the Laravel API.
 */
export function Photo({ src, alt = "", sizes, priority, className }: PhotoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
