# Helpful x Human — backend starter

A working search engine for **independent contractors and mom-and-pop shops**.
Clients search for what they need, matching helpers' own websites come up
Google-style, and the client clicks through. **No major corporations** — listings
are auto-flagged and a human approves the borderline ones.

Stack: **Next.js** (frontend + API) + **Supabase** (Postgres database + email login).

---

## What's inside

```
supabase/schema.sql      The database: tables, search index, security rules, search function
supabase/seed.sql        Sample independent helpers so search works on day one
lib/corpCheck.js         Auto-flagging: scores how likely a listing is a big corporation
lib/supabase.js          Database clients (browser + server)
app/page.js              Home: the big Google-style search box
app/search/page.js       Search results + click-through tracking + virtual/in-person filter
app/join/page.js         Helper login (email link) + "list your business" form
app/dashboard/page.js    Helper sees their own listings and approval status
app/admin/page.js        YOUR review queue: approve small businesses, reject corporations
app/api/*                The backend endpoints these pages call
```

---

## How the "no corporations" rule works (auto-flag, then you review)

1. A helper submits their business + website on **/join**.
2. `lib/corpCheck.js` scores it:
   - Known big-brand domain (homedepot.com, amazon.com, aggregators like Yelp/Thumbtack…) → big score, blocked.
   - Corporate language on their site ("nationwide locations", "investor relations", "franchise opportunities") → score up.
   - Small-business signals ("family owned", "locally owned", "independent") → score down.
   - Didn't check the "I'm independent" box, or site won't load → mild flag.
3. **Clean + attested → goes live instantly.** Anything else → **review queue**.
4. You open **/admin**, see the queue sorted *most-suspicious first*, and approve or reject.

Extend the lists in `lib/corpCheck.js` any time — they're plain arrays.

---

## Run it locally

**1. Create a Supabase project** (free) at supabase.com → New project.

**2. Create the database.** In Supabase → SQL Editor → New query:
   - paste all of `supabase/schema.sql`, Run.
   - paste all of `supabase/seed.sql`, Run. (gives you 5 sample helpers to search)

**3. Get your keys.** Supabase → Project Settings → API. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (secret!)

**4. Configure env.** Copy the template and fill it in:
   ```bash
   cp .env.local.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and make up an `ADMIN_SECRET`.

**5. Install + run.**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000

**6. Try it.**
   - Search "tech help" or "errands" or "trip" → sample helpers appear, click one.
   - Go to **/join**, sign in with your email (Supabase emails you a link),
     submit a listing. Try a clean one (auto-approves) and a fake corporate one
     (e.g. website `homedepot.com`, description "nationwide locations") → it lands in review.
   - Go to **/admin**, enter your `ADMIN_SECRET`, approve/reject the queue.

> Email links in local dev: Supabase sends real emails on the free tier. If you
> don't receive one, check Supabase → Authentication → Users to confirm, or use
> the magic-link shown in Supabase logs.

---

## Deploy (Netlify — you already have it connected)

1. Push this folder to a GitHub repo.
2. In Netlify → Add new site → Import from GitHub → pick the repo.
3. Build command `npm run build`, publish handled by the Next.js plugin
   (Netlify auto-detects Next.js; if prompted, install "@netlify/plugin-nextjs").
4. Netlify → Site settings → Environment variables: add the same four variables
   from your `.env.local`.
5. Deploy. Your search engine is live.

(Vercel works identically and is the most zero-config option for Next.js if you
prefer it: import the repo, paste the env vars, deploy.)

---

## Connecting your existing design

Your earlier `helpfulxhuman.html` is the **marketing/marketplace front**. This
project is the **functional engine**. Two ways to merge them:

- **Quick:** keep the static site as your landing page; link its search box to
  this app's `/search?q=...`. Lowest effort.
- **Full:** port the static site's look into these React pages (the colors and
  fonts already match — same teal/silver/black tokens are in `app/layout.js`).

---

## What to build next

- **Bookings + payments:** add Stripe Connect so helpers get paid directly and
  keep their own rates (you already designed the rate model). The `bookings`
  table is ready and powers the leaderboard view.
- **Semantic search:** when keyword search isn't enough ("my drain is clogged"
  → "plumber"), add `pgvector` embeddings in Supabase and match by meaning.
- **Real admin auth:** replace the `ADMIN_SECRET` header with an `is_admin`
  flag on the helper/user and check the session (noted in `app/api/admin/queue/route.js`).
- **Maps + distance:** the schema already stores lat/lng and the search ranks by
  distance; pass the client's location into `/api/search` to switch it on.
```
