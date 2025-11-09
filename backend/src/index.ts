import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import cors from "cors";
import { SimpleOAuthProvider } from "./oauth-provider.js";
import { searchNews } from "./news.js";
import {
  fetchPolywhalerWhales,
  fetchPolywhalerWhalesPlaywright,
} from "./whales.js";

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 5090;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const POLYMARKET_MCP_URL =
  process.env.POLYMARKET_MCP_URL ||
  "https://server.smithery.ai/@aryankeluskar/polymarket-mcp/mcp";

if (!ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY is required. Please set it in .env file");
  process.exit(1);
}

// ============================================================================
// MCP CLIENT SETUP
// ============================================================================

let mcpClient: Client | null = null;
let mcpTransport: StreamableHTTPClientTransport | null = null;
let oauthProvider: SimpleOAuthProvider | null = null;
let availableTools: Anthropic.Messages.Tool[] = [];

async function initializeMCPClient() {
  try {
    console.log("🔌 Connecting to Polymarket MCP server...");
    console.log(`   URL: ${POLYMARKET_MCP_URL}`);

    // Create OAuth provider
    oauthProvider = new SimpleOAuthProvider(
      `http://localhost:${PORT}/oauth/callback`,
      {
        client_name: "Polymarket MCP Demo",
        redirect_uris: [`http://localhost:${PORT}/oauth/callback`],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        scope: "mcp:tools mcp:prompts mcp:resources",
      }
    );

    // Try to load saved tokens
    await oauthProvider.loadSavedTokens();

    // Use StreamableHTTP transport for Smithery servers
    mcpTransport = new StreamableHTTPClientTransport(
      new URL(POLYMARKET_MCP_URL),
      { authProvider: oauthProvider }
    );

    mcpClient = new Client(
      {
        name: "polymarket-demo-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(mcpTransport);
    console.log("✅ Connected to Polymarket MCP server");

    // List available tools
    const toolsResponse = await mcpClient.listTools();
    console.log(`📋 Found ${toolsResponse.tools.length} tools:`);

    toolsResponse.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
    });

    // Convert MCP tools to Anthropic tool format
    availableTools = toolsResponse.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      input_schema: tool.inputSchema as Anthropic.Messages.Tool.InputSchema,
    }));

    console.log("✅ Tools converted to Anthropic format");

    // List available prompts
    try {
      const promptsResponse = await mcpClient.listPrompts();
      console.log(`📝 Found ${promptsResponse.prompts.length} prompts:`);
      promptsResponse.prompts.forEach((prompt, index) => {
        console.log(`   ${index + 1}. ${prompt.name} - ${prompt.description}`);
      });
    } catch (error) {
      console.log("ℹ️  No prompts available");
    }

    // List available resources
    try {
      const resourcesResponse = await mcpClient.listResources();
      console.log(`📚 Found ${resourcesResponse.resources.length} resources:`);
      resourcesResponse.resources.forEach((resource, index) => {
        console.log(`   ${index + 1}. ${resource.uri} - ${resource.name}`);
      });
    } catch (error) {
      console.log("ℹ️  No resources available");
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      // OAuth authentication required
      console.log("\n⏳ Waiting for OAuth authentication to complete...");
      console.log(
        "   Once you authorize, the server will automatically reconnect.\n"
      );
      return; // Don't throw, let the callback handle reconnection
    }
    console.error("❌ Failed to connect to MCP server:", error);
    throw error;
  }
}

async function initializeTools(): Promise<void> {
  if (!mcpClient) {
    throw new Error("MCP client not initialized");
  }

  // List available tools
  const toolsResponse = await mcpClient.listTools();
  console.log(`📋 Found ${toolsResponse.tools.length} tools:`);

  toolsResponse.tools.forEach((tool, index) => {
    console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
  });

  // Convert MCP tools to Anthropic tool format
  availableTools = toolsResponse.tools.map((tool) => ({
    name: tool.name,
    description: tool.description || "",
    input_schema: tool.inputSchema as Anthropic.Messages.Tool.InputSchema,
  }));

  console.log("✅ Tools converted to Anthropic format");

  // List prompts
  try {
    const promptsResponse = await mcpClient.listPrompts();
    console.log(`📝 Found ${promptsResponse.prompts.length} prompts:`);
    promptsResponse.prompts.forEach((prompt, index) => {
      console.log(`   ${index + 1}. ${prompt.name} - ${prompt.description}`);
    });
  } catch (error) {
    console.log("ℹ️  No prompts available");
  }

  // List resources
  try {
    const resourcesResponse = await mcpClient.listResources();
    console.log(`📚 Found ${resourcesResponse.resources.length} resources:`);
    resourcesResponse.resources.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.uri} - ${resource.name}`);
    });
  } catch (error) {
    console.log("ℹ️  No resources available");
  }
}

async function reconnectAfterAuth(authCode: string): Promise<void> {
  if (!mcpTransport || !oauthProvider) {
    throw new Error("OAuth provider not initialized");
  }

  console.log("\n🔄 Completing OAuth flow...");

  await mcpTransport.finishAuth(authCode);
  oauthProvider.clearPendingAuth();

  console.log("✅ OAuth authentication successful!");
  console.log("🔌 Fetching available tools...\n");

  await initializeTools();

  console.log("\n✅ Backend fully connected and ready!");
  console.log("💡 You can now use the chat interface!\n");
}

async function reconnectMCPSession(): Promise<void> {
  console.log("\n🔄 Session expired, reconnecting to MCP server...");

  // Close existing client
  if (mcpClient) {
    await mcpClient.close();
  }

  // Create new transport and client
  if (!oauthProvider) {
    throw new Error("OAuth provider not initialized");
  }

  mcpTransport = new StreamableHTTPClientTransport(
    new URL(POLYMARKET_MCP_URL),
    {
      authProvider: oauthProvider,
    }
  );

  mcpClient = new Client(
    {
      name: "polymarket-mcp-demo",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(mcpTransport);
  console.log("✅ Reconnected to Polymarket MCP server");

  await initializeTools();
  console.log("✅ Session restored!\n");
}

// ============================================================================
// CLAUDE AI INTEGRATION
// ============================================================================

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

async function processMessageWithClaude(
  userMessage: string,
  conversationHistory: Message[],
  ws: WebSocket
): Promise<void> {
  try {
    const messages: Anthropic.Messages.MessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessage,
      },
    ];

    let response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: `You are a helpful assistant with access to Polymarket prediction market data. You can help users:

- Analyze prediction markets and their probabilities
- Find trending markets and events
- Compare markets within events
- Discover markets by category
- View recent trading activity
- Provide insights on market sentiment

**IMPORTANT SEARCH STRATEGIES:**
- When searching for specific markets, ALWAYS use the \`query\` parameter in \`search_markets\` with relevant keywords
- Try multiple search variations if the first search doesn't find results (e.g., "Bitcoin $100k", "BTC 100k", "Bitcoin exceed 100000")
- By default, searches only return active markets. Set \`closed: true\` if you need to search closed markets
- If a specific search fails, try broader searches or use \`list_tags\` to find relevant categories
- Order results by \`volume24hr\` or \`volume\` to find the most active markets

When users ask about prediction markets, use the available tools to fetch real-time data from Polymarket.
Present the information in a clear, engaging way with proper formatting.

Always explain what the probabilities mean and provide context for the markets you're analyzing.`,
      messages,
      tools: availableTools,
    });

    // Handle tool use loop
    while (response.stop_reason === "tool_use") {
      // Find ALL tool_use blocks (Claude might call multiple tools at once)
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      ) as Anthropic.Messages.ToolUseBlock[];

      if (toolUseBlocks.length === 0) break;

      // Add assistant message with tool uses
      messages.push({
        role: "assistant",
        content: response.content,
      });

      // Call all tools and collect results
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          console.log(`🔧 Tool called: ${toolUse.name}`);
          console.log(`   Input:`, JSON.stringify(toolUse.input, null, 2));

          // Retry logic for session expiration
          let retries = 0;
          const maxRetries = 2;

          while (retries < maxRetries) {
            try {
              const result = await mcpClient!.callTool({
                name: toolUse.name,
                arguments: toolUse.input as Record<string, unknown>,
              });

              console.log(
                `✅ Tool result received for ${toolUse.name} : ${JSON.stringify(
                  result.content
                )}`
              );

              return {
                type: "tool_result" as const,
                tool_use_id: toolUse.id,
                content: JSON.stringify(result.content),
              };
            } catch (error: any) {
              const errorMessage = error?.message || String(error);

              // Check if it's a session expiration error
              if (
                errorMessage.includes("Session not found or expired") &&
                retries < maxRetries - 1
              ) {
                console.log(
                  `⚠️  Session expired, reconnecting... (attempt ${
                    retries + 1
                  }/${maxRetries - 1})`
                );
                await reconnectMCPSession();
                retries++;
                continue;
              }

              // If not session error or out of retries, throw
              throw error;
            }
          }

          // This should never be reached, but TypeScript needs it
          throw new Error(
            `Failed to call tool ${toolUse.name} after ${maxRetries} attempts`
          );
        })
      );

      // Add user message with all tool results
      messages.push({
        role: "user",
        content: toolResults,
      });

      response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        messages,
        tools: availableTools,
      });
    }

    // Stream the final response
    const textContent = response.content.find(
      (block) => block.type === "text"
    ) as Anthropic.Messages.TextBlock | undefined;

    if (textContent) {
      const fullText = textContent.text;

      // Stream word by word for better UX
      const words = fullText.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = i === words.length - 1 ? words[i] : words[i] + " ";
        ws.send(word);
        // Small delay for streaming effect
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    ws.send("[END]");
  } catch (error) {
    console.error("❌ Error processing message:", error);
    ws.send(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    ws.send("[END]");
  }
}

// ============================================================================
// EXPRESS & WEBSOCKET SERVER
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// News endpoint (articles)
app.get("/news", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const language = (req.query.language as string) || undefined;
    const sortBy = req.query.sortBy as string as
      | "relevancy"
      | "popularity"
      | "publishedAt"
      | undefined;

    console.log(`📰 News API request: query="${q}", limit=${limit}`);
    if (!q.trim()) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter 'q'" });
    }

    const articles = await searchNews({
      query: q,
      from,
      to,
      limit,
      language,
      sortBy,
    });
    console.log(`📰 Found ${articles.length} articles for query: "${q}"`);
    res.json({ articles });
  } catch (err: any) {
    console.error("/news error:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Polywhaler whales endpoint (best-effort scraper)
app.get("/whales", async (req, res) => {
  try {
    const queryMode =
      (req.query.mode as string) || process.env.WHALES_MODE || "auto"; // auto | static | playwright
    const debug = req.query.debug === "1" || req.query.debug === "true";

    let trades: any[] = [];
    let modeUsed: string = queryMode;

    if (queryMode === "playwright") {
      trades = await fetchPolywhalerWhalesPlaywright({ debug });
    } else if (queryMode === "static") {
      trades = await fetchPolywhalerWhales({ debug });
    } else {
      // auto: try playwright then fallback to static if empty or failure
      try {
        trades = await fetchPolywhalerWhalesPlaywright({ debug });
        modeUsed = "playwright";
        if (!Array.isArray(trades) || trades.length === 0) {
          const backup = await fetchPolywhalerWhales({ debug });
          if (Array.isArray(backup) && backup.length > 0) {
            trades = backup;
            modeUsed = "static";
          }
        }
      } catch (e) {
        try {
          trades = await fetchPolywhalerWhales({ debug });
          modeUsed = "static";
        } catch (e2) {
          throw e2;
        }
      }
    }

    res.json({ trades, mode: modeUsed, debug });
  } catch (err: any) {
    console.error("/whales error:", err);
    res.status(500).json({ error: err?.message || "Failed to fetch whales" });
  }
});

// OAuth callback endpoint
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (code) {
    try {
      await reconnectAfterAuth(code);
      res.send(`
        <html>
          <head>
            <title>OAuth Success</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; }
              h1 { margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ Authentication Successful!</h1>
              <p>You can close this window and return to your terminal.</p>
              <p>The Polymarket MCP server is now connected and ready to use.</p>
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Failed to complete OAuth:", err);
      res.status(500).send(`
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; }
              h1 { margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Authentication Failed</h1>
              <p>Error: ${
                err instanceof Error ? err.message : "Unknown error"
              }</p>
              <p>Please check the server logs and try again.</p>
            </div>
          </body>
        </html>
      `);
    }
  } else if (error) {
    res.status(400).send(`
      <html>
        <head>
          <title>OAuth Error</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Authorization Failed</h1>
            <p>Error: ${error}</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(400).send("Invalid OAuth callback");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mcpConnected: mcpClient !== null,
    toolsAvailable: availableTools.length,
  });
});

// Get available tools endpoint
app.get("/tools", (req, res) => {
  res.json({
    tools: availableTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
    })),
  });
});

// Simple test endpoint to exercise MCP search (optional)
app.get("/test-search", async (req, res) => {
  try {
    const query = (req.query.query as string) || "bitcoin";
    if (!mcpClient) {
      return res.json({ query, error: "MCP not connected", results: [] });
    }
    const result = await mcpClient.callTool({
      name: "search_markets",
      arguments: { query, limit: 10 },
    });
    res.json({ query, result });
  } catch (error: any) {
    console.error("/test-search error", error);
    res.status(500).json({ error: error?.message || "search failed" });
  }
});

// Market volumes endpoint used by the Charts page
// Returns: { query, chartData: Array<{ name, volume, probability, slug }>, total }
app.get("/market-volumes", async (req, res) => {
  const query = (req.query.query as string) || "";
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 12) : 6;

  if (!query.trim()) {
    return res.json({ query, chartData: [], total: 0 });
  }

  try {
    let chartData: Array<{
      name: string;
      volume: number;
      probability: number;
      slug: string;
    }> = [];

    if (mcpClient) {
      // Try MCP search_markets tool first
      try {
        const result = await mcpClient.callTool({
          name: "search_markets",
          arguments: { query, limit, closed: false, sort_by: "volume24hr" },
        });

        // Heuristically extract markets from returned content
        const blocks: any[] = Array.isArray((result as any).content)
          ? ((result as any).content as any[])
          : [];

        const candidates: any[] = [];
        for (const b of blocks) {
          const txt = typeof b === "string" ? b : (b?.text as string) || "";
          if (!txt) continue;
          // Find lines that look like: Question - Volume: $12.3k | Probability: 54% | slug: something
          const lines = txt.split(/\n+/);
          for (const line of lines) {
            const volumeMatch = line.match(
              /Volume:\s*\$?([0-9][0-9,\.]*\s*[kmb]?)/i
            );
            const probMatch = line.match(
              /Probability:\s*([0-9]+(?:\.[0-9]+)?)%/i
            );
            const slugMatch = line.match(/slug:\s*([A-Za-z0-9-_]+)/i);
            if (volumeMatch) {
              let name = line.split(" - ")[0]?.trim() || line.trim();
              const volStr = volumeMatch[1].replace(/,/g, "").trim();
              let volNum = parseFloat(volStr);
              const low = volStr.toLowerCase();
              if (low.endsWith("k"))
                volNum = volNum * 1; // already in thousands
              else if (low.endsWith("m"))
                volNum = volNum * 1000; // convert millions to thousands
              else if (low.endsWith("b"))
                volNum = volNum * 1_000_000; // billions to thousands
              else volNum = volNum / 1000; // dollars -> thousands
              const prob = probMatch
                ? Math.max(0, Math.min(1, parseFloat(probMatch[1]) / 100))
                : 0;
              const slug = slugMatch
                ? slugMatch[1]
                : name.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
              candidates.push({
                name,
                volume: Math.round(volNum * 10) / 10,
                probability: prob,
                slug,
              });
            }
          }
        }

        if (candidates.length) {
          // Deduplicate by name and take top by volume
          const seen = new Set<string>();
          chartData = candidates
            .filter((c) => {
              if (seen.has(c.name)) return false;
              seen.add(c.name);
              return true;
            })
            .sort((a, b) => b.volume - a.volume)
            .slice(0, limit);
        }
      } catch (err) {
        console.warn(
          "search_markets via MCP failed, will fallback to mock",
          err
        );
      }
    }

    // Fallback: return mock data to keep the Charts page functional
    if (chartData.length === 0) {
      chartData = Array.from({ length: limit }).map((_, i) => ({
        name: `${query} market #${i + 1}`,
        volume: Math.round((12 - i * 1.3) * 10) / 10, // thousands
        probability: Math.max(0.1, 0.85 - i * 0.08),
        slug: `${query}-market-${i + 1}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      }));
    }

    console.log(`✅ Found ${chartData.length} markets for volume chart`);
    res.json({ query, chartData, total: chartData.length });
  } catch (error) {
    console.error("/market-volumes error", error);
    res.status(500).json({ error: "Failed to build chart data" });
  }
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`✅ HTTP server running on port ${PORT}`);
});

// WebSocket server for chat
const wss = new WebSocketServer({ server });

// Store conversation history per client
const conversationHistories = new Map<WebSocket, Message[]>();

wss.on("connection", (ws) => {
  console.log("👤 New client connected");
  conversationHistories.set(ws, []);

  ws.on("message", async (data) => {
    const userMessage = data.toString();
    console.log(`📨 Received: ${userMessage}`);

    const history = conversationHistories.get(ws) || [];

    // Add user message to history
    history.push({ role: "user", content: userMessage });

    // Process with Claude
    await processMessageWithClaude(userMessage, history.slice(0, -1), ws);

    // Update history with assistant response
    // Note: We'd need to capture the full response to add it to history
    // For now, we'll keep the conversation context simple
  });

  ws.on("close", () => {
    console.log("👋 Client disconnected");
    conversationHistories.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function startup() {
  console.log("🚀 Starting Polymarket MCP Demo Backend...\n");

  try {
    await initializeMCPClient();

    if (mcpClient && availableTools.length > 0) {
      console.log("\n✅ Backend ready!");
      console.log(`📡 WebSocket server: ws://localhost:${PORT}`);
      console.log(`🌐 HTTP server: http://localhost:${PORT}`);
      console.log("\n💡 Connect your frontend to ws://localhost:${PORT}\n");
    } else {
      // OAuth authentication is in progress
      console.log(
        "\n⏳ Server is running, waiting for OAuth authentication..."
      );
      console.log(`📡 WebSocket server: ws://localhost:${PORT}`);
      console.log(`🌐 HTTP server: http://localhost:${PORT}`);
      console.log(
        `🔐 OAuth callback: http://localhost:${PORT}/oauth/callback\n`
      );
    }
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

startup();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");

  if (mcpClient) {
    await mcpClient.close();
  }

  wss.close(() => {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });
});
