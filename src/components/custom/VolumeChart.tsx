import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MarketVolume {
  name: string; // truncated display name
  fullName: string; // complete market question for tooltips
  volume: number;
  probability: number;
  slug: string;
}

interface VolumeChartProps {
  query: string;
  limit?: number;
  bare?: boolean; // omit internal card chrome so parent can style
}

export const MarketVolumeChart: React.FC<VolumeChartProps> = ({
  query,
  limit = 5,
  bare,
}) => {
  const [data, setData] = useState<MarketVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if query is too short
    if (!query || query.length < 3) {
      setData([]);
      setLoading(false);
      return;
    }

    // Debounce API calls
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const API_BASE =
          (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5090";
        const url = `${API_BASE}/market-volumes?query=${encodeURIComponent(
          query
        )}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const result = await response.json();
        // Map incoming chartData adding truncation & fullName retention
        const mapped: MarketVolume[] = (result.chartData || []).map(
          (m: any) => {
            const full = m.name || m.question || m.fullName || "";
            const truncated = full.length > 30 ? full.slice(0, 30) + "…" : full;
            return {
              name: truncated,
              fullName: full,
              volume: m.volume,
              probability: m.probability,
              slug: m.slug,
            };
          }
        );
        setData(mapped);

        console.log("Volume chart data:", {
          api: API_BASE,
          count: (result.chartData || []).length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Volume chart error:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  if (loading) {
    return (
      <div
        className={
          bare
            ? "w-full h-96 flex items-center justify-center"
            : "w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center"
        }
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">
          Loading volume data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={
          bare
            ? "w-full h-96 flex items-center justify-center"
            : "w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center"
        }
      >
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    const message =
      !query || query.length < 3
        ? "Enter at least 3 characters to search markets"
        : `No volume data found for "${query}"`;
    return (
      <div
        className={
          bare
            ? "w-full h-96 flex items-center justify-center"
            : "w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center"
        }
      >
        <div className="text-muted-foreground">{message}</div>
      </div>
    );
  }

  // Color bars based on probability
  const getBarColor = (probability: number) => {
    if (probability > 0.7) return "#22c55e"; // Green for high probability
    if (probability > 0.3) return "#eab308"; // Yellow for medium
    return "#ef4444"; // Red for low probability
  };

  return (
    <div
      className={
        bare ? "w-full h-96" : "w-full h-96 p-4 border rounded-lg bg-card"
      }
    >
      {!bare && (
        <h3 className="text-lg font-semibold mb-4">
          {query ? `Market Volumes: ${query}` : "Market Volumes"}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 5, left: 85, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={80}
            fontSize={11}
            tickFormatter={(value: string) => value}
          />
          <YAxis tickFormatter={(value: number) => `$${value}k`} />
          <Tooltip
            formatter={(value: number) => [`$${value}k`, "Volume"]}
            labelFormatter={(label: string) => {
              const found = data.find((d) => d.name === label);
              return found ? `Market: ${found.fullName}` : `Market: ${label}`;
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              maxWidth: 300,
              whiteSpace: "normal",
            }}
          />
          <Bar dataKey="volume" name="Volume">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.probability)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {!bare && (
        <div className="flex justify-center mt-2 space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>High Probability (&gt;70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
            <span>Medium (30-70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>Low (&lt;30%)</span>
          </div>
        </div>
      )}
    </div>
  );
};
