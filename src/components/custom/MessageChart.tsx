import React, { useState, useEffect } from "react";
import { MarketVolumeChart } from "./VolumeChart";

interface MessageChartProps {
  content: string;
}

// Function to detect chart triggers in Claude's messages
function detectChartTriggers(
  content: string
): { type: string; query?: string } | null {
  const lower = content.toLowerCase();

  // Look for specific chart trigger patterns

  // Volume charts: "show volume for bitcoin" or "volume chart for trump"
  const volumeMatch = content.match(
    /(?:volume|volumes?)\s+(?:chart\s+)?(?:for\s+)?([a-zA-Z0-9\s]+)/i
  );
  if (volumeMatch || lower.includes("volume chart")) {
    const query = volumeMatch ? volumeMatch[1].trim() : "bitcoin"; // default to bitcoin
    return { type: "volume", query };
  }

  // Market comparison: "compare markets for bitcoin"
  const compareMatch = content.match(
    /compare\s+markets?\s+(?:for\s+)?([a-zA-Z0-9\s]+)/i
  );
  if (compareMatch) {
    return { type: "volume", query: compareMatch[1].trim() };
  }

  // Chart visualization: "chart bitcoin markets" or "visualize trump markets"
  const chartMatch = content.match(
    /(?:chart|visualize|show\s+charts?)\s+([a-zA-Z0-9\s]+)\s+markets?/i
  );
  if (chartMatch) {
    return { type: "volume", query: chartMatch[1].trim() };
  }

  // Explicit chart commands: "chart: bitcoin"
  const explicitMatch = content.match(/chart:\s*([a-zA-Z0-9\s]+)/i);
  if (explicitMatch) {
    return { type: "volume", query: explicitMatch[1].trim() };
  }

  return null;
}

export const MessageChart: React.FC<MessageChartProps> = ({ content }) => {
  const [chartTrigger, setChartTrigger] = useState<{
    type: string;
    query?: string;
  } | null>(null);

  useEffect(() => {
    // Only check for chart triggers in complete messages (not while streaming)
    if (content && !content.includes("...") && content.length > 50) {
      const trigger = detectChartTriggers(content);
      setChartTrigger(trigger);
    }
  }, [content]);

  if (!chartTrigger) return null;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-muted-foreground">
          Market Visualization
        </span>
      </div>

      {chartTrigger.type === "volume" && chartTrigger.query && (
        <MarketVolumeChart query={chartTrigger.query} limit={5} bare />
      )}
    </div>
  );
};

// Export the detection function for testing
export { detectChartTriggers };
