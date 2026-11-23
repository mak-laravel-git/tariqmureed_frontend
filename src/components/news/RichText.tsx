import type { ReactNode } from "react";

/** Inline marks the editor toolbar writes: **bold**, *italic*, __underline__ and [label](https://link). */
const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

export function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return <u key={index}>{part.slice(2, -2)}</u>;
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);

    if (link) {
      return (
        <a key={index} href={link[2]} className="font-semibold text-[#09090b] underline decoration-[#facc15] underline-offset-4 hover:bg-[#fef9c3]">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

/** YouTube and Vimeo watch links turned into embeddable players; anything else is shown as a plain link. */
export function videoEmbedUrl(address: string): string | null {
  try {
    const url = new URL(address);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }

    if (host === "youtube.com" && url.searchParams.get("v")) {
      return `https://www.youtube-nocookie.com/embed/${url.searchParams.get("v")}`;
    }

    if (host === "vimeo.com" && /^\/\d+$/.test(url.pathname)) {
      return `https://player.vimeo.com/video${url.pathname}`;
    }
  } catch {
    return null;
  }

  return null;
}
