// lib/corpCheck.js
// Auto-flag listings that look like major corporations or franchises.
// This does NOT auto-reject — it scores a listing so the human review
// queue can sort obvious approvals from suspicious ones.
//
// Higher score = more likely a big corporation = needs scrutiny.

// 1) Known big-brand / franchise domains. Extend this freely.
//    (A real deployment would pull from a maintained list or a
//     company-data API like Clearbit; this is a solid starting set.)
const BLOCKED_DOMAINS = [
  "amazon.com","walmart.com","target.com","homedepot.com","lowes.com",
  "bestbuy.com","starbucks.com","mcdonalds.com","subway.com","ubereats.com",
  "doordash.com","instacart.com","angi.com","thumbtack.com","yelp.com",
  "fiverr.com","upwork.com","taskrabbit.com","geeksquad.com","rotorooter.com",
  "hrblock.com","jacksonhewitt.com","supercuts.com","greatclips.com",
  "marriott.com","hilton.com","expedia.com","booking.com","kayak.com",
];

// 2) Franchise / big-company language found on the page.
const CORP_PHRASES = [
  "nationwide locations","locations nationwide","franchise opportunities",
  "investor relations","our shareholders","fortune 500","publicly traded",
  "nasdaq","nyse:","corporate headquarters","a subsidiary of",
  "® is a registered trademark","all rights reserved ©","careers at",
  "available in all 50 states","over 1,000 locations","store locator",
];

// 3) Signals that something IS a small/independent shop (lowers the score).
const SMALL_PHRASES = [
  "family owned","family-owned","locally owned","independent","owner-operated",
  "small business","mom and pop","handmade","established 19","established 20",
  "veteran owned","woman owned","serving the local","sole proprietor",
];

function rootDomain(url) {
  try {
    const host = new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace(/^www\./, "");
    return host.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Score a submitted listing. Returns { score, flags, autoApprovable }.
 * - Fetches the site HTML (best effort; failures don't block submission).
 * - score >= 50  → very likely a corporation, surface loudly in the queue.
 * - score <= 0   → looks independent; can be fast-approved.
 */
export async function corpCheck({ websiteUrl, businessName, description, attestedIndependent }) {
  const flags = [];
  let score = 0;

  const domain = rootDomain(websiteUrl);

  // Hard signal: known big-brand domain
  if (BLOCKED_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) {
    flags.push(`Domain "${domain}" is a known large company or aggregator.`);
    score += 100;
  }

  // Attestation: if they did NOT confirm independence, that's a flag.
  if (!attestedIndependent) {
    flags.push("Helper did not attest to being independent / small business.");
    score += 20;
  }

  // Scan the listing text + (best effort) the page itself.
  let pageText = `${businessName} ${description}`.toLowerCase();
  try {
    const res = await fetch(websiteUrl.startsWith("http") ? websiteUrl : "https://" + websiteUrl, {
      headers: { "User-Agent": "HelpfulxHuman-ListingChecker/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const html = (await res.text()).toLowerCase();
      pageText += " " + html.replace(/<[^>]+>/g, " ");
    } else {
      flags.push(`Website returned HTTP ${res.status}.`);
      score += 5;
    }
  } catch {
    flags.push("Could not fetch the website (may be down or blocking bots).");
    score += 5;
  }

  for (const phrase of CORP_PHRASES) {
    if (pageText.includes(phrase)) {
      flags.push(`Found corporate-style phrase: "${phrase}".`);
      score += 18;
    }
  }
  let smallHits = 0;
  for (const phrase of SMALL_PHRASES) {
    if (pageText.includes(phrase)) {
      smallHits++;
      score -= 12;
    }
  }
  if (smallHits) flags.push(`Found ${smallHits} small/independent-business signal(s).`);

  if (score < 0) score = 0;

  // Fast-approve only if it's clean AND they attested.
  const autoApprovable = score === 0 && attestedIndependent;

  return { score, flags, autoApprovable };
}
