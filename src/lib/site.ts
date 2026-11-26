/** Static navigation and footer configuration shared by the layout components. */

export interface NavItem {
  label: string;
  href: string;
  /** Shows the red "live" dot between the first and remaining words of the label. */
  live?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Live Scores", href: "/live-scores", live: true },
  { label: "Schedule", href: "/schedule" },
  { label: "Series", href: "/series" },
  { label: "Teams", href: "/teams" },
  { label: "Rankings", href: "/rankings" },
  { label: "Stats", href: "/stats" },
  { label: "Records", href: "/records" },
  { label: "Videos", href: "/videos" },
];

export const socialLinks = [
  { label: "X (Twitter)", glyph: "X", href: "https://x.com" },
  { label: "Facebook", glyph: "f", href: "https://facebook.com" },
  { label: "Instagram", glyph: "◎", href: "https://instagram.com" },
  { label: "YouTube", glyph: "▶", href: "https://youtube.com" },
  { label: "TikTok", glyph: "♪", href: "https://tiktok.com" },
  { label: "WhatsApp", glyph: "✆", href: "https://whatsapp.com" },
] as const;

export const footerColumns: { title: string; links: NavItem[] }[] = [
  {
    title: "Quick links",
    links: mainNav.filter((item) => item.href !== "/"),
  },
  {
    title: "Categories",
    links: [
      { label: "IPL 2026", href: "/news?category=ipl-2026" },
      { label: "PSL 2026", href: "/news?category=psl-2026" },
      { label: "BPL 2026", href: "/news?category=bpl-2026" },
      { label: "International", href: "/news?category=international" },
      { label: "Analysis", href: "/news?category=analysis" },
      { label: "Women's Cricket", href: "/news?category=womens-cricket" },
      { label: "T20 World Cup", href: "/news?category=t20-world-cup" },
      { label: "World Test Championship", href: "/news?category=wtc" },
    ],
  },
  {
    title: "Series",
    links: [
      { label: "IPL", href: "/series/indian-premier-league" },
      { label: "PSL", href: "/series/pakistan-super-league" },
      { label: "BPL", href: "/series/bangladesh-premier-league" },
      { label: "Ashes", href: "/series/the-ashes" },
      { label: "World Cups", href: "/series/icc-world-cup" },
      { label: "T20 WC", href: "/series/t20-world-cup" },
    ],
  },
  {
    title: "Teams",
    links: [
      { label: "India", href: "/teams/india" },
      { label: "Australia", href: "/teams/australia" },
      { label: "England", href: "/teams/england" },
      { label: "Pakistan", href: "/teams/pakistan" },
      { label: "Bangladesh", href: "/teams/bangladesh" },
      { label: "New Zealand", href: "/teams/new-zealand" },
      { label: "South Africa", href: "/teams/south-africa" },
      { label: "Sri Lanka", href: "/teams/sri-lanka" },
    ],
  },
];

export const legalLinks: NavItem[] = [
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of use", href: "/terms-of-use" },
  { label: "Cookie preferences", href: "/cookie-preferences" },
];
