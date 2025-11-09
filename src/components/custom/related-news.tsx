import { useEffect, useMemo, useState } from "react";
import { extractNewsKeywords } from "@/lib/extract-keywords";

type Article = {
  title: string;
  url: string;
  source: string;
  published_at: string;
  author?: string | null;
  description?: string | null;
};

interface RelatedNewsProps {
  query: string;
  limit?: number;
  autoOpen?: boolean; // Auto-expand on dashboard
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function RelatedNews({ query, limit = 2, autoOpen = false }: RelatedNewsProps) {
  const [open, setOpen] = useState(autoOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[] | null>(null);

  // Extract relevant keywords from the query instead of using the full text
  const q = useMemo(() => {
    let seed = "";
    try {
      seed = localStorage.getItem("latestUserText") || "";
    } catch {}
    const keywords = extractNewsKeywords(query, { userSeed: seed });
    return keywords.slice(0, 500); // Cap at 500 chars for URL safety
  }, [query]);

  useEffect(() => {
    if (!open || !q) return;

    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      console.log(`[RelatedNews] Fetching news for query: "${q}"`);
      try {
        const proto = window.location.protocol;
        const host = window.location.hostname;
        const port = 5090; // backend default
        const url = new URL(`${proto}//${host}:${port}/news`);
        url.searchParams.set("q", q);
        url.searchParams.set("limit", String(limit));
        
        console.log(`[RelatedNews] Fetching from: ${url.toString()}`);
        const resp = await fetch(url.toString());
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error(`[RelatedNews] Error response:`, errorText);
          throw new Error(`${resp.status} ${resp.statusText}`);
        }
        
        const data = await resp.json();
        console.log(`[RelatedNews] Received ${data.articles?.length || 0} articles`);
        if (!cancelled) setArticles(data.articles || []);
      } catch (e: any) {
        console.error(`[RelatedNews] Fetch error:`, e);
        if (!cancelled) setError(e?.message || "Failed to load news");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [open, q, limit]);

  return (
    <div className="mt-3 border-t pt-3">
      <button
        className="text-sm text-blue-600 hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide related news" : "Show related news"}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {q && (
            <div className="text-xs text-gray-400 italic">
              Searching for: {q.length > 100 ? q.slice(0, 100) + "..." : q}
            </div>
          )}
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && articles && articles.length === 0 && (
            <div className="text-sm text-gray-500">No related articles found.</div>
          )}
          {!loading && !error && articles && articles.length > 0 && (
            <ul className="list-disc pl-5 space-y-1">
              {articles.map((a, i) => (
                <li key={i} className="text-sm">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    title={a.description || undefined}
                  >
                    {a.title}
                  </a>
                  <span className="text-gray-500 ml-2">
                    {a.source ? `(${a.source}` : "(Article"}
                    {a.published_at ? ` · ${formatDate(a.published_at)}` : ""}
                    {")"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

