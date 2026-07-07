// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// During a production build (e.g. on Netlify), client pages can be evaluated
// before runtime env vars are injected. Fall back to harmless placeholders so
// createClient() doesn't throw at build time; real values are used in the browser.
const BUILD_FALLBACK_URL = "https://placeholder.supabase.co";
const BUILD_FALLBACK_KEY = "placeholder-anon-key";

// Public (browser-safe) client — uses the anon key, respects RLS.
export function browserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || BUILD_FALLBACK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || BUILD_FALLBACK_KEY
  );
}

// Server-only client — uses the SERVICE ROLE key, bypasses RLS.
// ONLY import this in API routes / server code. NEVER ship it to the browser.
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || BUILD_FALLBACK_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || BUILD_FALLBACK_KEY,
    { auth: { persistSession: false } }
  );
}
