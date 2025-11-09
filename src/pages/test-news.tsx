import { useState } from "react";
import { RelatedNews } from "@/components/custom/related-news";
import { Header } from "@/components/custom/header";

export function TestNews() {
  const [query, setQuery] = useState("Trump 2024 election");

  const examples = [
    "Trump 2024 election",
    "Bitcoin $100k",
    "AI artificial intelligence",
    "Ukraine Russia conflict",
    "Climate change policy",
    "Federal Reserve interest rates",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold mb-2">News API Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Test the NewsAPI integration without using Claude credits
        </p>

        {/* Query Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Search Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
            placeholder="Enter search query..."
          />
        </div>

        {/* Quick Examples */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Quick examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* News Results */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {query ? (
            <RelatedNews query={query} limit={2} autoOpen={true} />
          ) : (
            <p className="text-gray-500">Enter a query to search for news</p>
          )}
        </div>

        {/* Direct API Test */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold mb-2">Direct API Test</h3>
          <p className="text-sm mb-2">Test the backend directly:</p>
          <a
            href={`http://localhost:5090/news?q=${encodeURIComponent(query)}&limit=2`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            http://localhost:5090/news?q={query}&limit=2
          </a>
        </div>
      </div>
    </div>
  );
}
