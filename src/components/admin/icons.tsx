import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const paths: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  article: (
    <>
      <path d="M6 3.5h9l3.5 3.5v13.5H6V3.5Z" />
      <path d="M9 11h6M9 14.5h6M9 7.5h3" />
    </>
  ),
  draft: (
    <>
      <path d="M6 3.5h9l3.5 3.5v13.5H6V3.5Z" />
      <path d="M9 12h6M9 15.5h4" />
    </>
  ),
  folder: <path d="M3.5 6.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.5Z" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 18 5-5 4 4 3-3 4.5 4.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <path d="M16 5.5a3 3 0 0 1 0 6M18 14.8c1.6.6 2.7 2 3 4.7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.8 3.7-5.8 7-5.8s6.2 2 7 5.8" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5Z" />
      <path d="M8 6.5H4.5v1.5a3 3 0 0 0 3.5 3M16 6.5h3.5V8a3 3 0 0 1-3.5 3M12 13.5v3.5M8.5 20h7M10 17h4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4h3l8 4.5v-13L7 10H4Z" />
      <path d="M18.5 9.5a4 4 0 0 1 0 5" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3.5a5.5 5.5 0 0 1-11 0V7.5Z" />
      <path d="M12 16.5V21" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  shield: <path d="M12 3 4.5 6v5.5c0 4.5 3.1 7.7 7.5 9.5 4.4-1.8 7.5-5 7.5-9.5V6L12 3Z" />,
  pulse: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.3 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.3-3.5-8.5s1-6 3.5-8.5Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  storage: (
    <>
      <rect x="3.5" y="4.5" width="17" height="6" rx="1.5" />
      <rect x="3.5" y="13.5" width="17" height="6" rx="1.5" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <circle cx="9" cy="11.5" r="1.8" />
      <path d="M6.5 16c.4-1.4 1.4-2 2.5-2s2.1.6 2.5 2M14.5 10.5h3.5M14.5 13.5h3.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  upload: (
    <>
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15L6 16.5Z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  panel: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  logout: (
    <>
      <path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10" />
      <path d="M14 8.5 18 12l-4 3.5M18 12H9" />
    </>
  ),
};

export type AdminIconName = keyof typeof paths;

export function AdminIcon({ name, ...props }: { name: string } & IconProps) {
  return (
    <svg {...base} {...props}>
      {paths[name] ?? paths.dashboard}
    </svg>
  );
}
