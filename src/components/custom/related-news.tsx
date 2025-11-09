import { useEffect, useState } from "react";
import { extractNewsKeywords } from "../../lib/extract-keywords";

interface Article {
  title: string;
  url: string;
  source?: string;
  description?: string;
  publishedAt?: string;
  published_at?: string;
}

interface RelatedNewsProps {
  seed?: string; // assistant or user text seed
  explicitQuery?: string; // overrides derived keywords
  limit?: number;
  auto?: boolean; // auto fetch on mount if query derivable
  className?: string;
  showQuery?: boolean; // display 'query: ...' label
  preferSeedFirst?: boolean; // control derivation precedence
}

export function RelatedNews({
  seed,
  explicitQuery,
  limit = 6,
  auto = true,
  className,
  showQuery = true,
  preferSeedFirst = true,
}: RelatedNewsProps) {
  const [query, setQuery] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (explicitQuery) {
      const safe = explicitQuery
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/[^\w\s$-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
      setQuery(safe);
      return;
    }
    if (seed) {
      let userSeed = "";
      try {
        userSeed = localStorage.getItem("latestUserText") || "";
      } catch {}
      let derived = "";
      if (preferSeedFirst) {
        // Derive primarily from assistant seed, with userSeed as hint
        derived = extractNewsKeywords(seed, { userSeed });
        if (!derived || derived.trim().length === 0) {
          const fallback = extractNewsKeywords(userSeed || "");
          if (fallback) derived = fallback;
        }
      } else {
        // Prefer user input first, fallback to assistant seed
        const userFirst = extractNewsKeywords(userSeed || "");
        derived =
          userFirst && userFirst.trim().length > 0
            ? userFirst
            : extractNewsKeywords(seed, { userSeed });
      }

      // sanitize any leftover markup just in case
      const safe = derived
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/[^\w\s$-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
      setQuery(safe);
    }
  }, [seed, explicitQuery]);

  useEffect(() => {
    if (!auto) return;
    if (!query || query.trim().length < 2) return;

    let abort = false;
    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: query, limit: String(limit) });
        const proto = window.location.protocol === "https:" ? "https" : "http";
        const host = window.location.hostname;
        const base = `${proto}://${host}:5090`;
        // Debug logs help validate the derived query
        if (typeof window !== "undefined" && (window as any).console) {
          try {
            console.log(
              `[RelatedNews] q="${query}" -> ${base}/news?${params.toString()}`
            );
          } catch {}
        }
        const res = await fetch(`${base}/news?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!abort) {
          setArticles(data.articles || []);
        }
      } catch (e: any) {
        if (!abort) setError(e.message || "Failed to fetch news");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    fetchArticles();
    return () => {
      abort = true;
    };
  }, [query, limit, auto]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
          Related News
        </h3>
        {showQuery && query && (
          <span className="text-[10px] text-zinc-500">query: {query}</span>
        )}
      </div>
      {loading && (
        <div className="text-xs text-zinc-400 animate-pulse">
          Loading articles…
        </div>
      )}
      {error && <div className="text-xs text-red-400">{error}</div>}
      {!loading && articles.length === 0 && !error && (
        <div className="text-xs text-zinc-500">No articles found.</div>
      )}
      <ul className="grid sm:grid-cols-2 gap-3 mt-2">
        {articles.map((a, i) => (
          <li
            key={i}
            className="group border border-zinc-800 rounded-lg p-3 hover:bg-zinc-900/70 transition-colors"
          >
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1"
            >
              <span className="text-xs font-medium text-indigo-300 group-hover:text-indigo-400 line-clamp-2">
                {a.title}
              </span>
              {a.source && (
                <span className="text-[10px] text-zinc-500">{a.source}</span>
              )}
              {(a.publishedAt || (a as any).published_at) && (
                <span className="text-[10px] text-zinc-600">
                  {new Date(
                    (a.publishedAt || (a as any).published_at)!
                  ).toLocaleDateString()}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
