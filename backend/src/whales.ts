import * as cheerio from "cheerio";

export interface WhaleTrade {
  id: string;
  marketTitle?: string;
  side?: "BUY" | "SELL";
  amountUsd?: number;
  price?: number;
  outcome?: string;
  trader?: string;
  timestamp?: number;
  txUrl?: string;
  shares?: number;
  probability?: number;
}

// Simple in-memory cache for static mode
const cache: { data: WhaleTrade[]; ts: number } = { data: [], ts: 0 };
const TTL_MS = 60_000;

export async function fetchPolywhalerWhales(
  options: { debug?: boolean } = {}
): Promise<WhaleTrade[]> {
  const now = Date.now();
  if (cache.data.length && now - cache.ts < TTL_MS) return cache.data;

  const res = await fetch("https://www.polywhaler.com/", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  let trades: WhaleTrade[] = [];

  const nextData = $("script#__NEXT_DATA__").html();
  if (nextData) {
    try {
      const json = JSON.parse(nextData);
      const pageProps = json?.props?.pageProps || json?.props || {};
      const deepFind = (obj: any): any[] => {
        const results: any[] = [];
        const visit = (o: any) => {
          if (!o || typeof o !== "object") return;
          if (Array.isArray(o)) {
            for (const it of o) visit(it);
          } else {
            for (const [k, v] of Object.entries(o)) {
              if (Array.isArray(v) && v.length) {
                const looksLikeTrade = v.some(
                  (t: any) =>
                    t &&
                    typeof t === "object" &&
                    (t.side || t.amountUsd || t.marketTitle || t.market)
                );
                if (looksLikeTrade) results.push(...v);
              }
              if (v && typeof v === "object") visit(v);
            }
          }
        };
        visit(obj);
        return results;
      };
      const candidates = deepFind(pageProps);
      trades = candidates.map((t: any, i: number) => ({
        id: String(t.id || t.tradeId || t.txid || i),
        marketTitle: t.marketTitle || t.market || t.market_name,
        side: (t.side || t.action || "")
          .toString()
          .toUpperCase()
          .includes("SELL")
          ? "SELL"
          : (t.side || t.action || "").toString().toUpperCase().includes("BUY")
          ? "BUY"
          : undefined,
        amountUsd:
          Number(t.amountUsd || t.usd || t.size_usd || t.size || t.amount) ||
          undefined,
        price: Number(t.price || t.fill_price || t.avg_price) || undefined,
        outcome: t.outcome || t.option || t.choice,
        trader: t.trader || t.wallet || t.user,
        timestamp: Number(t.time || t.timestamp || t.ts) || undefined,
        txUrl: t.txUrl || t.tx_url || t.tx_hash || undefined,
      }));
    } catch {}
  }

  // Static fallback: attempt simple anchor scan (best-effort)
  if (!trades.length) {
    const anchors = $("a:contains('Trader:')");
    anchors.each((i, el) => {
      const text = $(el).text().trim();
      const sideMatch = text.match(/\b(BUY|SELL)\b/i);
      const amtMatch = text.match(/\$\s*([0-9][0-9,]+)/);
      if (!sideMatch || !amtMatch) return;
      trades.push({
        id: `${Date.now()}-${i}`,
        marketTitle: text.slice(0, 140),
        side: sideMatch[1].toUpperCase() as any,
        amountUsd: Number(amtMatch[1].replace(/,/g, "")) || undefined,
      });
    });
  }

  const normalized = trades
    .filter((t) => t.amountUsd && t.side && t.marketTitle)
    .slice(0, 25);

  cache.data = normalized;
  cache.ts = Date.now();
  if (options.debug) {
    console.log("[whales static]", { count: normalized.length });
  }
  return normalized;
}

export async function fetchPolywhalerWhalesPlaywright(
  options: { debug?: boolean } = {}
): Promise<WhaleTrade[]> {
  const playwright = await import("playwright-aws-lambda");
  let browser: any;
  try {
    browser = await playwright.launchChromium();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    await page.route("**/*", (route: any) => {
      const req = route.request();
      if (["image", "font", "stylesheet"].includes(req.resourceType()))
        return route.abort();
      route.continue();
    });
    await page.goto("https://www.polywhaler.com/", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3500);

    const trades = (await page.evaluate(() => {
      const toUsd = (s: string): number | undefined => {
        const m = s.match(/\$\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);
        if (!m) return undefined;
        try {
          return Number(m[1].replace(/,/g, ""));
        } catch {
          return undefined;
        }
      };
      const doc: any = (globalThis as any).document;
      if (!doc) return [] as any[];
      const anchors = Array.from(doc.querySelectorAll("a")) as any[];
      const viewMarketAnchors = anchors.filter((a: any) =>
        (a.textContent || "").toLowerCase().includes("view market")
      );
      const cards: any[] = [];
      viewMarketAnchors.forEach((a: any) => {
        const c = (a.closest &&
          (a.closest("article") || a.closest("li") || a.closest("div"))) as any;
        if (c && !cards.includes(c)) cards.push(c);
      });
      const results: any[] = [];
      cards.forEach((card, idx) => {
        const text = (card.textContent || "").replace(/\s+/g, " ").trim();
        if (!/Trader:/i.test(text)) return; // ensure trade block
        const sideMatch = text.match(/\b(BUY|SELL)\b/i);
        const amountUsd = toUsd(text);
        if (!sideMatch || !amountUsd) return;
        const trader = (text.match(/Trader:\s*([A-Za-z0-9._-]+)/i) || [])[1];
        // Market title heuristic: longest anchor before 'View Market'
        const links = Array.from(card.querySelectorAll("a")) as any[];
        const vmIndex = links.findIndex((l: any) =>
          (l.textContent || "").toLowerCase().includes("view market")
        );
        let marketTitle = "";
        if (vmIndex > 0) {
          const titleAnchor: any = [...links.slice(0, vmIndex)]
            .reverse()
            .find((l: any) => (l.textContent || "").trim().length > 25);
          marketTitle = ((titleAnchor && titleAnchor.textContent) || "")
            .replace(/\s+/g, " ")
            .trim();
        }
        if (!marketTitle) marketTitle = text.slice(0, 160);
        const prob = (text.match(/(\d{1,3}(?:\.\d)?)%\s*probability/i) ||
          [])[1];
        const shares = (text.match(
          /([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*shares/i
        ) || [])[1];
        results.push({
          id: `${Date.now()}-${idx}`,
          marketTitle,
          side: sideMatch[1].toUpperCase(),
          amountUsd,
          trader,
          shares: shares ? Number(shares.replace(/,/g, "")) : undefined,
          probability: prob ? Number(prob) : undefined,
        });
      });
      const seen = new Set<string>();
      return results
        .filter((r) => {
          const k = `${r.marketTitle}|${r.trader}|${r.amountUsd}|${r.side}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .slice(0, 50);
    })) as WhaleTrade[];

    const filtered = trades.filter(
      (t) => t.amountUsd && t.trader && t.side && t.marketTitle
    );
    if (options.debug)
      console.log("[whales playwright]", {
        extracted: trades.length,
        filtered: filtered.length,
      });
    return filtered.slice(0, 25);
  } finally {
    if (browser) await browser.close();
  }
}
