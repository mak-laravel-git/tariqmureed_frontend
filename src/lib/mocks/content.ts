import type {
  Article,
  Author,
  BattingLeaders,
  FeaturedStories,
  StatHighlight,
  Tournament,
  TrendingPlayer,
  Video,
  Writer,
} from "@/lib/api/types";

const img = (name: string) => `/images/news/${name}`;

/** ISO timestamp for "n minutes ago"; mock content always looks freshly published. */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const authors = {
  priya: { slug: "priya-nair", name: "Priya Nair" },
  tom: { slug: "tom-whitfield", name: "Tom Whitfield" },
  lena: { slug: "lena-ford", name: "Lena Ford" },
  saad: { slug: "saad-mehmood", name: "Saad Mehmood" },
  arif: { slug: "arif-hossain", name: "Arif Hossain" },
  daniel: { slug: "daniel-okoye", name: "Daniel Okoye" },
} satisfies Record<string, Author>;

function article(
  id: number,
  slug: string,
  fields: Omit<Article, "id" | "slug" | "publishedAt"> & { minutesAgo: number },
): Article {
  const { minutesAgo: ago, ...rest } = fields;
  return { id, slug, publishedAt: minutesAgo(ago), ...rest };
}

export function buildMockArticles() {
  const mumbai = article(1, "mumbais-chase-goes-deep-wankhede-final-over-finish", {
    title: "Mumbai's chase goes deep: Wankhede set for a final-over finish",
    excerpt:
      "Suryakumar Yadav and Tilak Varma drag Mumbai to the brink before Pathirana returns for the death overs",
    image: img("mumbai-chase.jpg"),
    imageAlt: "Suryakumar Yadav plays through the off side",
    category: "IPL 2026",
    author: authors.priya,
    minutesAgo: 1,
    readMinutes: 6,
    caption: "Suryakumar Yadav hits through the off side during the IPL 2026 match in Mumbai.",
    credit: "TMN Sports / Action Images",
  });

  const smith = article(2, "smiths-96-keeps-australia-in-it-adelaide", {
    title: "Smith's 96 keeps Australia in it as England's lead grows in Adelaide",
    excerpt: "A composed, unlovely innings from Steve Smith",
    image: img("stadium-night.jpg"),
    category: "International",
    author: authors.tom,
    minutesAgo: 4 * 60,
    readMinutes: 5,
  });

  const hardik = article(3, "hardik-pandya-captaincy-judged-by-standard-nobody-set", {
    title: "Hardik Pandya's captaincy is being judged by a standard nobody set",
    excerpt: "The expectation gap around Mumbai's captain says more about the audience than the player",
    image: img("stadium-crowd.jpg"),
    category: "Analysis",
    author: authors.lena,
    minutesAgo: 7 * 60,
    readMinutes: 8,
  });

  const qalandars = article(4, "lahore-qalandars-building-psl-most-complete-squad", {
    title: "Lahore Qalandars are building the PSL's most complete squad",
    excerpt: "Depth in every department has turned Lahore into the side to beat",
    image: img("keeper-appeal.jpg"),
    category: "PSL 2026",
    author: authors.saad,
    minutesAgo: 8 * 60,
    readMinutes: 6,
  });

  const tamim = article(5, "tamims-58-sets-169-for-rangpur-riders", {
    title: "Tamim's 58 sets 169 for Rangpur Riders in BPL crunch",
    excerpt: "Fortune Barishal recovered from a slow start to post a competitive total in Dhaka",
    image: img("bpl-blue-helmet.jpg"),
    category: "BPL 2026",
    author: authors.arif,
    minutesAgo: 1,
    readMinutes: 4,
  });

  const squad = article(6, "india-name-15-member-squad-new-zealand-odi-series", {
    title: "India name 15-member squad for New Zealand ODI series",
    excerpt: "Gill to lead, with two uncapped players included and Jadeja rested for the first two matches",
    image: img("dialog-batsman.jpg"),
    category: "International",
    author: authors.arif,
    minutesAgo: 24 * 60,
    readMinutes: 4,
  });

  const chinnaswamy = article(7, "chinnaswamy-chase-how-rcb-hunted-down-187", {
    title: "Chinnaswamy chase: how RCB hunted down 187 with 8 balls left",
    excerpt: "A 96-run second-wicket stand and a death-overs plan that never involved a six",
    image: img("green-yellow-batsman.jpg"),
    category: "IPL 2026",
    author: authors.priya,
    minutesAgo: 2 * 24 * 60,
    readMinutes: 6,
  });

  const pitch = article(8, "adelaide-pitch-debate-is-really-about-scheduling", {
    title: "The Adelaide pitch debate is really a question about scheduling",
    excerpt: "Three-day Tests are not a format problem — they are a calendar problem",
    image: img("stadium-night.jpg"),
    category: "International",
    author: authors.tom,
    minutesAgo: 24 * 60,
    readMinutes: 7,
  });

  const halfway = article(9, "psl-2026-halfway-mark-five-things-the-table-tells-us", {
    title: "PSL 2026 at the halfway mark: five things the table tells us",
    excerpt: "Lahore's net run rate, Karachi's powerplay problem and the fight for fourth",
    image: img("floodlit-stadium.jpg"),
    category: "PSL 2026",
    author: authors.saad,
    minutesAgo: 2 * 24 * 60,
    readMinutes: 7,
  });

  const gill = article(10, "gills-92-completes-the-sweep-rewrites-odi-record-books", {
    title: "Gill's 92 completes the sweep and quietly rewrites the ODI record books",
    excerpt: "India's captain now averages 58.4 after 61 matches — a rate only three batters have matched",
    image: img("india-batsman.jpg"),
    category: "International",
    author: authors.daniel,
    minutesAgo: 19 * 60,
    readMinutes: 5,
  });

  const smriti = article(11, "smriti-mandhana-125-anchors-india-chase-australia-w", {
    title: "Smriti Mandhana's 125 anchors India's chase against Australia (W)",
    excerpt: "Thirteen boundaries, one hundred and a chase completed with fourteen balls remaining",
    image: img("portrait-smriti.jpg"),
    category: "Women's Cricket",
    author: authors.priya,
    minutesAgo: 2 * 24 * 60,
    readMinutes: 6,
  });

  const worldCup = (id: number) =>
    article(id, `t20-world-cup-2026-host-cities-venues-${id}`, {
      title: "T20 World Cup 2026: the host cities, venues and what to expect",
      excerpt: "Twenty teams, 55 matches, eight cities — and a scheduling puzzle across two countries",
      image: img("stadium-lights.jpg"),
      category: "T20 World Cup",
      author: authors.tom,
      minutesAgo: 3 * 24 * 60,
      readMinutes: 8,
    });

  return {
    featured: { lead: mumbai, side: [smith, hardik, qalandars] } satisfies FeaturedStories,
    latest: [tamim, squad, chinnaswamy, pitch, halfway, gill, smriti, worldCup(12), worldCup(13)],
    topHeadlines: [mumbai, tamim, smith],
    mostRead: [worldCup(14), mumbai],
  };
}

export const mockStatHighlights: StatHighlight[] = [
  { value: "11", label: "Sixes in tonight's chase", context: "MI vs CSK, Wankhede" },
  { value: "68.5%", label: "South Africa's WTC points", context: "Cycle 2025–27" },
  { value: "4,472", label: "Mandhana's ODI runs", context: "Most by an Indian (W)" },
  { value: "11.42", label: "BPL death-over economy", context: "Highest on record" },
];

export const mockTrendingPlayers: TrendingPlayer[] = [
  {
    id: 1,
    slug: "babar-azam",
    name: "Babar Azam",
    image: "/images/players/babar-azam.jpg",
    role: "Top-order batter",
    team: "Peshawar Zalmi",
    country: "Pakistan",
    rankLabel: "ODI #2",
    matches: 128,
    runs: 4295,
    average: 41.7,
  },
  {
    id: 2,
    slug: "rashid-khan",
    name: "Rashid Khan",
    image: "/images/players/rashid-khan.jpg",
    role: "Bowling all-rounder",
    team: "Afghanistan",
    country: "Afghanistan",
    rankLabel: "ODI #4",
    matches: 103,
    runs: 1341,
    average: 13.8,
  },
  {
    id: 3,
    slug: "tamim-iqbal",
    name: "Tamim Iqbal",
    image: "/images/players/tamim-iqbal.jpg",
    role: "Opening batter",
    team: "Fortune Barishal",
    country: "Bangladesh",
    rankLabel: "ODI #18",
    matches: 78,
    runs: 1758,
    average: 24.1,
  },
  {
    id: 4,
    slug: "shubman-gill",
    name: "Shubman Gill",
    image: "/images/players/shubman-gill.jpg",
    role: "Top-order batter",
    team: "India",
    country: "India",
    rankLabel: "ODI #1",
    matches: 27,
    runs: 682,
    average: 30.9,
  },
];

export function buildMockVideos(): Video[] {
  const description =
    "All the key moments from a 42nd match that produced 11 sixes and a finish decided in the final over.";

  return [
    {
      id: 1,
      slug: "highlights-mi-vs-csk-wankhede-thriller",
      title: "Highlights: MI vs CSK — Wankhede thriller goes to the wire",
      description,
      thumbnail: img("mumbai-chase.jpg"),
      category: "Highlights",
      duration: "8:42",
      publishedAt: minutesAgo(1),
      views: "1.2M",
    },
    {
      id: 2,
      slug: "tactical-review-chennai-spinners-middle-overs",
      title: "Tactical review: how Chennai's spinners slowed the middle overs",
      description: null,
      thumbnail: img("stadium-crowd.jpg"),
      category: "Analysis",
      duration: "11:03",
      publishedAt: minutesAgo(1),
      views: "214K",
    },
    {
      id: 3,
      slug: "smiths-96-every-boundary-masterclass-in-patience",
      title: "Smith's 96: every boundary from a masterclass in patience",
      description,
      thumbnail: img("stadium-night.jpg"),
      category: "Highlights",
      duration: "6:15",
      publishedAt: minutesAgo(3 * 60),
      views: "486K",
    },
    {
      id: 4,
      slug: "psl-unfiltered-lahore-bowling-machine-saad-mehmood",
      title: "PSL Unfiltered: Lahore's bowling machine, with Saad Mehmood",
      description: null,
      thumbnail: img("keeper-appeal.jpg"),
      category: "Shows",
      duration: "24:18",
      publishedAt: minutesAgo(24 * 60),
      views: "132K",
    },
  ];
}

export const mockTournaments: Tournament[] = [
  {
    id: 1,
    slug: "indian-premier-league",
    name: "Indian Premier League",
    image: img("stadium-crowd.jpg"),
    format: "T20",
    location: "India · 2026",
    status: "In progress",
    description:
      "The 19th season of the IPL features ten franchises across 74 matches, with the play-offs returning to Kolkata and Ahmedabad.",
    dateRange: "22 Mar – 31 May 2026",
    matchCount: 74,
  },
  {
    id: 2,
    slug: "pakistan-super-league",
    name: "Pakistan Super League",
    image: img("keeper-appeal.jpg"),
    format: "T20",
    location: "Pakistan · 2026",
    status: "In progress",
    description:
      "Eleven seasons in, the PSL continues to be Pakistan's premier T20 competition with six franchises and a double round-robin format.",
    dateRange: "11 Apr – 25 May 2026",
    matchCount: 34,
  },
  {
    id: 3,
    slug: "the-ashes",
    name: "The Ashes",
    image: img("stadium-night.jpg"),
    format: "Test",
    location: "England · Australia · 2026",
    status: "In progress",
    description:
      "Five Tests across Adelaide, Brisbane, Melbourne, Sydney and Perth decide the oldest rivalry in cricket.",
    dateRange: "14 Nov 2025 – 8 Jan 2026",
    matchCount: 5,
  },
];

export const mockBattingLeaders: BattingLeaders = {
  seasonLabel: "ODI · 2025-26",
  note: "Minimum 8 innings",
  rows: [
    { playerName: "Shubman Gill", team: "IND", matches: 14, runs: 1128, highScore: "208", average: 62.7, strikeRate: 104.1, hundreds: 4 },
    { playerName: "Rohit Sharma", team: "IND", matches: 14, runs: 984, highScore: "131*", average: 53.9, strikeRate: 112.4, hundreds: 3 },
    { playerName: "Babar Azam", team: "PAK", matches: 12, runs: 912, highScore: "158", average: 60.8, strikeRate: 88.6, hundreds: 3 },
    { playerName: "Pathum Nissanka", team: "SL", matches: 15, runs: 878, highScore: "134", average: 51.6, strikeRate: 96.2, hundreds: 2 },
    { playerName: "Travis Head", team: "AUS", matches: 13, runs: 846, highScore: "142", average: 49.7, strikeRate: 118.4, hundreds: 2 },
    { playerName: "Smriti Mandhana", team: "IND (W)", matches: 12, runs: 812, highScore: "136", average: 58, strikeRate: 94.8, hundreds: 3 },
  ],
};

const avatar = (name: string) => `/images/writers/${name}`;

export const mockWriters: Writer[] = [
  {
    id: 1,
    slug: "arif-hossain",
    name: "Arif Hossain",
    title: "Senior Cricket Correspondent",
    bio: "Arif has covered four World Cups and reported from 38 Test venues. He leads TMN Sports' subcontinent coverage and writes the weekly match column.",
    avatar: avatar("arif-hossain.jpg"),
    articleCount: 412,
    since: 2016,
  },
  {
    id: 2,
    slug: "lena-ford",
    name: "Lena Ford",
    title: "Chief Features Writer",
    bio: "Lena writes long-form profiles and investigations. She was named Sports Feature Writer of the Year in 2024 and edits the weekend features desk.",
    avatar: avatar("lena-ford.jpg"),
    articleCount: 187,
    since: 2018,
  },
  {
    id: 3,
    slug: "daniel-okoye",
    name: "Daniel Okoye",
    title: "Data & Statistics Editor",
    bio: "Daniel builds the numbers behind TMN Sports' match coverage, from expected-run models to bowler-matchup tools and the live stats centre.",
    avatar: avatar("daniel-okoye.jpg"),
    articleCount: 236,
    since: 2019,
  },
  {
    id: 4,
    slug: "saad-mehmood",
    name: "Saad Mehmood",
    title: "Pakistan Super League Reporter",
    bio: "Based in Lahore, Saad covers the PSL and Pakistan's international calendar, with a focus on domestic talent and franchise strategy.",
    avatar: avatar("saad-mehmood.jpg"),
    articleCount: 158,
    since: 2020,
  },
  {
    id: 5,
    slug: "priya-nair",
    name: "Priya Nair",
    title: "Live Match Editor",
    bio: "Priya runs the TMN Sports live blog on match days and writes the tactical review published within an hour of the final ball.",
    avatar: avatar("priya-nair.jpg"),
    articleCount: 301,
    since: 2021,
  },
  {
    id: 6,
    slug: "tom-whitfield",
    name: "Tom Whitfield",
    title: "Australia & Ashes Correspondent",
    bio: "Tom has followed every Ashes series since 2009. He files from the press box at every Test on the Australian summer calendar.",
    avatar: avatar("tom-whitfield.jpg"),
    articleCount: 269,
    since: 2014,
  },
];
