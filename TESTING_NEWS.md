# Testing News API Integration

## Quick Test Steps

### 1. Verify Backend is Running

```bash
# Should see:
# ✅ Connected to Polymarket MCP server
# 📰 News API request logs when fetching
```

### 2. Test News Endpoint Directly

Open in browser or use curl:

```
http://localhost:5090/news?q=Trump%202024%20election&limit=2
```

Expected response:

```json
{
  "articles": [
    {
      "title": "...",
      "url": "https://...",
      "source": "...",
      "published_at": "2025-11-08T...",
      "author": "...",
      "description": "..."
    }
  ]
}
```

### 3. Test in Chat Interface

1. Navigate to http://localhost:5173/chat (or your Vite dev port)
2. Ask: "What are the odds of Trump winning in 2024?"
3. Wait for Claude's response
4. Look for "Show related news" button below the assistant message
5. Click to expand - should show 5 news articles

### 4. Test Dashboard

1. After chatting, navigate to http://localhost:5173/ (canvas/dashboard)
2. Should see "Related News" section
3. Articles should auto-load based on last conversation
4. Check browser console for logs:
   - `[RelatedNews] Fetching news for query: ...`
   - `[RelatedNews] Received X articles`

## Troubleshooting

### Backend logs show `NEWS_API_KEY is not set`

- Check `backend/.env` file exists
- Verify it contains: `NEWS_API_KEY=your_key_here`
- Restart backend: Ctrl+C then `cd backend && bun run dev`

### Frontend shows "Failed to load news"

- Check browser console (F12)
- Verify backend is running on port 5090
- Check for CORS errors
- Verify URL is correct: `http://localhost:5090/news`

### No articles found

- Try different queries (more specific or more general)
- Check if NewsAPI is working: https://newsapi.org/
- Verify API key is valid and not rate-limited
- Check backend logs for NewsAPI errors

### Keywords not extracting correctly

- Open browser console
- Look for: `[RelatedNews] Fetching news for query: "..."`
- If query looks wrong, modify `src/lib/extract-keywords.ts`

## Expected Behavior

### In Chat

- Each assistant message gets a "Show related news" button
- Clicking fetches fresh articles (unless cached)
- Shows 5 articles by default
- Collapses/expands without re-fetching

### In Dashboard

- Automatically fetches when page loads
- Uses last assistant message from localStorage
- Opens expanded by default
- Shows search query being used
- Updates when you return from chat

## Example Queries to Test

1. **Political Markets**

   - "What's Trump's chance of winning 2024?"
   - "Show me election prediction markets"
   - "Who will win the Republican primary?"

2. **Crypto Markets**

   - "Will Bitcoin reach $100k?"
   - "Show me crypto prediction markets"
   - "What's the ETH price prediction?"

3. **Events**
   - "Will there be a government shutdown?"
   - "Show me markets about AI advancements"
   - "What are trending markets?"

Each should extract relevant keywords and fetch appropriate news articles.
