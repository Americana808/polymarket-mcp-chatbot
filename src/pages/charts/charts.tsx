import React from 'react';
import { TradeChart, VolumeChart } from '../../components/custom/TradeChart';

// Mock trade data for testing
const mockTrades = [
  {
    timestamp: new Date(Date.now() - 60000 * 60).toISOString(), // 1 hour ago
    price: 0.45,
    amount: 150,
    side: 'buy' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 50).toISOString(), // 50 min ago
    price: 0.47,
    amount: 80,
    side: 'sell' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 45).toISOString(), // 45 min ago
    price: 0.48,
    amount: 200,
    side: 'sell' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 35).toISOString(), // 35 min ago
    price: 0.50,
    amount: 120,
    side: 'buy' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 30).toISOString(), // 30 min ago
    price: 0.52,
    amount: 100,
    side: 'buy' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 20).toISOString(), // 20 min ago
    price: 0.51,
    amount: 90,
    side: 'sell' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 15).toISOString(), // 15 min ago
    price: 0.49,
    amount: 300,
    side: 'sell' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 10).toISOString(), // 10 min ago
    price: 0.53,
    amount: 180,
    side: 'buy' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 5).toISOString(), // 5 min ago
    price: 0.50,
    amount: 250,
    side: 'sell' as const,
  },
  {
    timestamp: new Date().toISOString(), // now
    price: 0.51,
    amount: 175,
    side: 'buy' as const,
  },
];

// Additional mock data for a different market
const mockSportsTrades = [
  {
    timestamp: new Date(Date.now() - 60000 * 40).toISOString(),
    price: 0.72,
    amount: 500,
    side: 'buy' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 25).toISOString(),
    price: 0.68,
    amount: 300,
    side: 'sell' as const,
  },
  {
    timestamp: new Date(Date.now() - 60000 * 10).toISOString(),
    price: 0.75,
    amount: 400,
    side: 'buy' as const,
  },
  {
    timestamp: new Date().toISOString(),
    price: 0.73,
    amount: 200,
    side: 'sell' as const,
  },
];

export function Charts() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Chart Components Test</h1>
          <p className="text-muted-foreground text-lg">
            Testing TradeChart and VolumeChart components with mock data
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              ← Back to Canvas
            </a>
            <a 
              href="/chat" 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Go to Chat
            </a>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Political Market Example</h2>
            <TradeChart 
              trades={mockTrades}
              marketName="Trump Wins 2024 Election"
            />
            
            <VolumeChart 
              trades={mockTrades}
              marketName="Trump Wins 2024 Election"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Sports Market Example</h2>
            <TradeChart 
              trades={mockSportsTrades}
              marketName="Lakers Win Championship 2024"
            />
            
            <VolumeChart 
              trades={mockSportsTrades}
              marketName="Lakers Win Championship 2024"
            />
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Chart Features Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">TradeChart Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Price line with data points</li>
                  <li>• Time-based X axis (HH:mm format)</li>
                  <li>• Percentage Y axis (0-100%)</li>
                  <li>• Hover tooltips with price/amount</li>
                  <li>• Responsive container</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">VolumeChart Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Buy volume (green bars)</li>
                  <li>• Sell volume (red bars)</li>
                  <li>• Time aggregation by minute</li>
                  <li>• Stacked bar visualization</li>
                  <li>• Volume tooltips</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}