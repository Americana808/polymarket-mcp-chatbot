import * as dotenv from "dotenv";

dotenv.config();

export interface SearchNewsParams {
  query: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
  limit?: number; // 1-100 (NewsAPI pageSize max 100)
  language?: string; // e.g., 'en'
  sortBy?: "relevancy" | "popularity" | "publishedAt";
}

export interface Article {
  title: string;
  url: string;
  source: string;
  published_at: string;
  author?: string | null;
  description?: string | null;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWSAPI_ENDPOINT = "https://newsapi.org/v2/everything";

// Simple in-memory cache with TTL
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { timestamp: number; data: Article[] }>();

function makeCacheKey(params: SearchNewsParams): string {
  const { query, from, to, limit, language, sortBy } = params;
  return JSON.stringify({ query, from, to, limit, language, sortBy });
}

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit as number)) return 5;
  const n = Math.max(1, Math.min(100, Number(limit)));
  return n;
}

export async function searchNews(params: SearchNewsParams): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    throw new Error("NEWS_API_KEY is not set. Add it to your backend/.env");
  }

  const key = makeCacheKey(params);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const {
    query,
    from,
    to,
    limit = 2,
    language = "en",
    sortBy = "relevancy",
  } = params;

  if (!query || !query.trim()) {
    throw new Error("query is required for search_news");
  }

  const pageSize = normalizeLimit(limit);

  const url = new URL(NEWSAPI_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("language", language);
  url.searchParams.set("sortBy", sortBy);
  url.searchParams.set("pageSize", String(pageSize));
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);

  const res = await fetch(url.toString(), {
    headers: {
      "X-Api-Key": NEWS_API_KEY,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NewsAPI error ${res.status}: ${body || res.statusText}`);
  }

  const json = (await res.json()) as {
    status: string;
    totalResults: number;
    articles: Array<{
      title: string;
      url: string;
      source?: { name?: string };
      publishedAt?: string;
      author?: string | null;
      description?: string | null;
    }>;
  };

  const articles: Article[] = (json.articles || []).map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source?.name || "Unknown",
    published_at: a.publishedAt || "",
    author: a.author ?? null,
    description: a.description ?? null,
  }));

  cache.set(key, { timestamp: now, data: articles });
  return articles;
}

