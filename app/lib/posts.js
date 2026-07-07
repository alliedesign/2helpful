// app/lib/posts.js
// Single source of truth for all blog posts. The index page and the [slug] page
// both read from here. `body` is an array of blocks rendered by PostBody.

export const SITE = "https://helpfulxhumans.com";

// Reusable CTA blocks
const CTA_FIND = {
  type: "cta",
  title: "Ready to find someone?",
  text: "Search real, independent helpers near you — free to browse, free to contact.",
  primary: { href: "/search", label: "Find a helper" },
  ghost: { href: "/community", label: "Visit the community" },
};
const CTA_JOIN = {
  type: "cta",
  title: "Are you a helper?",
  text: "List your business for $5/day and get found by people actually looking for what you do.",
  primary: { href: "/join", label: "List your business" },
  ghost: { href: "/build-my-site", label: "Get a free website" },
};
const CTA_SITE = {
  type: "cta",
  title: "No website? We'll build you one.",
  text: "Tell us about your business and we'll create a clean, mobile-friendly site — and list you in search so clients can find you.",
  primary: { href: "/build-my-site", label: "Build my site" },
  ghost: { href: "/join", label: "List your business" },
};

export const POSTS = [
  // 1 — PILLAR
  {
    slug: "what-is-helpful-x-humans",
    kind: "Start here",
    title: "What Is Helpful × Humans? A Search Engine for Independent Helpers",
    heading: "What Is Helpful × Humans?",
    dek: "A plain-English guide to the directory built for real people and mom-and-pop shops — not corporations.",
    description:
      "Helpful × Humans is a free search engine for real, independent helpers — no corporations, no middleman. Learn how it works for customers and helpers.",
    read: "5 min read",
    body: [
      { type: "p", html: "<strong>Helpful × Humans is a search engine for independent helpers</strong> — real people and small, mom-and-pop businesses you can hire directly. No big corporations, no paid ads burying the little guy, no middleman sitting in the middle of your conversation. You search, you find a real person, and you reach out to them yourself." },
      { type: "p", html: "Most marketplaces today are crowded with faceless companies competing for the top spot. The independent tutor, the local handyman, the mobile groomer, the one-person bookkeeping shop — they get drowned out. Helpful × Humans exists to flip that: it only lists real, independent people and small businesses, so what you find is genuinely local and human." },
      { type: "callout", title: "The short version", items: [
        "<strong>Free for customers.</strong> Searching, browsing, and contacting helpers costs nothing. You never pay to find help.",
        "<strong>Helpers pay to be listed</strong> — a basic listing is $5 per day.",
        "<strong>Every listing is human-reviewed</strong> before it goes live, to keep out spam and corporations.",
        "<strong>You hire directly.</strong> Helpful × Humans doesn't take a cut or sit inside your conversation.",
        "<strong>Works everywhere</strong> — phone, tablet, or computer, on every modern browser.",
      ]},
      { type: "h2", text: "Why \u201Cno corporations\u201D is the whole point" },
      { type: "p", html: "The people who need work done and the neighbors who can do that work deserve to find each other without a giant company taking a cut in between. That's the founding idea. A single, independent operator can list next to nobody but other independent operators — and rank on the strength of what they offer, not the size of their ad budget." },
      { type: "h2", text: "How it works for people looking for help" },
      { type: "ol", items: [
        "<strong>Search</strong> for what you need — a service, a skill, a kind of help.",
        "<strong>Browse real listings</strong> from independent helpers, each reviewed before going live.",
        "<strong>Contact them directly.</strong> You talk to the helper, agree on the work, and hire them. The platform stays out of it.",
      ]},
      { type: "p", html: "Because you contact and hire helpers directly, any agreement is between you and them — so it's always smart to check details, ask questions, and use your own judgment, the same way you would with any local pro." },
      CTA_FIND,
      { type: "h2", text: "How it works for helpers" },
      { type: "p", html: "If you're the one offering help, you create a listing on the <a href=\"/join\">join page</a>. A basic listing is <strong>$5 per day</strong>; featured placement costs more and pushes you higher in results. Every listing is reviewed before it's published, which keeps the whole marketplace genuine — that review is part of what customers are trusting when they search." },
      { type: "p", html: "No website? That's not a blocker. Helpful × Humans will <a href=\"/build-my-site\">build you a simple, beautiful site</a> and list you in search automatically, so clients can find you even if you're starting from zero." },
      { type: "h2", text: "Trust and safety, in plain terms" },
      { type: "p", html: "Every listing is reviewed before going live to keep the marketplace free of spam and corporations. That said, Helpful × Humans is a place to <em>find</em> people, not a contract or an escrow service — you hire directly, so read reviews, ask questions, and confirm details with the helper before money changes hands. If a listing is misleading or breaks the guidelines, you can report it by DM on <a href=\"https://instagram.com/helpfulxhumans\">Instagram</a> or X (both @helpfulxhumans) and the team will review it." },
      { type: "h2", text: "Who's behind it" },
      { type: "p", html: "A small, independent team that believes local, independent helpers deserve a place to be found — without competing against faceless corporations for attention. The fastest way to reach them is a DM to @helpfulxhumans on Instagram or X. They're friendly, and they actually reply." },
    ],
    faqs: [
      ["What is Helpful × Humans?", "Helpful × Humans is a search engine for independent helpers — real people and small businesses you can find and hire directly. It deliberately excludes big corporations so local, independent helpers can be found."],
      ["Is it free to use?", "Yes. Searching, browsing, and contacting helpers is completely free for customers. Helpers pay to be listed; you never pay to find them."],
      ["How much does a listing cost for helpers?", "A basic listing is $5 per day. Featured listings cost more and appear higher in search results."],
      ["Does Helpful × Humans take a cut of what I pay a helper?", "No. You contact and hire helpers directly, and the platform doesn't sit in the middle of your conversation or take a cut of the work."],
      ["Are helpers vetted?", "Every listing is reviewed before it goes live to keep the marketplace genuine and free of spam. You should still use your own judgment when hiring — check reviews and confirm details directly."],
    ],
    related: ["hire-a-local-independent-helper", "list-your-business-get-found", "vs-other-search-engines"],
  },

  // 2 — HIRE
  {
    slug: "hire-a-local-independent-helper",
    kind: "Guide",
    title: "How to Hire a Local Independent Helper Near You (Free Guide)",
    heading: "How to Hire a Local Independent Helper Near You",
    dek: "Find a real person who does the work themselves — and hire them directly, without the fees.",
    description:
      "A free, step-by-step guide to finding and hiring a real, independent helper near you on Helpful × Humans — no corporations, no middleman, no fees to contact.",
    read: "6 min read",
    body: [
      { type: "p", html: "Hiring someone local shouldn't mean scrolling past ten sponsored ads and three national chains before you find an actual person. This guide walks through how to find and hire an <strong>independent helper near you</strong> — a real human who does the work themselves — using Helpful × Humans, and how to do it well." },
      { type: "h2", text: "Step 1 — Search for what you actually need" },
      { type: "p", html: "Start on the <a href=\"/search\">search page</a> and describe the help you want in plain words: the service, the skill, or the problem. Helpful × Humans only returns independent helpers and small businesses, so you won't be wading through corporate listings to get to a person." },
      { type: "h2", text: "Step 2 — Read the listing like a human, not an algorithm" },
      { type: "p", html: "Each listing is reviewed before it goes live, but you're still the final judge. Look for:" },
      { type: "ul", items: [
        "<strong>A clear description</strong> of what they do and who they serve.",
        "<strong>Whether they work virtually, in person, or both</strong> — and where they're based.",
        "<strong>Reviews and ratings</strong>, if available.",
        "<strong>Categories</strong> that match your need, so you know you're in the right place.",
      ]},
      { type: "h2", text: "Step 3 — Contact them directly" },
      { type: "p", html: "This is the part that makes Helpful × Humans different: <strong>you reach out to the helper yourself.</strong> There's no platform sitting in the middle of your conversation and no cut taken from the job. Contacting helpers is completely free." },
      CTA_FIND,
      { type: "h2", text: "Step 4 — Ask the right questions before you commit" },
      { type: "p", html: "Because you're hiring directly, a short conversation up front saves headaches later. Good things to confirm:" },
      { type: "ul", items: [
        "Availability and timeline for your job.",
        "How they price — flat rate, hourly, or per project — and what's included.",
        "Whether they've done work like yours before, with examples if possible.",
        "How you'll communicate and how they prefer to be paid.",
      ]},
      { type: "h2", text: "Step 5 — Use your judgment" },
      { type: "p", html: "Every listing on Helpful × Humans is reviewed to keep the marketplace genuine, but any agreement you make is between you and the helper. Treat it like hiring any local pro: check reviews, ask questions, confirm the details, and trust your gut. If something about a listing seems off or misleading, you can report it to @helpfulxhumans and the team will take a look." },
      { type: "h2", text: "Why go independent instead of a big platform?" },
      { type: "p", html: "When you hire an independent helper, more of your money goes to the person doing the work instead of to a corporation skimming the middle. You usually get more personal service, more flexibility, and a real relationship with someone in your community. For more on that, see <a href=\"/blog/support-independent-local-helpers\">why supporting independent helpers matters</a>." },
    ],
    faqs: [
      ["Does it cost anything to contact a helper?", "No. Searching, browsing, and contacting helpers on Helpful × Humans is completely free for customers."],
      ["How do I actually hire someone?", "You contact the helper directly through the details on their listing, agree on the work and price with them, and hire them yourself. The platform doesn't sit in the middle."],
      ["What should I ask before hiring?", "Confirm availability, pricing and what's included, relevant experience or examples, how you'll communicate, and how they prefer to be paid."],
      ["What if there's a problem with a helper?", "Since you hire helpers directly, any agreement is between you and them. If a listing itself is misleading or breaks the guidelines, report it to @helpfulxhumans on Instagram or X and the team will review it."],
    ],
    related: ["what-is-helpful-x-humans", "support-independent-local-helpers", "vs-other-search-engines"],
  },

  // 3 — LIST
  {
    slug: "list-your-business-get-found",
    kind: "For helpers",
    title: "How to List Your Business & Get Found: A Guide for Independent Helpers",
    heading: "How to List Your Business & Get Found",
    dek: "Turn a simple $5/day listing into real clients — without outspending the corporations.",
    description:
      "List your independent business on Helpful × Humans for $5/day and get found by real customers — no corporations to outbid. A step-by-step guide for helpers.",
    read: "7 min read",
    body: [
      { type: "p", html: "If you're an independent helper — a solo pro, a freelancer, a mom-and-pop shop — the hardest part usually isn't the work. It's getting <strong>found</strong> by the people who need you, without spending a fortune competing against national brands. Here's how to list your business on Helpful × Humans and actually get discovered." },
      { type: "callout", title: "What a listing costs", items: [
        "<strong>Basic listing:</strong> $5 per day.",
        "<strong>Featured listing:</strong> costs more, and ranks higher in search results.",
        "<strong>Getting found by customers:</strong> free for them — they never pay to contact you.",
      ]},
      { type: "h2", text: "Why list here instead of running ads?" },
      { type: "p", html: "On the big ad platforms, an independent helper is bidding against corporations with unlimited budgets, and the cost per click keeps climbing. On Helpful × Humans there are <strong>no corporations to outbid.</strong> Every listing is a real, independent person or small business, so you're competing on what you offer — not on how deep your pockets are. A predictable $5/day beats an unpredictable ad auction for a lot of small operators." },
      { type: "h2", text: "Step 1 — Create your listing" },
      { type: "p", html: "Head to the <a href=\"/join\">join page</a> to get started. You'll describe what you do, who you serve, whether you work virtually or in person, and where you're based. Keep it specific and human — that's the whole brand." },
      { type: "h2", text: "Step 2 — Write a listing that gets clicks" },
      { type: "ul", items: [
        "<strong>Lead with the outcome.</strong> Say what you help people get done, not just your job title.",
        "<strong>Name your specialty.</strong> \u201CLived-in balayage for busy moms\u201D beats \u201Chair services.\u201D",
        "<strong>Be clear on where and how.</strong> Virtual, in person, or both — and your area.",
        "<strong>Add categories that match how people search</strong>, so you show up for the right queries.",
        "<strong>Use a real photo or header</strong> so your card stands out in the grid.",
      ]},
      { type: "h2", text: "Step 3 — Get reviewed and go live" },
      { type: "p", html: "Every listing is reviewed before it publishes. That review is a feature, not a hurdle — it's what keeps the marketplace free of spam and corporations, and it's part of why customers trust what they find here. Once you're approved, you're searchable." },
      CTA_JOIN,
      { type: "h2", text: "Step 4 — No website? Get one built for you" },
      { type: "p", html: "You don't need a website to list, but having one helps you convert the people who find you. Helpful × Humans will <a href=\"/build-my-site\">build you a clean, mobile-friendly site</a> and list you in search automatically. Every helpful human deserves a home on the web — see <a href=\"/blog/free-website-when-you-list\">how the free website offer works</a> and examples of real sites already built." },
      { type: "h2", text: "Step 5 — Keep your listing fresh" },
      { type: "p", html: "Update your description as your offerings change, keep your photos current, and consider a featured listing during your busy season for a visibility bump. The more clearly your listing answers \u201Ccan this person help me?\u201D, the more contacts you'll get." },
      { type: "h2", text: "Getting help setting up" },
      { type: "p", html: "If you'd like a hand, the fastest route is a DM to <strong>@helpfulxhumans</strong> on Instagram or X — the team will walk you through it." },
    ],
    faqs: [
      ["How much does it cost to list my business?", "A basic listing is $5 per day. A featured listing costs more and appears higher in search results. Customers never pay to find or contact you."],
      ["How do I create a listing?", "Go to the join page on Helpful × Humans and follow the steps. If you'd like help, DM @helpfulxhumans on Instagram or X and the team will walk you through it."],
      ["Is my listing reviewed before it goes live?", "Yes. Every listing is reviewed before publishing to keep the marketplace genuine and free of spam and corporations."],
      ["Do I need a website to list?", "No. You can list without one, but Helpful × Humans can also build you a simple, mobile-friendly website and list you in search automatically."],
      ["Who can list — can big companies join?", "Helpful × Humans is built for real, independent people and small businesses. Big corporations are intentionally kept out."],
    ],
    related: ["free-website-when-you-list", "what-is-helpful-x-humans", "vs-other-search-engines"],
  },

  // 4 — SUPPORT LOCAL
  {
    slug: "support-independent-local-helpers",
    kind: "Perspective",
    title: "Skip the Big Marketplaces: Why Support Independent & Local Helpers",
    heading: "Skip the Big Marketplaces: Why Support Independent Helpers",
    dek: "Corporations buy the top slot. Real neighbors don't. Here's why that matters — and how to hire around it.",
    description:
      "Big marketplaces bury local helpers under corporate ads. Here's why hiring independent, local helpers is worth it — and how Helpful × Humans makes it easy.",
    read: "5 min read",
    body: [
      { type: "p", html: "Type almost any service into a big platform and you'll meet the same wall: sponsored ads up top, national chains next, and the actual local person you were looking for buried somewhere on page two. Helpful × Humans was built to skip that wall entirely. Here's why choosing <strong>independent and local helpers</strong> is worth doing on purpose — and how a human-first directory makes it easier." },
      { type: "h2", text: "Big marketplaces are crowded with big companies" },
      { type: "p", html: "Most marketplaces are packed with corporations and paid ads that bury the little guy. The ranking rewards ad spend, not craft. That means the neighbor with real skill and a fair price loses to whoever can afford the top slot. Helpful × Humans only lists real, independent people and small businesses — so what you find is genuinely local and human, and nobody buys their way over everyone else." },
      { type: "h2", text: "More of your money reaches the person doing the work" },
      { type: "p", html: "When you hire directly from an independent helper, there's no giant company taking a cut in the middle. On Helpful × Humans you contact and hire helpers directly, so the value of the job goes to the person actually doing it — not to a platform's margin." },
      { type: "quote", text: "The people who need work and the neighbors who can do it deserve to find each other without a corporation standing in between." },
      { type: "h2", text: "You get service that a chain can't match" },
      { type: "ul", items: [
        "<strong>A real relationship.</strong> You're talking to the person who'll do the work, not a call center.",
        "<strong>Flexibility.</strong> Independents can tailor the job in ways rigid corporate pricing can't.",
        "<strong>Accountability.</strong> Their name and reputation are on the line, personally.",
        "<strong>Local knowledge.</strong> Neighbors understand your area, your needs, and your context.",
      ]},
      CTA_FIND,
      { type: "h2", text: "Human review keeps it genuine" },
      { type: "p", html: "It's one thing to say \u201Cindependent only\u201D and another to enforce it. Every listing on Helpful × Humans is reviewed before it goes live, specifically to keep the marketplace free of corporations and spam. That's the mechanism behind the mission — it's why a search returns real people instead of a wall of ads." },
      { type: "h2", text: "Supporting local is a choice you can make every time" },
      { type: "p", html: "Every booking is a small vote for the kind of economy you want — one where independent people can be found on the strength of their work. If you're ready to put that into practice, <a href=\"/search\">search for a helper near you</a>. And if you <em>are</em> one of those independent helpers, <a href=\"/join\">list your business</a> so people looking for exactly what you do can find you." },
    ],
    faqs: [
      ["Why does Helpful × Humans exclude big corporations?", "Because the people who need work and the neighbors who can do it deserve to find each other without a giant company taking a cut in the middle. The platform is built to support real, independent people."],
      ["How is this different from other marketplaces?", "Most marketplaces are crowded with big companies and paid ads that bury the little guy. Helpful × Humans only lists real, independent people and small businesses, so results are genuinely local and human."],
      ["Does supporting local cost me more?", "Not necessarily. Because you hire independent helpers directly with no middleman taking a cut, more of what you pay goes to the person doing the work — and contacting helpers is free."],
    ],
    related: ["hire-a-local-independent-helper", "vs-other-search-engines", "what-is-helpful-x-humans"],
  },

  // 5 — COMPARISON
  {
    slug: "vs-other-search-engines",
    kind: "Comparison",
    title: "Helpful × Humans vs Google, Yelp & the Big Marketplaces: A Fair Comparison",
    heading: "Helpful × Humans vs Google, Yelp & the Big Marketplaces",
    dek: "An honest side-by-side: who shows up, who ranks, who takes a cut — and when to use which.",
    description:
      "How does Helpful × Humans compare to Google, Yelp, and big gig marketplaces for finding local help? An honest side-by-side on ads, fees, curation, and who shows up.",
    read: "7 min read",
    body: [
      { type: "p", html: "When you need to hire someone local, you probably start with Google, Yelp, or one of the big gig marketplaces. They're powerful — but they're built around ads, aggregation, and scale, which isn't the same as helping you find a real independent person. Here's an honest look at how <strong>Helpful × Humans compares to the search engines and platforms you already use.</strong>" },
      { type: "table",
        head: ["", "Helpful × Humans", "Google / Yelp", "Big gig marketplaces"],
        rows: [
          ["Who shows up", ["yes", "Independent helpers & small businesses only"], "Everyone — chains, corporations, ads", "Freelancers, but at platform scale"],
          ["Ranked by ad spend?", ["yes", "No"], ["no", "Often — sponsored slots on top"], ["no", "Frequently — promoted gigs"]],
          ["Cost to contact", ["yes", "Free"], ["yes", "Usually free"], "Often via platform / fees"],
          ["Takes a cut of the job", ["yes", "No — you hire directly"], "N/A (just a listing)", ["no", "Yes — commission per job"]],
          ["Listings human-reviewed", ["yes", "Yes, every one"], ["no", "No"], "Varies"],
          ["Corporations included", ["yes", "No, by design"], ["no", "Yes"], "Mostly individuals"],
          ["Cost for a business to list", ["yes", "$5/day flat"], "Free listing / paid ads", "Free to join, fees per job"],
        ],
      },
      { type: "note", html: "Platforms change their policies often — treat this as a general comparison and check each service's current terms." },
      { type: "h2", text: "Where the big search engines win" },
      { type: "p", html: "Let's be fair. Google has unmatched reach and instant answers. Yelp has a massive review corpus. The large marketplaces have built-in payments, dispute systems, and enormous supply. If you want the absolute widest net or a built-in escrow layer, those tools are strong at what they do." },
      { type: "h2", text: "Where Helpful × Humans is different" },
      { type: "h3", text: "1. It's a filter, not a firehose" },
      { type: "p", html: "Google shows you everything and makes you sort it. Helpful × Humans shows you only independent helpers and small businesses, reviewed before they're listed. You skip the corporate ads and the sorting." },
      { type: "h3", text: "2. No one buys their way to the top" },
      { type: "p", html: "On ad-driven platforms, the top results are frequently paid placements. Here, there are no corporations bidding for the top slot — helpers are found on the strength of their listing, not their budget." },
      { type: "h3", text: "3. You hire directly, with no cut taken" },
      { type: "p", html: "Many gig marketplaces sit in the middle of the transaction and take a commission. Helpful × Humans doesn't sit in your conversation and doesn't take a cut — the agreement is between you and the helper." },
      { type: "h3", text: "4. Every listing is human-reviewed" },
      { type: "p", html: "General search engines index whatever exists. Helpful × Humans reviews each listing before it goes live to keep out spam and corporations — a curation step the big engines don't do." },
      CTA_FIND,
      { type: "h2", text: "So which should you use?" },
      { type: "p", html: "They're not mutually exclusive. Use Google or Yelp when you want maximum reach or built-in reviews. Use a big marketplace when you specifically want platform-managed payments. Use <strong>Helpful × Humans when you specifically want a real, independent, local person</strong> — and you'd rather not scroll past a wall of ads and corporations to find them. If that's you, <a href=\"/search\">start a search</a>. And if you're an independent helper who keeps getting buried on the big platforms, <a href=\"/join\">list here</a> where the playing field is level." },
    ],
    faqs: [
      ["Is Helpful × Humans a replacement for Google?", "Not exactly. Google indexes everything; Helpful × Humans is a curated search engine that only lists independent helpers and small businesses, reviewed before going live. Many people use both."],
      ["Does Helpful × Humans take a commission like gig marketplaces?", "No. You contact and hire helpers directly, and the platform doesn't sit in the middle of the transaction or take a cut of the job."],
      ["Why do independent helpers get buried on big platforms?", "Big platforms often rank by ad spend, so corporations with large budgets win the top slots. Helpful × Humans has no corporations to outbid, so helpers rank on the strength of their listing."],
      ["Is it really free to contact helpers?", "Yes. Searching, browsing, and contacting helpers is free for customers. Helpers pay a flat $5/day to be listed."],
    ],
    related: ["support-independent-local-helpers", "hire-a-local-independent-helper", "list-your-business-get-found"],
  },

  // 6 — GET A WEBSITE (portfolio)
  {
    slug: "free-website-when-you-list",
    kind: "Get a website",
    title: "No Website? Get One Built Free When You List Your Business",
    heading: "No website? We'll build you one.",
    dek: "List your business on Helpful × Humans and get a clean, mobile-friendly website built for you — and listed in search automatically. See real sites we've built.",
    description:
      "List your business on Helpful × Humans and get a clean, mobile-friendly website built for you — and listed in search automatically. See real sites we've built for independent businesses.",
    read: "6 min read",
    hasPortfolio: true,
    body: [
      { type: "p", html: "Here's a hard truth for independent helpers: people will look you up before they hire you, and if there's nothing to find, you lose the job to someone who has a page. You shouldn't need to learn web design or hire an agency to fix that. <strong>Every helpful human deserves a home on the web</strong> — so when you list on Helpful × Humans, we'll build you one." },
      { type: "callout", title: "What you get", items: [
        "<strong>Designed for you</strong> — clean, mobile-friendly, and ready to share.",
        "<strong>Found in search</strong> — listed on Helpful × Humans automatically so clients can find you.",
        "<strong>Human help</strong> — we walk you through every step; no tech skills required.",
      ]},
      { type: "h2", text: "How it works" },
      { type: "ol", items: [
        "<strong>Tell us about your business.</strong> On the <a href=\"/build-my-site\">Build My Site</a> page, share your name, what you do, who you serve, and (optionally) your budget.",
        "<strong>We design your site.</strong> A simple, beautiful page that reflects your work — not a cookie-cutter template.",
        "<strong>You go live and get listed.</strong> Your site launches and you're added to Helpful × Humans search so people looking for what you do can find you.",
      ]},
      { type: "h2", text: "Websites we've actually built" },
      { type: "p", html: "These aren't mockups. Each of these is a real, live site built for an independent business — across totally different industries, each with its own personality. Tap any one to visit it." },
      { type: "portfolio" },
      { type: "h2", text: "What these have in common" },
      { type: "p", html: "Look across a basketball program, a chemical-and-freight operator, an astrologer, a hairstylist, a mobile spa, and a pet hotel and you'll notice the thread: each site is <strong>built around that specific business's world</strong> — its language, its customers, its vibe — not stamped from the same template. That's the point. A site should look like <em>you</em>, load fast on a phone, and make it obvious how to book or get in touch." },
      { type: "h3", text: "Range of what's possible" },
      { type: "ul", items: [
        "<strong>Booking-first sites</strong> like Mila Pet Hotel and Astrology Serene, with instant request forms and live pricing estimates.",
        "<strong>Portfolio-led sites</strong> like Vibes n Volume, where the work itself does the selling.",
        "<strong>Credibility-first sites</strong> like RJR Worldwide, built to make a serious operation feel serious.",
        "<strong>Conversion-focused landing pages</strong> like Hydra Mobile Spa and All Work All Gain, built to turn a visitor into a booking.",
      ]},
      CTA_SITE,
      { type: "h2", text: "Do I need a website to list?" },
      { type: "p", html: "No — you can list on Helpful × Humans without one. But a website gives the people who find you a place to learn more, see your work, and reach out, which turns more searches into actual jobs. If you already have a site, great; link it on your <a href=\"/join\">listing</a>. If you don't, we'll build one." },
      { type: "h2", text: "Ready to get found?" },
      { type: "p", html: "Start with <a href=\"/build-my-site\">Build My Site</a>, or if you'd rather talk it through first, DM <strong>@helpfulxhumans</strong> on Instagram or X and we'll help you figure out the right setup." },
    ],
    faqs: [
      ["Is the website really free?", "Helpful × Humans will build you a simple, mobile-friendly website and list you in search. Start on the Build My Site page — you can share your budget, and the team will walk you through the options for your business."],
      ["Do I need any technical skills?", "No. You tell us about your business and we handle the build, walking you through each step. No design or coding knowledge required."],
      ["Will my site show up in search?", "Yes. Your site launches and you're listed on Helpful × Humans automatically, so people searching for what you do can find you."],
      ["Can I see examples of sites you've built?", "Yes — real live examples include All Work All Gain, RJR Worldwide, Astrology Serene, Vibes n Volume, Hydra Mobile Spa, and Mila Pet Hotel, spanning very different industries."],
      ["Do I have to list to get a website?", "Getting a website and getting listed go hand in hand — your site launches and you're added to search at the same time so clients can find you."],
    ],
    related: ["list-your-business-get-found", "what-is-helpful-x-humans", "support-independent-local-helpers"],
  },

  // 7 — CATEGORIES
  {
    slug: "find-local-helpers-by-category",
    kind: "Categories",
    title: "Find a Local Handyman, Tutor, Groomer or Photographer Near You",
    heading: "Find a Local Handyman, Tutor, Groomer or Photographer Near You",
    dek: "The services people search most — and how to find a real, independent pro for each.",
    description:
      "Search independent, local helpers by category on Helpful × Humans — handymen, tutors, groomers, photographers and more. Real people, free to contact, no corporations.",
    read: "5 min read",
    body: [
      { type: "p", html: "Some kinds of help you search for the same way every time: a handyman for the leaky faucet, a tutor before finals, a photographer for the event, a groomer for the dog. Helpful × Humans is built to return a <strong>real, independent person</strong> for exactly these — not a wall of corporate ads. Here's how to find the right local pro by category." },
      { type: "h2", text: "Popular categories people search" },
      { type: "ul", items: [
        "<strong>Home &amp; repair</strong> — handyman, cleaner, mover, painter, yard work.",
        "<strong>Learning</strong> — tutors, music lessons, test prep, coaching.",
        "<strong>Beauty &amp; wellness</strong> — hairstylists, mobile spa, massage, nails.",
        "<strong>Creative</strong> — photographers, videographers, designers, writers.",
        "<strong>Pets</strong> — grooming, boarding, walking, sitting.",
        "<strong>Business help</strong> — bookkeeping, virtual assistants, social media, web.",
      ]},
      { type: "h2", text: "How to search a category well" },
      { type: "p", html: "On the <a href=\"/search\">search page</a>, start broad (the category) then add a detail that narrows it to your real need — the specialty, the format (virtual or in person), or your area. Because only independent helpers are listed, every result is a real person you can contact directly and for free." },
      CTA_FIND,
      { type: "h2", text: "What to check before you book" },
      { type: "p", html: "Read the listing for scope, location, and reviews; confirm pricing and availability directly with the helper; and use your own judgment, since you're hiring them directly. For a full walkthrough, see <a href=\"/blog/hire-a-local-independent-helper\">how to hire a local independent helper</a>." },
      { type: "h2", text: "Offer one of these services?" },
      { type: "p", html: "If you're the handyman, tutor, groomer, or photographer people are searching for, <a href=\"/join\">list your business</a> so you show up in the right category — and if you don't have a site yet, <a href=\"/build-my-site\">we'll build you one</a>." },
    ],
    faqs: [
      ["What kinds of helpers can I find?", "Independent helpers across home and repair, tutoring and lessons, beauty and wellness, creative work, pet care, and small-business help — all real people and small businesses, not corporations."],
      ["Is it free to search by category?", "Yes. Searching, browsing, and contacting helpers is free for customers on Helpful × Humans."],
      ["How do I narrow down a broad category?", "Start with the category, then add a detail like the specialty, whether you want virtual or in-person help, or your area, to get to the right person faster."],
    ],
    related: ["hire-a-local-independent-helper", "vs-other-search-engines", "what-is-helpful-x-humans"],
  },

  // 8 — $5 vs ADS
  {
    slug: "5-dollar-listing-vs-ads",
    kind: "For helpers",
    title: "$5/Day Listing vs Google & Facebook Ads: What's Better for Small Businesses?",
    heading: "$5/Day Listing vs Google & Facebook Ads",
    dek: "A flat $5/day versus an unpredictable ad auction — which actually gets a small business found?",
    description:
      "Should independent helpers run Google/Facebook ads or list on Helpful × Humans for $5/day? A clear comparison of cost, competition, and intent for small businesses.",
    read: "5 min read",
    body: [
      { type: "p", html: "If you're an independent helper deciding where to spend your first marketing dollars, the honest question is: what gets you in front of people ready to hire, without gambling your budget? Here's how a <strong>$5/day Helpful × Humans listing</strong> compares to running Google or Facebook ads." },
      { type: "h2", text: "The problem with ad auctions for small operators" },
      { type: "p", html: "Google and Facebook ads run on auctions. You bid against everyone else — including corporations with budgets you can't match — and costs rise as competition does. You can spend real money before you learn what works, and the moment you stop paying, you disappear. It's powerful at scale, but punishing when you're one person." },
      { type: "h2", text: "What $5/day gets you here" },
      { type: "ul", items: [
        "<strong>A flat, predictable cost.</strong> No auction, no surprise spend — $5 a day for a basic listing.",
        "<strong>No corporations to outbid.</strong> Only independent helpers are listed, so you're not competing with national ad budgets.",
        "<strong>Intent-matched visibility.</strong> People on Helpful × Humans are actively searching to hire, not idly scrolling.",
        "<strong>Free contact for customers.</strong> Nothing stands between an interested person and reaching out to you.",
      ]},
      { type: "table",
        head: ["", "HxH listing", "Google / Facebook ads"],
        rows: [
          ["Pricing model", ["yes", "Flat $5/day"], "Auction — variable"],
          ["Compete with corporations?", ["yes", "No"], ["no", "Yes"]],
          ["Predictable cost", ["yes", "Yes"], ["no", "Not really"]],
          ["Audience intent", ["yes", "Actively hiring"], "Mixed"],
          ["Setup complexity", ["yes", "Low"], "Higher"],
        ],
      },
      { type: "note", html: "Ad platforms are strong for reach and targeting — this isn't \u201Cnever run ads,\u201D it's \u201Chere's a simpler, cheaper starting point.\u201D" },
      CTA_JOIN,
      { type: "h2", text: "When ads still make sense" },
      { type: "p", html: "If you already have a converting website, a clear offer, and time to manage campaigns, paid ads can scale reach fast. Many helpers do both: a steady $5/day listing for baseline discovery, plus ads for a seasonal push. Want the ad side to convert? Make sure you have a site first — <a href=\"/build-my-site\">we'll build you one</a>." },
      { type: "h2", text: "The takeaway" },
      { type: "p", html: "For most independent helpers just getting found, a predictable $5/day beats an unpredictable auction. <a href=\"/join\">List your business</a> and see what a level playing field feels like." },
    ],
    faqs: [
      ["How much is a Helpful × Humans listing?", "A basic listing is a flat $5 per day. A featured listing costs more and ranks higher. Customers never pay to contact you."],
      ["Is a listing better than Google or Facebook ads?", "For many small operators, a flat $5/day is more predictable than an ad auction where you compete against corporate budgets. Ads can still be worth it for scale, and many helpers use both."],
      ["Do I compete with big companies here?", "No. Helpful × Humans only lists independent helpers and small businesses, so there are no corporations bidding against you."],
    ],
    related: ["list-your-business-get-found", "free-website-when-you-list", "vs-other-search-engines"],
  },

  // 9 — HUMAN REVIEW
  {
    slug: "how-human-review-keeps-it-genuine",
    kind: "Trust & safety",
    title: "How Human Review Keeps Helpful × Humans Free of Spam & Corporations",
    heading: "How Human Review Keeps Helpful × Humans Genuine",
    dek: "Every listing is checked by a human before it's live. Here's what that actually screens for.",
    description:
      "Every listing on Helpful × Humans is reviewed by a person before going live. Here's what that human review checks, why it exists, and what it means for hiring and listing.",
    read: "4 min read",
    body: [
      { type: "p", html: "Anybody can <em>say</em> their marketplace is \u201Cjust real people.\u201D Helpful × Humans actually enforces it — every single listing is reviewed by a human before it goes live. Here's what that review is, why it exists, and what it means for you whether you're hiring or listing." },
      { type: "h2", text: "What \u201Chuman-reviewed\u201D actually means" },
      { type: "p", html: "Before a listing appears in search, a person checks it — to confirm it's a genuine, independent helper or small business and not spam, a scam, or a corporation slipping through. Only then does it go live. That single step is the backbone of the whole promise that a search here returns real, local, human results." },
      { type: "h2", text: "Why bother? Because the alternative is what you already hate" },
      { type: "p", html: "Open-index platforms let anything appear and make you sort the junk. That's how you end up scrolling past ads, fake listings, and national chains to find one real person. By reviewing every listing, Helpful × Humans keeps the marketplace genuine and free of corporations and spam — so the results are worth trusting." },
      { type: "callout", title: "What review does — and doesn't — do", items: [
        "<strong>Does:</strong> keep out spam, scams, and corporations; keep listings genuine.",
        "<strong>Doesn't:</strong> guarantee an outcome on any job — you still hire directly and should use your judgment.",
      ]},
      { type: "h2", text: "What it means if you're hiring" },
      { type: "p", html: "You're not the spam filter — the review already screened obvious junk. But since you contact and hire helpers directly, the final call is yours: check reviews, ask questions, confirm details. See <a href=\"/blog/hire-a-local-independent-helper\">the hiring guide</a> for exactly what to ask." },
      CTA_FIND,
      { type: "h2", text: "What it means if you're listing" },
      { type: "p", html: "Review is why your listing carries weight. When a customer sees you here, part of what they trust is that a human confirmed you're real and independent. Write a clear, honest listing and it sails through — vague or spammy ones are what the review is for. Ready? <a href=\"/join\">List your business.</a>" },
      { type: "h2", text: "Spotted something off?" },
      { type: "p", html: "Review happens up front, but nothing's perfect. If a listing is misleading or breaks the guidelines, report it by DM to <strong>@helpfulxhumans</strong> on Instagram or X and the team will look into it quickly." },
    ],
    faqs: [
      ["Are listings really reviewed by a person?", "Yes. Every listing is reviewed before it goes live to keep the marketplace genuine and free of spam and corporations."],
      ["Does review mean helpers are guaranteed or vetted for quality?", "Review confirms a listing is genuine and independent, not spam or a corporation. It doesn't guarantee any job outcome — you hire directly, so still check reviews and confirm details."],
      ["How do I report a bad listing?", "DM @helpfulxhumans on Instagram or X with the details and the team will review it quickly."],
    ],
    related: ["what-is-helpful-x-humans", "hire-a-local-independent-helper", "support-independent-local-helpers"],
  },
];

export const getPost = (slug) => POSTS.find((p) => p.slug === slug);
export const allSlugs = () => POSTS.map((p) => p.slug);
