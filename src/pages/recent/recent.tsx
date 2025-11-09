import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Trade = {
  side?: "BUY" | "SELL";
  size?: number | string;
  price?: number | string;
  time?: string;
};

export function Recent() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<"ALL" | "BUY" | "SELL">("ALL");

  const API_BASE =
    (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5090";

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const url = new URL(`${API_BASE}/recent-trades`);
        url.searchParams.set("limit", "10");
        if (side !== "ALL") url.searchParams.set("side", side);
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTrades(Array.isArray(data?.trades) ? data.trades : []);
        setError(null);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setError(e?.message || "Failed to fetch recent trades");
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [API_BASE, side]);

  return (
    <div className="min-h-dvh bg-black text-white">
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
              className="text-gray-400 hover:text-white transition-colors"
            >
              Articles
            </Link>
            <Link
              to="/recent"
              className="text-white font-medium transition-colors"
            >
              Recent
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 pt-10 pb-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Recent Trades</h1>
            <p className="mt-2 text-zinc-400 text-sm">
              Latest 10 trades across Polymarket. Use the side filter to narrow
              results.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as any)}
              className="px-2 py-1 rounded-md bg-black border border-white/20 text-white"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-sm text-zinc-400">Loading…</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.03] text-zinc-300">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Side</th>
                  <th className="px-4 py-2 text-right font-medium">Size</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Total ($)
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => {
                  const size = Number(t.size ?? 0) || 0;
                  const price = Number(t.price ?? 0) || 0;
                  const total = size * price;
                  const badgeStyles =
                    t.side === "BUY"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : t.side === "SELL"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      : "bg-zinc-700/40 border-zinc-600 text-zinc-300";
                  return (
                    <tr key={i} className="border-t border-white/10">
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${badgeStyles}`}
                        >
                          {t.side ?? ""}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">{size}</td>
                      <td className="px-4 py-2 text-right">
                        ${price.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${total.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">{t.time ?? ""}</td>
                    </tr>
                  );
                })}
                {!trades.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-zinc-500"
                    >
                      No recent trades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recent;
