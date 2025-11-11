## Demo
[![Thumbnail](https://img.youtube.com/vi/edB_MoEx7mA/0.jpg)](https://www.youtube.com/watch?v=edB_MoEx7mA)

## Devpost submission
https://devpost.com/software/polyview-y5dg8m

# Deploying Polymarket MCP Chatbot (Backend + Frontend)

This guide shows only what you need to deploy.

## Prerequisites

- Node.js 18+ (with Bun)
- Anthropic API key (Claude)
- Smithery account (for MCP OAuth)
- NewsAPI key (for news features)

## Project Layout

- Frontend (Vite + React) lives at repo root (`src/`, `index.html`)
- Backend (Node/Express + WebSocket) lives in `backend/`

## 1) Backend: Configure and Run

Required environment variables (create `backend/.env`):

```
ANTHROPIC_API_KEY=sk-ant-...
POLYMARKET_MCP_URL=https://server.smithery.ai/@aryankeluskar/polymarket-mcp/mcp
NEWS_API_KEY=your_newsapi_key_optional
PORT=5090
```

Local build and run (PowerShell):

```powershell
cd backend
bun install
bun run build
bun run dev
```

## 2) Frontend: Build and Deploy

Build locally (PowerShell):

```powershell
bun install
bun run build

npm run build
bun run dev
```

## View our submission
https://devpost.com/software/polyview-y5dg8m

## License

This project is licensed under the Apache License 2.0.

## Credits:
- https://github.com/aryankeluskar/polymarket-mcp/blob/master/src/index.ts
- https://newsapi.org/docs/get-started#search

