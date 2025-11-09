/**
 * Extracts relevant keywords from Claude's response for news search.
 * Focuses on market topics, political figures, events, etc.
 */
type ExtractOptions = {
  userSeed?: string; // the user's original query or last user message
};

export function extractNewsKeywords(text: string, opts: ExtractOptions = {}): string {
  if (!text) return "";

  // Remove common markdown formatting
  let cleaned = text
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/[#*_~]/g, ""); // markdown symbols

  // If we get a user seed (e.g., "polymarket mrbeast"), prioritize extracting from it
  const seed = (opts.userSeed || "").trim();
  const seedCandidates: string[] = [];

  if (seed) {
    // quoted phrases from seed
    const seedQuoted = seed.match(/"([^"]{2,100})"/g)?.map((m) => m.replace(/"/g, "").trim()) || [];
    seedCandidates.push(...seedQuoted);

    // proper nouns from seed (MrBeast, Taylor Swift)
    const seedProper = seed.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) || [];
    seedCandidates.push(...seedProper);

    // if nothing extracted, use cleaned seed words (drop the word 'polymarket')
    if (seedCandidates.length === 0) {
      const cleanedSeed = seed
        .replace(/polymarket/gi, "")
        .replace(/[^\w\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (cleanedSeed.length >= 3) seedCandidates.push(cleanedSeed);
    }
  }

  // Also try to capture headings from assistant markdown (avoid generic ones)
  const headingCandidates: string[] = [];
  const headingRegex = /^(?:#{1,6})\s+(.{3,100})$/gm;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(text)) !== null) {
    const heading = hMatch[1].trim();
    if (!/^(key insights|overview|summary|active markets|nothing ever happens)$/i.test(heading)) {
      headingCandidates.push(heading);
    }
  }

  // Common patterns for markets and topics (from assistant text)
  const patterns = [
    // Market titles in quotes or after "market"
    /"([^"]{10,80})"/g,
    /market[:\s]+([A-Z][^.!?\n]{10,80})/gi,

    // Political figures (capitalized names)
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g,

    // Events and topics
    /(?:election|debate|vote|poll|win|lose|race|campaign|presidency)\s+(?:of|for|in)?\s*([A-Z][^.!?\n]{5,40})/gi,
  ];

  const keywords = new Set<string>();

  // Extract using patterns
  for (const pattern of patterns) {
    const matches = cleaned.matchAll(pattern);
    for (const match of matches) {
      const keyword = (match[1] || match[0]).trim();
      // Filter out generic words and very long/short strings
      if (keyword.length > 5 && keyword.length < 100) {
        // Skip if it's just common words
        if (!/^(the|this|that|will|would|could|should|market|question|probability)$/i.test(keyword)) {
          keywords.add(keyword);
        }
      }
    }
  }

  // Seed and heading candidates first
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

  // If we extracted multiple keywords, join them with OR logic (up to 3)
  const keywordArray = Array.from(keywords).slice(0, 3);

  // If no good keywords found, fall back to first sentence
  if (keywordArray.length === 0) {
    const firstSentence = cleaned.split(/[.!?]/)[0].trim();
    return firstSentence.slice(0, 200);
  }

  return keywordArray.join(" OR ");
}
