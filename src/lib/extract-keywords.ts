/**
 * Extract relevant keywords from assistant text (and optional user seed) for news search.
 */
export type ExtractOptions = {
  userSeed?: string;
};

export function extractNewsKeywords(
  text: string,
  opts: ExtractOptions = {}
): string {
  if (!text) return "";

  // Remove common markdown formatting
  let cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~]/g, "");

  // Strip MCP/Claude tool markup and XML-like tags that can leak into text, normalize quotes
  cleaned = cleaned
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/<function_calls[\s\S]*?<\/function_calls>/gi, " ")
    .replace(/<invoke[^>]*>[\s\S]*?<\/invoke>/gi, " ")
    .replace(/<parameter[^>]*>[\s\S]*?<\/parameter>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ") // any other tags
    .replace(/&[a-z]+;/gi, " ") // html entities like &gt;
    .replace(
      /\b(search_markets|list_tags|tools?|invoke|parameter|function_calls?)\b/gi,
      " "
    );

  const seed = (opts.userSeed || "").trim();
  const seedCandidates: string[] = [];

  if (seed) {
    const seedQuoted =
      seed.match(/"([^"]{2,100})"/g)?.map((m) => m.replace(/"/g, "").trim()) ||
      [];
    seedCandidates.push(...seedQuoted);

    const proper =
      seed.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g) || [];
    seedCandidates.push(...proper);

    const dollar = seed.match(/\b(BTC|ETH|SOL|DOGE|USD|USDC|USDT)\b/gi) || [];
    seedCandidates.push(...dollar);
  }

  const headingRegex = /(?:^|\n)\s{0,3}#{1,6}\s+([^\n]{2,100})/g;
  const headingCandidates: string[] = [];
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(text)) !== null) {
    const heading = hMatch[1].trim();
    if (
      !/^(key insights|overview|summary|active markets|nothing ever happens)$/i.test(
        heading
      )
    ) {
      headingCandidates.push(heading);
    }
  }

  const patterns = [
    /"([^"]{5,80})"/g,
    /market[:\s]+([A-Z][^.!?\n]{10,80})/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g,
    /(election|primary|debate|bitcoin|ethereum|btc|eth|inflation|interest rates|ukraine|russia|china|us|house|senate|fed|ai|artificial intelligence|government|congress|parliament|policy|legislation)/gi,
  ];

  const keywords = new Set<string>();
  for (const regex of patterns) {
    let m: RegExpExecArray | null;
    while ((m = regex.exec(cleaned)) !== null) {
      // If nothing extracted, use cleaned seed words (drop the word 'polymarket')
      if (seedCandidates.length === 0) {
        const cleanedSeed = seed
          .replace(/polymarket/gi, "")
          .replace(/[^\w\s$-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanedSeed.length >= 3) seedCandidates.push(cleanedSeed);
      }
      const cand = (m[1] || m[0]).trim();
      if (cand.length >= 3 && cand.length <= 120) {
        keywords.add(cand);
      }
    }
  }

  for (const c of [...seedCandidates, ...headingCandidates]) {
    const cleanedC = c
      .replace(/polymarket/gi, "")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleanedC && cleanedC.length >= 3 && cleanedC.length <= 100) {
      keywords.add(cleanedC);
    }
  }

  // Clean and filter out junky phrases
  function isBadPhrase(s: string): boolean {
    if (/[:=)(]/.test(s)) return true; // sentence fragments
    const words = s.split(/\s+/);
    if (words.length > 5) return true; // keep phrases short
    const stop = new Set([
      "and",
      "or",
      "with",
      "about",
      "those",
      "these",
      "their",
      "your",
      "good",
      "great",
      "best",
      "view",
      "today",
      "now",
      "would",
      "like",
      "into",
      "give",
      "get",
      "show",
      "shifted",
      "over",
      "past",
      "days",
      "weeks",
      "months",
      "analysis",
      "snapshot",
      "categories",
      "comprehensive",
      "probabilities",
      "uncertainty",
      "entry",
      "points",
      "target",
      "targets",
      "strategy",
      "strategies",
      "opportunities",
      "opportunity",
    ]);
    const allStop = words.every((w) => stop.has(w.toLowerCase()));
    return allStop;
  }

  const arr = Array.from(keywords)
    .map((s) =>
      s
        .replace(/[^\w\s$-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((s) => s && !isBadPhrase(s));

  const finalArr = arr.slice(0, 3);
  if (finalArr.length === 0) {
    const firstSentence = cleaned.split(/[.!?]/)[0].trim();
    if (firstSentence) return firstSentence.slice(0, 100);
    if (seed) return seed;
    return "";
  }
  return finalArr.join(" OR ");
}
