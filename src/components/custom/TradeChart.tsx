// src/components/custom/TradeChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

interface Trade {
  timestamp: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
}

interface TradeChartProps {
  trades: Trade[];
  marketName: string;
  bare?: boolean; // If true, parent provides container styling
}

export const TradeChart: React.FC<TradeChartProps> = ({
  trades,
  marketName,
  bare,
}) => {
  // Process trades into chart data
  const chartData = trades.map((trade) => ({
    time: format(new Date(trade.timestamp), "HH:mm"),
    price: trade.price,
    amount: trade.amount,
    side: trade.side,
  }));

  return (
    <div
      className={
        bare ? "w-full h-96" : "w-full h-96 p-4 border rounded-lg bg-card"
      }
    >
      {!bare && (
        <h3 className="text-lg font-semibold mb-4">
          {marketName} - Recent Trades
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "price" ? `${(Number(value) * 100).toFixed(1)}%` : value,
              name === "price" ? "Price" : "Amount",
            ]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: "#8884d8", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VolumeChart: React.FC<TradeChartProps> = ({
  trades,
  marketName,
  bare,
}) => {
  const volumeData = trades.reduce((acc, trade) => {
    const timeKey = format(new Date(trade.timestamp), "HH:mm");
    const existing = acc.find((item) => item.time === timeKey);

    if (existing) {
      existing.buyVolume += trade.side === "buy" ? trade.amount : 0;
      existing.sellVolume += trade.side === "sell" ? trade.amount : 0;
    } else {
      acc.push({
        time: timeKey,
        buyVolume: trade.side === "buy" ? trade.amount : 0,
        sellVolume: trade.side === "sell" ? trade.amount : 0,
      });
    }

    return acc;
  }, [] as Array<{ time: string; buyVolume: number; sellVolume: number }>);

  return (
    <div
      className={
        bare ? "w-full h-96" : "w-full h-96 p-4 border rounded-lg bg-card"
      }
    >
      {!bare && (
        <h3 className="text-lg font-semibold mb-4">
          {marketName} - Trading Volume
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={volumeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="buyVolume" fill="#22c55e" name="Buy Volume" />
          <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
