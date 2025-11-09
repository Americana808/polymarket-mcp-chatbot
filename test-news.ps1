# Test NewsAPI Integration - PowerShell Script
# Run this to test the news endpoint without using Claude API

Write-Host "🧪 Testing NewsAPI Integration" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic query
Write-Host "Test 1: Trump 2024 election" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "http://localhost:5090/news?q=Trump%202024%20election&limit=3" -Method Get
Write-Host "✅ Found $($response1.articles.Count) articles" -ForegroundColor Green
$response1.articles | ForEach-Object { Write-Host "  - $($_.title)" }
Write-Host ""

# Test 2: Bitcoin
Write-Host "Test 2: Bitcoin cryptocurrency" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:5090/news?q=Bitcoin%20cryptocurrency&limit=3" -Method Get
Write-Host "✅ Found $($response2.articles.Count) articles" -ForegroundColor Green
$response2.articles | ForEach-Object { Write-Host "  - $($_.title)" }
Write-Host ""

# Test 3: AI
Write-Host "Test 3: Artificial Intelligence" -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "http://localhost:5090/news?q=artificial%20intelligence&limit=3" -Method Get
Write-Host "✅ Found $($response3.articles.Count) articles" -ForegroundColor Green
$response3.articles | ForEach-Object { Write-Host "  - $($_.title)" }
Write-Host ""

Write-Host "✨ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5173/test-news in your browser"
Write-Host "  2. Try different search queries"
Write-Host "  3. No Claude API credits used! 🎉"
