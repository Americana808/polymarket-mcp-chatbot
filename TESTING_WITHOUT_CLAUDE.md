# Testing News API Without Claude Credits

## 3 Ways to Test (No Claude API Usage)

### 🌐 **Option 1: Use the Test Page** (Recommended)

1. Make sure your backend is running:

   ```powershell
   cd backend
   bun run dev
   ```

2. Make sure your frontend is running:

   ```powershell
   bun run dev
   ```

3. Open in browser:

   ```
   http://localhost:5173/test-news
   ```

4. Try different queries:
   - Trump 2024 election
   - Bitcoin $100k
   - AI artificial intelligence
   - etc.

**Features:**

- ✅ Interactive search box
- ✅ Quick example buttons
- ✅ Live results with auto-open
- ✅ Direct API link tester
- ✅ **ZERO Claude API credits used**

---

### 🔗 **Option 2: Direct Browser URL**

Just open these URLs in your browser:

```
http://localhost:5090/news?q=Trump%202024%20election&limit=2
http://localhost:5090/news?q=Bitcoin%20cryptocurrency&limit=2
http://localhost:5090/news?q=artificial%20intelligence&limit=2
```

You'll see raw JSON responses from NewsAPI.

---

### 💻 **Option 3: PowerShell Script**

Run the test script:

```powershell
.\test-news.ps1
```

This will test 3 different queries and show you the results in your terminal.

---

## What Gets Tested

✅ Backend `/news` endpoint  
✅ NewsAPI integration  
✅ Article fetching and caching  
✅ Frontend `RelatedNews` component  
✅ Keyword extraction (on test page)

❌ Claude API (not used at all)  
❌ Polymarket MCP (not needed)  
❌ WebSocket chat (not needed)

---

## Troubleshooting

### "Failed to fetch"

- Check backend is running: `http://localhost:5090/news?q=test`
- Check frontend is running: `http://localhost:5173`
- Make sure NEWS_API_KEY is in `backend/.env`

### "No articles found"

- Try different queries
- Check NewsAPI limits (100/day on free tier)
- Verify your API key at https://newsapi.org/account

### Backend not starting

```powershell
cd backend
bun install
bun run dev
```

### Frontend not starting

```powershell
bun install
bun run dev
```

---

## Expected Output

**Test Page** (`/test-news`):

```
Results
Searching for: Trump OR 2024 election
✓ 5 articles loaded
• Article 1 title (Source · Date)
• Article 2 title (Source · Date)
...
```

**Direct API** (browser):

```json
{
  "articles": [
    {
      "title": "...",
      "url": "https://...",
      "source": "CNN",
      "published_at": "2025-11-08T12:00:00Z"
    }
  ]
}
```

**PowerShell Script**:

```
✅ Found 3 articles
  - Article title 1
  - Article title 2
  - Article title 3
```

---

## Cost

- **NewsAPI**: Free tier = 100 requests/day
- **Claude API**: $0 (not used in these tests!)
- **Your time**: 2 minutes ⚡

Enjoy testing! 🎉
