import type { Article, ArticleDetail, NewsCategory, NewsPage } from "@/lib/api/types";

const stadium = (name: string) => `/images/stadiums/${name}`;

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const mockNewsCategories: NewsCategory[] = [
  { slug: "bangladesh", name: "Bangladesh" },
  { slug: "international", name: "International" },
  { slug: "domestic", name: "Domestic" },
  { slug: "features", name: "Features" },
];

const desk = { slug: "tmn-desk", name: "TMN Desk" };

interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  label: string;
  section: string;
  minutes: number;
}

const seeds: SeedArticle[] = [
  {
    slug: "a-new-era-begins-tactical-shifts-shaping-modern-international-cricket",
    title: "A new era begins: the tactical shifts shaping modern international cricket",
    excerpt: "Teams are rewriting the playbook on tempo, roles and match-ups.",
    image: stadium("kajaria-crowd.jpg"),
    label: "Analysis",
    section: "international",
    minutes: 18,
  },
  {
    slug: "bangladesh-name-a-balanced-squad-for-the-upcoming-odi-series",
    title: "Bangladesh name a balanced squad for the upcoming ODI series",
    excerpt: "Selectors back form and fitness ahead of a demanding schedule.",
    image: stadium("galle-pavilion.jpg"),
    label: "Bangladesh",
    section: "bangladesh",
    minutes: 42,
  },
  {
    slug: "five-breakthrough-players-ready-to-own-the-global-stage",
    title: "Five breakthrough players ready to own the global stage",
    excerpt: "The young names forcing their way into every selection debate.",
    image: stadium("kajaria-floodlight.jpg"),
    label: "Features",
    section: "features",
    minutes: 60,
  },
  {
    slug: "inside-the-venues-that-will-host-this-summers-biggest-contests",
    title: "Inside the venues that will host this summer's biggest contests",
    excerpt: "Pitches, crowds and conditions: what to expect at each ground.",
    image: stadium("kajaria-dusk.jpg"),
    label: "World Cricket",
    section: "international",
    minutes: 120,
  },
];

function toArticle(seed: SeedArticle, copy: number): Article & { categorySlug: string } {
  return {
    id: `${seed.slug}-${copy}`,
    slug: copy === 0 ? seed.slug : `${seed.slug}-${copy + 1}`,
    title: seed.title,
    excerpt: seed.excerpt,
    image: seed.image,
    category: seed.label,
    categorySlug: seed.section,
    author: desk,
    publishedAt: minutesAgo(seed.minutes + copy * 240),
    readMinutes: 5,
  };
}

const featuredArticle: Article & { categorySlug: string } = {
  id: "featured-next-twelve-months",
  slug: "what-the-next-twelve-months-could-mean-for-bangladesh-cricket",
  title: "What the next twelve months could mean for Bangladesh cricket",
  excerpt: "A closer look at the fixtures, form and emerging talent.",
  image: stadium("kajaria-crowd.jpg"),
  category: "Featured",
  categorySlug: "bangladesh",
  author: desk,
  publishedAt: minutesAgo(10),
  readMinutes: 7,
};

function allArticles(): (Article & { categorySlug: string })[] {
  return [0, 1].flatMap((copy) => seeds.map((seed) => toArticle(seed, copy)));
}

/** Every mock story, including the featured one, for the search mock. */
export function listMockArticles(): Article[] {
  return [...allArticles(), featuredArticle];
}

export function buildMockNewsPage(category: string | undefined, limit: number): NewsPage {
  const matching = allArticles().filter((article) => !category || article.categorySlug === category);

  return {
    featured: !category || featuredArticle.categorySlug === category ? featuredArticle : null,
    articles: matching.slice(0, limit),
    categories: mockNewsCategories,
    total: matching.length,
  };
}

export function buildMockArticleDetail(slug: string): ArticleDetail | null {
  const base =
    slug === "a-fearless-generation-is-rewriting-the-rules-of-the-modern-game"
      ? null
      : [...allArticles(), featuredArticle].find((article) => article.slug === slug);

  if (slug !== "a-fearless-generation-is-rewriting-the-rules-of-the-modern-game" && !base) {
    return null;
  }

  const article: Article = base ?? {
    id: "fearless-generation",
    slug,
    title: "A fearless generation is rewriting the rules of the modern game",
    excerpt: "Power, purpose and a fresh tactical imagination are changing how elite cricket is played—and watched.",
    image: stadium("kajaria-crowd.jpg"),
    category: "Analysis",
    author: { slug: "ayaan-rahman", name: "Ayaan Rahman" },
    publishedAt: "2026-06-18T09:00:00.000Z",
    readMinutes: 8,
    caption: "A packed stadium watches the final overs unfold. Photo: Zoshua Colab / Unsplash",
  };

  return {
    ...article,
    subtitle: article.excerpt,
    breadcrumb: ["International", "Match analysis"],
    blocks: [
      {
        type: "lead",
        text: "There is a particular kind of energy around this team now. It is visible in the way they walk onto the field, in the decisions they make under pressure and in a refusal to wait for the game to happen.",
      },
      {
        type: "paragraph",
        text: "The shift has not arrived overnight. It has been built through better preparation, clearer roles and a generation of cricketers who have grown up studying every corner of the global game.",
      },
      { type: "heading", text: "Intent, backed by intelligence" },
      {
        type: "paragraph",
        text: "Aggression alone is not a strategy. The best teams understand when to accelerate and when to absorb pressure. That balance is becoming the defining quality of the modern side.",
      },
      {
        type: "quote",
        text: "“The freedom comes from preparation. When every player understands the plan, instinct can take over.”",
      },
      {
        type: "paragraph",
        text: "Coaches are now using matchups more deliberately, while players are becoming comfortable switching roles from one game to the next. The result is a style that feels expressive without becoming reckless.",
      },
      { type: "heading", text: "The road ahead" },
      {
        type: "paragraph",
        text: "The coming months will provide a more demanding test. Conditions will change, opponents will adapt and expectations will grow. Yet the underlying direction is clear—and compelling.",
      },
    ],
    tags: ["Bangladesh", "International cricket"],
    related: allArticles()
      .filter((candidate) => candidate.slug !== article.slug)
      .slice(1, 4),
  };
}
