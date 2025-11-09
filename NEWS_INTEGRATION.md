# News API Integration

## Overview

The news integration fetches relevant articles from NewsAPI based on markets and topics discussed in Claude's responses. Articles appear both in the chat interface and on the dashboard.

## How It Works

### 1. **Backend (`/news` endpoint)**

- Located in `backend/src/index.ts` (line 395)
- Calls `searchNews()` from `backend/src/news.ts`
- Fetches articles from NewsAPI (https://newsapi.org)
- Implements caching (10-minute TTL) to avoid rate limits
- Returns articles in standardized format

### 2. **Keyword Extraction**

- Located in `src/lib/extract-keywords.ts`
- Extracts relevant keywords from Claude's responses
- Focuses on:
  - Market titles (in quotes or after "market")
  - Political figures (capitalized names)
  - Events (elections, debates, votes, etc.)
- Uses OR logic to combine multiple keywords
- Falls back to first sentence if no keywords found

### 3. **Frontend Components**

#### RelatedNews Component (`src/components/custom/related-news.tsx`)

- Displays news articles in collapsible sections
- Auto-fetches when opened
- Shows loading/error states
- Displays:
  - Article title (linked)
  - Source name
  - Publication date
  - Description (on hover)

#### Integration Points

1. **Chat Messages** (`src/components/custom/message.tsx`)

   - Shows news below each assistant response
   - Collapses by default (user clicks to expand)

2. **Dashboard** (`src/pages/canvas/canvas.tsx`)
   - Shows news based on last assistant response
   - Uses `localStorage.getItem("latestAssistantText")`
   - Auto-opens news panel
   - Updates when user returns from chat

## Configuration

### NewsAPI Key

Add to `backend/.env`:

```env
NEWS_API_KEY=your_api_key_here
```

Get your free API key at: https://newsapi.org/register

### Limits

- **Free tier**: 100 requests/day, 500 requests/month
- **Default**: 5 articles per query
- **Cache**: 10 minutes per query

## Usage Examples

### Chat Interface

1. Ask: "What's the probability Trump wins 2024?"
2. Claude responds with market data
3. Click "Show related news" below the response
4. See articles about Trump, 2024 election, polling data

### Dashboard

1. Have a conversation in chat about markets
2. Click the message icon to return to dashboard
3. Dashboard shows news related to the last topic discussed

## Debugging

### Console Logs

The integration includes verbose logging:

**Frontend** (`RelatedNews.tsx`):

```
[RelatedNews] Fetching news for query: "Trump OR 2024 election OR Republican primary"
[RelatedNews] Fetching from: http://localhost:5090/news?q=...
[RelatedNews] Received 5 articles
```

**Backend** (`index.ts`):

```
📰 News API request: query="Trump OR 2024 election", limit=2
📰 Found 5 articles for query: "Trump OR 2024 election"
```

### Common Issues

#### No articles found

- Check if NEWS_API_KEY is set in `.env`
- Verify backend is running on port 5090
- Check browser console for CORS errors
- Try more specific keywords

#### Rate limit exceeded

- NewsAPI free tier has limits
- Cache reduces duplicate requests
- Consider upgrading NewsAPI plan

#### Keywords too broad/narrow

- Modify `extractNewsKeywords()` in `src/lib/extract-keywords.ts`
- Adjust regex patterns for better market detection
- Change keyword count limit (currently max 3)

## API Response Format

```typescript
{
  "articles": [
    {
      "title": "Article headline",
      "url": "https://...",
      "source": "Source Name",
      "published_at": "2025-11-08T12:00:00Z",
      "author": "Author Name",
      "description": "Article summary"
    }
  ]
}
```

## Future Improvements

1. **Better keyword extraction**: Use NLP or AI to extract market topics
2. **Date filtering**: Add date range for recent news only
3. **Source filtering**: Allow user to prefer certain news sources
4. **News aggregation**: Combine articles across multiple queries
5. **Sentiment analysis**: Show article sentiment (bullish/bearish)
6. **Market correlation**: Match articles to specific Polymarket markets

## File Structure

```
backend/
  src/
    news.ts          # NewsAPI integration & caching
    index.ts         # Express endpoint (line 395)

src/
  lib/
    extract-keywords.ts  # Keyword extraction logic

  components/custom/
    related-news.tsx     # News display component
    message.tsx          # Shows news in chat messages

  pages/
    chat/chat.tsx        # Saves latest response to localStorage
    canvas/canvas.tsx    # Dashboard with news panel
```
