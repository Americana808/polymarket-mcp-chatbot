import React, { useEffect, useState } from "react";

type Trade = {
  side?: string;
  size?: number | string;
  price?: number | string;
  time?: string;
  [key: string]: any;
};

const RecentTrades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & pagination
  // Separate input string from numeric filter so empty string is allowed
  const [minTotalInput, setMinTotalInput] = useState<string>("0");
  const minTotal = (() => {
    const n = Number(minTotalInput);
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();
  const [timeWindowHours] = useState<number>(24); // fixed 24h lookback per request
  // Pagination removed due to upstream 10-trade limit

  useEffect(() => {
    setLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5090";
    const url = new URL(`${backendUrl}/recent-trades`);
    url.searchParams.set("timeWindowHours", String(timeWindowHours));
  // Pagination removed
    // fetchLimit left default (server decides) but could be tuned if needed.
    if (minTotal > 0) url.searchParams.set("minTotal", String(minTotal));
    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setTrades(Array.isArray(data?.trades) ? data.trades : []);
  // Pagination metadata no longer used
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch recent trades");
        setLoading(false);
      });
  }, [minTotal, timeWindowHours]);

  return (
    <div className="p-8">
  <h1 className="text-3xl font-bold mb-6">Recent Trades</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="minTotal">Min Total ($)</label>
          <input
            id="minTotal"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minTotalInput}
            onChange={(e) => {
              const raw = e.target.value.trim();
              // Allow empty (no filter) or digits only
              if (raw === "") {
                setMinTotalInput("");
                return;
              }
              if (/^\d+$/.test(raw)) {
                setMinTotalInput(raw);
              }
            }}
            onBlur={() => {
              // If user leaves non-numeric or empty, keep empty (means no filter) or revert to '0'
              if (minTotalInput === "") return; // empty is allowed
              if (!/^\d+$/.test(minTotalInput)) {
                setMinTotalInput("0");
              }
            }}
            placeholder="0 (no filter)"
            className="border rounded px-3 py-2 w-48 bg-white dark:bg-gray-800"
          />
        </div>
        {minTotalInput !== "" && minTotal > 0 && (
          <button
            onClick={() => setMinTotalInput("")}
            className="border px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >Clear Filter</button>
        )}
      </div>
      {!loading && !error && trades.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">No trades match the current filter/time window.</p>
      )}
      {!loading && !error && trades.length > 0 && (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">Side</th>
              <th className="border px-4 py-2 text-right">Size</th>
              <th className="border px-4 py-2 text-right">Price</th>
              <th className="border px-4 py-2 text-right">Total ($)</th>
              <th className="border px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => {
              const sizeNum = Number(trade.size ?? 0) || 0;
              const priceNum = Number(trade.price ?? 0) || 0;
              const total = sizeNum * priceNum;
              return (
                <tr key={idx}>
                  <td className="border px-4 py-2">{String(trade.side ?? "")}</td>
                  <td className="border px-4 py-2 text-right">{sizeNum}</td>
                  <td className="border px-4 py-2 text-right">${priceNum.toFixed(4)}</td>
                  <td className="border px-4 py-2 text-right">${total.toFixed(2)}</td>
                  <td className="border px-4 py-2">{String(trade.time ?? "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Pagination removed (tool returns at most 10 trades) */}
    </div>
  );
};

export default RecentTrades;
