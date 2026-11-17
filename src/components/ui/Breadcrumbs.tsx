import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

/** "News / International / Match analysis" trail. */
export function Breadcrumbs({
  items,
  separator = "/",
  variant = "default",
  className,
}: {
  items: Crumb[];
  separator?: string;
  /** "article" matches the muted bold trail used on the news article page. */
  variant?: "default" | "article";
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={
        className ??
        (variant === "article"
          ? "py-1.5 text-xs leading-4 font-bold text-[#71717b]"
          : "text-xs leading-[18px] font-medium text-charade")
      }
    >
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-x-1.5">
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 && <span aria-hidden="true">{separator}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
