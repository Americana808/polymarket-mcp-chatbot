import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useState } from "react";
import { RelatedNews } from "@/components/custom/related-news";

export function Canvas() {
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    try {
      const q = localStorage.getItem("latestAssistantText") || "";
      setQuery(q);
    } catch {
      setQuery("");
    }
  }, []);

  return (
    <div className="w-full h-dvh relative bg-gradient-to-br from-gray-50 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 overflow-hidden">
      {/* Center placeholder to add the rest of the content */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Latest related articles based on the assistant’s response.
          </p>

          {/* Related News Panel */}
          {query ? (
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <h2 className="text-lg font-medium mb-2">Related News</h2>
              <p className="text-sm text-gray-500 mb-2">
                Based on last assistant analysis
              </p>
              <RelatedNews query={query} autoOpen={true} />
            </div>
          ) : (
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-sm text-gray-500">
              Ask something in Chat to populate related articles here.
            </div>
          )}
        </div>
      </div>
      {/* Message button to open chat */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <Link
          to="/chat"
          className="inline-flex items-center justify-center rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white w-14 h-14 shadow-lg shadow-indigo-600/30 transition-colors"
        >
          <FontAwesomeIcon icon={faMessage} className="text-2xl" />
        </Link>
      </div>
    </div>
  );
}
