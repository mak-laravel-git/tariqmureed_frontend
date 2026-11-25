import Link from "next/link";

import type { Author } from "@/lib/api/types";
import { cn } from "@/lib/cn";

interface AuthorLinkProps {
  author: Author;
  className?: string;
}

/** A reporter's name that opens their profile and all their stories; a desk byline without a profile stays plain text. */
export function AuthorLink({ author, className }: AuthorLinkProps) {
  if (author.hasProfile === false) {
    return <span className={className}>{author.name}</span>;
  }

  return (
    <Link href={`/writers/${author.slug}`} className={cn("hover:underline focus-visible:underline", className)}>
      {author.name}
    </Link>
  );
}
