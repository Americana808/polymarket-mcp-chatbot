import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MarketProbability {
  name: string;
  probability: number;
  volume: string;
  slug: string;
}

interface ProbabilityChartProps {
  query: string;
  limit?: number;
}

export const MarketProbabilityChart: React.FC<ProbabilityChartProps> = ({ query, limit = 5 }) => {
  const [data, setData] = useState<MarketProbability[]>([]);
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
        const response = await fetch(`http://localhost:5090/market-probabilities?query=${encodeURIComponent(query)}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.chartData || []);
        
        console.log('Probability chart data:', result.chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Probability chart error:', err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  if (loading) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading probability data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="text-muted-foreground">No probability data found for "{query}"</div>
      </div>
    );
  }

  // Color bars based on probability ranges
  const getBarColor = (probability: number) => {
    if (probability > 70) return '#22c55e'; // Green for high probability
    if (probability > 30) return '#eab308'; // Yellow for medium probability
    return '#ef4444'; // Red for low probability
  };

  return (
    <div className="w-full h-96 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">
        🎯 Market Probabilities: {query}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 85, bottom: 120 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
            labelFormatter={(label) => `Market: ${label}`}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Bar dataKey="probability" name="Probability">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.probability)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center mt-2 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>High (&gt;70%)</span>
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
    </div>
  );
};