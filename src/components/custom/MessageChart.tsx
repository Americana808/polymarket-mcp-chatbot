import React, { useState, useEffect } from 'react';
import { MarketVolumeChart } from './VolumeChart';
import { MarketProbabilityChart } from './ProbabilityChart';

interface MessageChartProps {
  content: string;
}

// Function to detect chart triggers in Claude's messages
function detectChartTriggers(
  content: string
): { type: string; query?: string } | null {
  const lower = content.toLowerCase();
  
  // Debug what we're checking
  console.log('🔍 Chart detection checking:', lower.substring(0, 200));
  
  // Look for market-related content with common keywords
  const marketKeywords = ['bitcoin', 'btc', 'trump', 'harris', 'election', 'crypto', 'sports'];
  const hasMarketKeyword = marketKeywords.some(keyword => lower.includes(keyword));
  
  if (!hasMarketKeyword) {
    console.log('❌ No market keywords found');
    return null;
  }
  
  // Extract the main topic from the content
  let query = 'bitcoin'; // default
  for (const keyword of marketKeywords) {
    if (lower.includes(keyword)) {
      query = keyword;
      break;
    }
  }
  
  // Probability-focused patterns
  if (lower.includes('probability') || lower.includes('probabilities') || 
      lower.includes('chance') || lower.includes('%') ||
      lower.includes('odds') || lower.includes('likelihood')) {
    console.log('✅ Probability chart triggered for:', query);
    return { type: 'probability', query };
  }
  
  // Volume-focused patterns
  if (lower.includes('volume') || lower.includes('trading') || 
      lower.includes('activity') || lower.includes('$')) {
    console.log('✅ Volume chart triggered for:', query);
    return { type: 'volume', query };
  }
  
  // Chart/visualization patterns
  if (lower.includes('chart') || lower.includes('visualiz') || 
      lower.includes('graph') || lower.includes('show') ||
      lower.includes('display') || lower.includes('data')) {
    console.log('✅ Generic chart triggered for:', query);
    return { type: 'volume', query }; // Default to volume
  }
  
  // Market analysis patterns
  if (lower.includes('market') || lower.includes('analysis') || 
      lower.includes('compare') || lower.includes('trends')) {
    console.log('✅ Market analysis chart triggered for:', query);
    return { type: 'volume', query };
  }
  
  console.log('❌ No chart triggers found');
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
      
      // Debug logging
      console.log('🔍 MessageChart checking content:', content.substring(0, 100) + '...');
      console.log('🎯 Chart trigger detected:', trigger);
      
      setChartTrigger(trigger);
    }
  }, [content]);

  // For testing: always show a chart if content mentions Bitcoin
  const testMode = content.toLowerCase().includes('bitcoin');
  
  if (!chartTrigger && !testMode) return null;
  
  // Use test trigger if no regular trigger found
  const finalTrigger = chartTrigger || (testMode ? { type: 'volume', query: 'bitcoin' } : null);
  
  if (!finalTrigger) return null;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-muted-foreground">
          Market Visualization
        </span>
      </div>
      
      {finalTrigger.type === 'volume' && finalTrigger.query && (
        <MarketVolumeChart 
          query={finalTrigger.query}
          limit={5}
        />
      )}
      
      {finalTrigger.type === 'probability' && finalTrigger.query && (
        <MarketProbabilityChart 
          query={finalTrigger.query}
          limit={5}
        />
      )}
    </div>
  );
};

// Export the detection function for testing
export { detectChartTriggers };
