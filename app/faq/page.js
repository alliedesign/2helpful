// app/faq/page.js
// Frequently asked questions. Accordion style, matches the site theme.
"use client";
import { useState } from "react";

const FAQS = [
  {
    group: "Using Helpful × Humans",
    items: [
      {
        q: "What is Helpful × Humans?",
        a: "Helpful × Humans is a search engine for independent helpers — real people and mom-and-pop shops who can help with everything from home repairs to haircuts to tutoring. No big corporations, just neighbors with skills.",
      },
      {
        q: "Do I need an account to search for helpers?",
        a: "No. You can search, browse categories, and contact any helper without signing up. An account is only needed if you want to leave a review and rating.",
      },
      {
        q: "How do I find a helper near me?",
        a: "Use the search bar on the homepage to describe what you need — like “fix a leaky sink” or “someone to talk to” — or browse by category. Results show independent helpers who match, with the ones nearest you and most relevant first.",
      },
      {
        q: "How do I contact a helper?",
        a: "Open any listing and use the contact details or website link the helper has provided. You reach out to them directly — Helpful × Humans doesn't sit in the middle of your conversation.",
      },
      {
        q: "Does it cost anything to search or contact helpers?",
        a: "No. Searching, browsing, and contacting helpers is completely free for customers. Helpers pay to be listed; you never pay to find them.",
      },
      {
        q: "What does “independent helper” mean?",
        a: "It means a real, independent person or small business — not a franchise, chain, or large corporation. Our whole point is connecting you with local, independent talent.",
      },
      {
        q: "What areas do you cover?",
        a: "Helpers set their own service area. Many are local to a specific city or region, while some offer virtual services nationwide. Each listing shows whether the helper works in person, virtually, or both.",
      },
      {
        q: "What's the difference between “in person,” “virtual,” and “both”?",
        a: "In person means the helper comes to you or you go to them. Virtual means they help remotely — over video, phone, or online. Both means they offer either option depending on what you need.",
      },
    ],
  },
  {
    group: "Listing your business",
    items: [
      {
        q: "How do I list my business?",
        a: "Head to the “List your business” page (/join) to get started. If you'd like help setting up, the fastest way is to DM us on Instagram (@helpfulxhumans) or X (@helpfulxhumans) and we'll walk you through it.",
      },
      {
        q: "How much does a listing cost?",
        a: "A basic listing is $5 per day. A featured listing — which gets premium placement — is $20 per day. You only pay for the days you want to be live.",
      },
      {
        q: "What's the difference between a basic and a featured listing?",
        a: "A basic listing ($5/day) appears in search results and category browsing like any other helper. A featured listing ($20/day) gets premium placement — it shows up on the homepage and rises to the top of relevant results, so more people see it.",
      },
      {
        q: "How long does my listing stay live?",
        a: "For as long as you've paid for. Listings are priced by the day, so you control how long you stay active — a few days, a month, or ongoing.",
      },
      {
        q: "Can I edit my listing after it's live?",
        a: "Yes. You can update your business name, description, categories, photos, and contact details at any time. If you need a hand, DM us on Instagram or X.",
      },
      {
        q: "Can I add photos to my listing?",
        a: "Absolutely — and you should. Listings with a clear profile photo and banner image get far more attention. You can add a profile picture and a banner to make your listing stand out.",
      },
      {
        q: "What makes a good listing?",
        a: "A clear business name, a description that says exactly what you do and who you help, a professional profile photo, and — if it fits your work — before/after or proof-of-work photos. Specific beats generic every time.",
      },
      {
        q: "What categories can I list under?",
        a: "There are 21 categories spanning home services, skilled trades, beauty, health, tutoring, creative work, and more. You can choose the categories that best describe what you offer so the right customers find you.",
      },
      {
        q: "Can I offer services nationwide?",
        a: "Yes. If you work virtually or ship your service anywhere, you can mark your listing as nationwide so you show up for customers across the country, not just locally.",
      },
      {
        q: "How do I get more visibility for my listing?",
        a: "Upgrade to a featured listing ($20/day) for homepage placement and top search ranking, keep your photos and description sharp, and make sure your categories are accurate. The clearer and more complete your listing, the better it performs.",
      },
    ],
  },
  {
    group: "Payments & billing",
    items: [
      {
        q: "How do I pay for a listing?",
        a: "Listings are billed by the day — $5/day basic, $20/day featured. To get set up, start at the “List your business” page or DM us on Instagram or X and we'll get you live.",
      },
      {
        q: "Can I switch from basic to featured later?",
        a: "Yes. You can upgrade a basic listing to featured at any time to get homepage placement and higher ranking. Reach out and we'll switch it over.",
      },
      {
        q: "Do you offer refunds?",
        a: "Because listings are billed by the day, you only ever pay for the days you choose to run. If something's wrong with your listing, DM us on Instagram or X and we'll make it right.",
      },
      {
        q: "Will my listing renew automatically?",
        a: "You control how long your listing runs. If you'd like to extend or pause it, just let us know — we'll never surprise you with charges you didn't choose.",
      },
    ],
  },
  {
    group: "Reviews & accounts",
    items: [
      {
        q: "Do I need an account for anything?",
        a: "Only to leave a review and rating for a helper. Everything else — searching, browsing, contacting — works without one.",
      },
      {
        q: "How do I leave a review?",
        a: "Create a free account, then open the listing you want to review and leave a star rating and comment. Reviews help other customers find great independent helpers.",
      },
      {
        q: "Why do reviews require an account?",
        a: "Requiring an account keeps reviews honest — it ties each review to a real person, which prevents spam and fake ratings and makes the reviews you read more trustworthy.",
      },
      {
        q: "Can a business remove a bad review?",
        a: "Businesses can't delete honest reviews. If a review breaks our guidelines — for example, it's spam or abusive — you can report it and we'll take a look.",
      },
    ],
  },
  {
    group: "Trust & safety",
    items: [
      {
        q: "Are helpers verified or vetted?",
        a: "Every listing is reviewed before it goes live to keep the marketplace genuine and free of corporations and spam. That said, always use your own judgment when hiring — check reviews, ask questions, and confirm details directly with the helper.",
      },
      {
        q: "Why no big corporations?",
        a: "Because the people who need work and the neighbors who can do it deserve to find each other without a giant company taking a cut in the middle. Helpful × Humans is built to support real, independent people.",
      },
      {
        q: "How do you handle disputes between customers and helpers?",
        a: "Since you contact and hire helpers directly, any agreement is between you and them. If a listing itself is misleading or breaks our guidelines, report it and we'll review it.",
      },
      {
        q: "How do I report a listing or a problem?",
        a: "DM us on Instagram (@helpfulxhumans) or X (@helpfulxhumans) with the details and we'll look into it quickly.",
      },
      {
        q: "Is my personal information safe?",
        a: "We only collect what we need — like your email if you subscribe or create an account — and we don't sell your information. You share your contact details with helpers directly, on your own terms.",
      },
    ],
  },
  {
    group: "Newsletter & technical",
    items: [
      {
        q: "What is the email newsletter?",
        a: "It's an optional way to get updates on new independent helpers and tips for finding great local talent. Subscribing is free, and we only send the good stuff — no spam.",
      },
      {
        q: "How do I unsubscribe from emails?",
        a: "Every email includes an unsubscribe link. Click it and you're off the list — no hard feelings.",
      },
      {
        q: "Does the site work on mobile?",
        a: "Yes. Helpful × Humans is built to work on phones, tablets, and computers, so you can search for help wherever you are.",
      },
      {
        q: "Which browsers are supported?",
        a: "The site works on all modern browsers — Chrome, Safari, Firefox, Edge, and more. For the best experience, keep your browser up to date.",
      },
    ],
  },
  {
    group: "About us",
    items: [
      {
        q: "Who's behind Helpful × Humans?",
        a: "We're a small, independent team that believes local, independent helpers deserve a place to be found — without competing against faceless corporations for attention.",
      },
      {
        q: "How is this different from other marketplaces?",
        a: "Most marketplaces are crowded with big companies and paid ads that bury the little guy. We only list real, independent people and small businesses, so what you find is genuinely local and human.",
      },
      {
        q: "How can I get in touch?",
        a: "The best way to reach us is by DM on Instagram (@helpfulxhumans) or X (@helpfulxhumans). We're friendly and we actually reply.",
      },
    ],
  },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-chev" style={{ transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

export default function FAQPage() {
  const total = FAQS.reduce((n, g) => n + g.items.length, 0);
  return (
    <main className="wrap" style={{ paddingTop: "3rem", paddingBottom: "5rem", maxWidth: 820 }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .faq-head h1{font-size:clamp(2rem,5vw,2.8rem);font-weight:800;letter-spacing:-.02em;margin:0 0 .5rem}
        .faq-head p{color:var(--muted);margin:0 0 2.5rem;font-size:1.05rem}
        .faq-group{margin-bottom:2.6rem}
        .faq-group h2{font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
          color:var(--teal-deep);margin:0 0 1rem}
        .faq-item{border-bottom:1px solid var(--line)}
        .faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;
          background:none;border:none;cursor:pointer;text-align:left;
          padding:1.1rem 0;font-size:1.05rem;font-weight:600;color:var(--ink);line-height:1.4}
        .faq-q:hover{color:var(--teal-deep)}
        .faq-chev{color:var(--muted);font-size:1.2rem;transition:transform .2s;flex:0 0 auto}
        .faq-a{padding:0 0 1.2rem;color:var(--muted);line-height:1.65;font-size:1rem;max-width:68ch}
        .faq-contact{margin-top:1rem;padding:1.6rem;border-radius:14px;background:var(--silver-bg);
          border:1px solid var(--line);text-align:center}
        .faq-contact p{margin:0;color:var(--ink)}
        .faq-contact a{color:var(--teal-deep);font-weight:700}
      `,
        }}
      />

      <div className="faq-head">
        <h1>Frequently asked questions</h1>
        <p>Everything you need to know about finding help and getting listed. {total} answers below.</p>
      </div>

      {FAQS.map((group) => (
        <section className="faq-group" key={group.group}>
          <h2>{group.group}</h2>
          {group.items.map((it) => (
            <Item key={it.q} q={it.q} a={it.a} />
          ))}
        </section>
      ))}

      <div className="faq-contact">
        <p>
          Still have a question? DM us on{" "}
          <a href="https://www.instagram.com/helpfulxhumans" target="_blank" rel="noopener noreferrer">Instagram</a>{" "}
          or{" "}
          <a href="https://x.com/helpfulxhumans" target="_blank" rel="noopener noreferrer">X</a> — we actually reply.
        </p>
      </div>
    </main>
  );
}
