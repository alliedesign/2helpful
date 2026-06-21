# Deploying HelpfulxHuman to Netlify

This puts your site on a real public URL (https), which also fixes the
"Use my location" GPS feature (it needs https) and ends the download/unzip cycle.

## Before you start
- Run ALL the SQL update packs in Supabase first (1 through 7), so the live
  database has every table and column. The site will error otherwise.
- Have your real keys ready (Supabase + Authorize.Net).

## Option A — Deploy from a GitHub repo (recommended, gives auto-updates)
1. Put this project in a GitHub repo (if you haven't):
   - On github.com, create a new empty repository.
   - In your project folder, run the commands GitHub shows under
     "…or push an existing repository from the command line".
2. On app.netlify.com → "Add new site" → "Import an existing project" → GitHub →
   pick your repo.
3. Netlify auto-detects Next.js. Leave the build command as `npm run build`.
4. BEFORE the first deploy, add your environment variables (next section).
5. Click Deploy. First build takes a few minutes.

## Option B — Drag-and-drop (quick test, no auto-updates)
Netlify's drag-and-drop does NOT run a build, so it won't work for this app
(it has server API routes). Use Option A.

## Environment variables (REQUIRED)
On your Netlify site → Site configuration → Environment variables → add each of
these (same values as your .env.local). NOTE: For going live with real cards,
set the two ENV values to `live` and use your LIVE Authorize.Net keys.

  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ADMIN_SECRET
  AUTHORIZENET_ENV                      (sandbox or live)
  AUTHORIZENET_API_LOGIN_ID
  AUTHORIZENET_TRANSACTION_KEY
  NEXT_PUBLIC_AUTHORIZENET_ENV          (sandbox or live)
  NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID
  NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY

After adding/changing env vars, trigger a redeploy (Deploys → Trigger deploy →
Deploy site) so they take effect.

## After it's live
- Visit your-site.netlify.app and test search, a listing, and a sandbox payment.
- In Supabase → Authentication → URL configuration, add your Netlify URL so
  email/password auth redirects work on the live domain.
- When ready for real payments: switch both AUTHORIZENET_ENV values to `live`,
  paste your LIVE keys, redeploy, and do ONE small real charge to confirm before
  announcing the site.
