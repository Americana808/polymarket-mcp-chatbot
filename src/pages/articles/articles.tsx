import { useEffect, useMemo, useState } from "react";
import { RelatedNews } from "@/components/custom/related-news";
import { Link } from "react-router-dom";

export function Articles() {
  const [q, setQ] = useState("");
  const [seed, setSeed] = useState("");

  // Load seeds from localStorage (latest chat context)
  useEffect(() => {
    try {
      const a = localStorage.getItem("latestAssistantText") || "";
      const u = localStorage.getItem("latestUserText") || "";
      const s = a || u;
      setSeed(s);
    } catch {}
  }, []);

  const showDerived = useMemo(() => !q || q.trim().length === 0, [q]);

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Top Navigation */}
      <header className="w-full bg-black/90">
        <div className="px-6 mx-auto sm:px-8 lg:px-10 flex items-center justify-between h-16 lg:h-20">
          <Link
            to="/"
            className="font-semibold text-white tracking-tight text-lg"
          >
            PolyView
          </Link>
          <nav className="hidden lg:flex items-center space-x-10 ml-auto text-base">
            <a
              href="/#features"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <Link
              to="/charts"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Charts
            </Link>
            <Link
              to="/articles"
              className="text-white font-medium transition-colors"
            >
              Articles
            </Link>
            <Link
              to="/recent"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Recent
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl px-6 pt-10 pb-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Articles</h1>
          <p className="mt-2 text-zinc-400">
            Search for relevant articles or let it auto-suggest based on your
            last chat.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news (e.g. Bitcoin ETF, US election)"
              className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {/* Optional: a button to clear */}
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <div className="text-[12px] text-zinc-500">
            Examples:{" "}
            <button
              className="underline hover:text-zinc-300"
              onClick={() => setQ("Bitcoin ETF OR crypto regulation")}
            >
              Bitcoin ETF OR crypto regulation
            </button>
            ,{" "}
            <button
              className="underline hover:text-zinc-300"
              onClick={() => setQ("US election polling OR debate")}
            >
              US election polling OR debate
            </button>
            ,{" "}
            <button
              className="underline hover:text-zinc-300"
              onClick={() => setQ("AI chip supply OR NVIDIA")}
            >
              AI chip supply OR NVIDIA
            </button>
          </div>
        </div>

        <div className="mt-8">
          {showDerived ? (
            <RelatedNews seed={seed} limit={8} className="" showQuery={false} />
          ) : (
            <RelatedNews
              explicitQuery={q}
              limit={8}
              className=""
              showQuery={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
