import { countryCode, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/cn";

interface CountryNameProps {
  name: string;
  className?: string;
}

/**
 * A country's name with its flag in front. Names that are not a country (a team, a series) are shown as plain text.
 * The flag is decorative: the name next to it already says the country.
 */
export function CountryName({ name, className }: CountryNameProps) {
  const code = countryCode(name);

  if (!code) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny flag from the flag CDN */}
      <img
        src={flagUrl(code, 40)}
        srcSet={`${flagUrl(code, 40)} 1x, ${flagUrl(code, 80)} 2x`}
        alt=""
        width={20}
        height={15}
        loading="lazy"
        className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
      />
      {name}
    </span>
  );
}
