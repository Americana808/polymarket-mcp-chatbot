# Deployment Configuration Guide

This application consists of two services:

- **Frontend** (React/Vite): Serves the UI
- **Backend** (Node.js/Express): Handles API requests and WebSocket connections

## Port Configuration

### Default Ports

- Frontend: `8501`
- Backend: `5090`

### Environment Variables

#### Frontend (.env in root directory)

```
VITE_FRONTEND_PORT=8501
VITE_BACKEND_URL=http://localhost:5090
```

#### Backend (.env in backend/ directory)

```
PORT=5090
ANTHROPIC_API_KEY=your_api_key_here
NEWS_API_KEY=your_news_api_key_here
POLYMARKET_MCP_URL=https://server.smithery.ai/@aryankeluskar/polymarket-mcp/mcp
```

## Deployment Scenarios

### Local Development

1. Copy `.env.example` to `.env` in both root and backend directories
2. Fill in your API keys
3. Run:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

### Production Deployment

#### Option 1: Same Server (Different Ports)

Keep default ports or configure as needed:

```
Frontend: http://your-domain.com:8501
Backend: http://your-domain.com:5090
```

Update `.env`:

```
VITE_BACKEND_URL=http://your-domain.com:5090
```

#### Option 2: Reverse Proxy (Recommended)

Use Nginx or similar to proxy both services through port 80/443:

```nginx
# Frontend
location / {
    proxy_pass http://localhost:8501;
}

# Backend API
location /api/ {
    proxy_pass http://localhost:5090/;
}

# Backend WebSocket
location /ws {
    proxy_pass http://localhost:5090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Update `.env`:

```
VITE_BACKEND_URL=https://your-domain.com/api
```

#### Option 3: Separate Servers

Deploy frontend and backend on different servers:

Frontend `.env`:

```
VITE_BACKEND_URL=https://api.your-domain.com
```

Backend `.env`:

```
PORT=5090
# Add CORS configuration for your frontend domain
```

#### Option 4: Docker Deployment

Ports are mapped in docker-compose.yml:

```yaml
services:
  frontend:
    ports:
      - "8501:8501"
    environment:
      - VITE_BACKEND_URL=http://backend:5090

  backend:
    ports:
      - "5090:5090"
    environment:
      - PORT=5090
```

### Cloud Platform Specific

#### Vercel/Netlify (Frontend)

Set environment variables in dashboard:

- `VITE_BACKEND_URL`: Your backend URL

#### Railway/Render (Backend)

Set environment variables:

- `PORT`: Usually auto-assigned
- `ANTHROPIC_API_KEY`
- `NEWS_API_KEY`

Update frontend `.env`:

```
VITE_BACKEND_URL=https://your-backend.railway.app
```

## Quick Transfer Checklist

When moving to a new environment:

1. ✅ Copy both `.env.example` files to `.env`
2. ✅ Update `VITE_BACKEND_URL` to match your backend location
3. ✅ Update backend `PORT` if required by hosting provider
4. ✅ Add your API keys to backend `.env`
5. ✅ Rebuild frontend after changing environment variables: `npm run build`
6. ✅ Restart both services

## Testing the Connection

After deployment, verify:

1. Frontend loads: `http://your-frontend-url`
2. Backend health check: `http://your-backend-url/health`
3. WebSocket connection in browser console (no errors)
4. Test a chat message

## Common Issues

- **WebSocket connection failed**: Check CORS settings and firewall rules
- **API calls fail**: Verify `VITE_BACKEND_URL` is correct and accessible
- **Environment variables not working**: Rebuild frontend after changes to `.env`
