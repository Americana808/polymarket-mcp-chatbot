import { useState } from "react";
import { Link } from "react-router-dom";
import { TradeChart, VolumeChart } from "../../components/custom/TradeChart";
import { MarketVolumeChart } from "../../components/custom/VolumeChart";

export function Charts() {
  // Start empty so user chooses a keyword; placeholder provides examples
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [limit, setLimit] = useState<number>(6);

  // Mock trade data for demo charts
  const now = Date.now();
  const mkTrade = (
    minsAgo: number,
    price: number,
    amount: number,
    side: "buy" | "sell"
  ) => ({
    timestamp: new Date(now - minsAgo * 60_000).toISOString(),
    price,
    amount,
    side,
  });

  const mockTrades = [
    mkTrade(60, 0.42, 1200, "buy"),
    mkTrade(45, 0.48, 800, "sell"),
    mkTrade(30, 0.51, 600, "buy"),
    mkTrade(15, 0.47, 950, "sell"),
    mkTrade(5, 0.53, 1500, "buy"),
  ];

  const mockSportsTrades = [
    mkTrade(70, 0.35, 700, "buy"),
    mkTrade(50, 0.4, 500, "sell"),
    mkTrade(25, 0.55, 900, "buy"),
    mkTrade(10, 0.5, 650, "sell"),
  ];

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
              className="text-white font-medium transition-colors"
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
              className="text-gray-400 hover:text-white transition-colors"
            >
              Recent
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-20 space-y-14">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Live Market Charts
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time Polymarket data visualization
          </p>
        </div>

        {/* Live Volume Chart Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Market Volume Comparison
          </h2>
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter market keyword (e.g. Bitcoin, Trump, Lakers)"
              className="flex-1 px-4 py-2 border border-white/20 rounded-md bg-black text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950"
            />
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 pr-9 border border-white/20 rounded-md bg-black text-white w-[140px] focus:outline-none focus:ring-2 focus:ring-gray-950 appearance-none"
              >
                <option value={5}>Top 5</option>
                <option value={6}>Top 6</option>
                <option value={8}>Top 8</option>
                <option value={10}>Top 10</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <MarketVolumeChart query={searchQuery} limit={limit} />
          </div>
        </div>

        {/* Sample Trading Charts (Mock Data) */}
        <div className="space-y-10">
          <h2 className="text-2xl font-semibold text-foreground">
            Sample Trading Charts (Mock Data)
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            These examples use mock data to demonstrate pricing and volume
            visualization components. Replace them with real trade feeds when
            integrated.
          </p>

          <div className="space-y-12">
            <div className="space-y-5">
              <h3 className="text-xl font-medium">Political Market Example</h3>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <TradeChart
                    trades={mockTrades}
                    marketName="Trump Wins 2024 Election"
                    bare
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <VolumeChart
                    trades={mockTrades}
                    marketName="Trump Wins 2024 Election"
                    bare
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-xl font-medium">Sports Market Example</h3>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <TradeChart
                    trades={mockSportsTrades}
                    marketName="Lakers Win Championship 2024"
                    bare
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <VolumeChart
                    trades={mockSportsTrades}
                    marketName="Lakers Win Championship 2024"
                    bare
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-4">
              <div>
                <h4 className="font-medium mb-2">TradeChart Features:</h4>
                <ul className="space-y-1 text-muted-foreground leading-relaxed">
                  <li>Price line with data points</li>
                  <li>Time-based X axis (HH:mm format)</li>
                  <li>Tooltip showing % price</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">VolumeChart Features:</h4>
                <ul className="space-y-1 text-muted-foreground leading-relaxed">
                  <li>Buy vs Sell stacked bars</li>
                  <li>Aggregated by minute</li>
                  <li>Clean legend and tooltips</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
