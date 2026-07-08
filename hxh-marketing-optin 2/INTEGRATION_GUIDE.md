# Marketing opt-in (email + SMS) — integration guide

This adds an **explicit, unchecked** opt-in for email and SMS marketing/updates to three
touchpoints on helpfulxhumans.com: the **subscribe popup/footer**, **account signup**
(the `/join` page), and **leaving a review**.

Consent model: both boxes start **unchecked** — users actively tick to consent. This is
the compliant choice for SMS (TCPA) and email (GDPR/CAN-SPAM). Every opt-in is written to
an append-only `marketing_consent_log` audit table so you can prove *who* consented, *when*,
*how*, and to *what exact wording*.

---

## 1. Database — already done ✅

A migration named `add_marketing_optin_and_consent_log` has been applied to the **HelpfulxHumans**
Supabase project. It added:

- `subscribers`: `name`, `phone`, `email_opt_in` (default true), `sms_opt_in` (default false), `consent_source`, `consent_at`
- `helpers`: `phone`, `email_opt_in`, `sms_opt_in`, `marketing_consent_at`
- `listing_reviews` & `reviews`: `email`, `phone`, `email_opt_in`, `sms_opt_in`, `marketing_consent_at`
- **`marketing_consent_log`** (new): append-only audit trail. RLS is ON with **no public policies**,
  so only your server-side (service-role) code can read/write it.

You don't need to run any SQL yourself.

---

## 2. Files to add / replace

Copy these into your source repo (paths are relative to your project root):

| File | Action |
|------|--------|
| `lib/marketing.js` | **new** — shared `recordConsent()` helper (server-side) |
| `app/api/marketing-consent/route.js` | **new** — endpoint used by signup + review forms |
| `app/api/subscribe/route.js` | **replace** your existing one |
| `app/components/MarketingOptIn.js` | **new** — reusable checkbox block |
| `app/components/SubscribePopup.js` | update the `SubscribeForm` export using `SubscribeForm.updated.js` |

All of these assume your existing `@/lib/supabase` module exports `serviceClient()`
(your current `subscribe/route.js` already imports it).

---

## 3. Signup (the `/join` page)

Your join page signs the user up (`supabase.auth.signUp`) and inserts a row into `helpers`.
Add the opt-in there.

**a) Add state + the component** near your other form state:

```jsx
import MarketingOptIn, { EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/app/components/MarketingOptIn";

const [optIn, setOptIn] = useState({ emailOptIn: false, smsOptIn: false, phone: "" });
```

Render it just above your "Create account" button:

```jsx
<MarketingOptIn value={optIn} onChange={setOptIn} />
```

**b) Save the flags on the `helpers` row** — add these keys to your existing
`.from("helpers").insert({ ... })` object:

```jsx
email_opt_in: optIn.emailOptIn,
sms_opt_in: optIn.smsOptIn,
phone: optIn.phone || null,                 // marketing phone (optional)
marketing_consent_at: (optIn.emailOptIn || optIn.smsOptIn) ? new Date().toISOString() : null,
```

**c) Write the audit log + add them to the marketing list** — after the account is created
(you have the new `user_id` and the `email` the user typed):

```jsx
if (optIn.emailOptIn || optIn.smsOptIn) {
  await fetch("/api/marketing-consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,                                  // the signup email
      phone: optIn.phone,
      name: businessName,                     // or the user's name field
      userId: newUserId,                      // from the signUp result, if available
      emailOptIn: optIn.emailOptIn,
      smsOptIn: optIn.smsOptIn,
      source: "signup",
      consentText: [
        optIn.emailOptIn ? EMAIL_CONSENT_TEXT : null,
        optIn.smsOptIn ? SMS_CONSENT_TEXT : null,
      ].filter(Boolean).join(" | "),
    }),
  });
}
```

---

## 4. Review form (listing page)

Your review form currently collects a star rating + text and inserts into `listing_reviews`.
To let a reviewer opt in you need to capture an email (and a phone if they want SMS).

**a) Add state:**

```jsx
import MarketingOptIn, { EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/app/components/MarketingOptIn";

const [reviewEmail, setReviewEmail] = useState("");
const [optIn, setOptIn] = useState({ emailOptIn: false, smsOptIn: false, phone: "" });
```

**b) Add an email field + the opt-in block** to the form (above the submit button):

```jsx
<input
  type="email"
  value={reviewEmail}
  onChange={(e) => setReviewEmail(e.target.value)}
  placeholder="you@email.com (optional)"
  style={{ padding: ".7rem 1rem", border: "1px solid var(--silver)", borderRadius: 12, outline: "none" }}
/>
<MarketingOptIn value={optIn} onChange={setOptIn} />
```

**c) Save flags on the review** — add to your `.from("listing_reviews").insert({ ... })`:

```jsx
email: reviewEmail || null,
phone: optIn.phone || null,
email_opt_in: optIn.emailOptIn,
sms_opt_in: optIn.smsOptIn,
marketing_consent_at: (optIn.emailOptIn || optIn.smsOptIn) ? new Date().toISOString() : null,
```

**d) Audit log + marketing list** — after the review is saved:

```jsx
if (optIn.emailOptIn || optIn.smsOptIn) {
  await fetch("/api/marketing-consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: reviewEmail,
      phone: optIn.phone,
      name: authorName,                       // your existing reviewer name field
      emailOptIn: optIn.emailOptIn,
      smsOptIn: optIn.smsOptIn,
      source: "review",
      consentText: [
        optIn.emailOptIn ? EMAIL_CONSENT_TEXT : null,
        optIn.smsOptIn ? SMS_CONSENT_TEXT : null,
      ].filter(Boolean).join(" | "),
    }),
  });
}
```

---

## 5. Where your marketing lists live

- **Everyone who opted in** → `subscribers` table (`email_opt_in`, `sms_opt_in`, `phone`).
  Pull email marketing recipients with `email_opt_in = true`; SMS recipients with
  `sms_opt_in = true and phone is not null`.
- **Proof of consent** → `marketing_consent_log` (never edit/delete rows; it's your legal record).

Example queries:

```sql
-- Email marketing audience
select email, name from subscribers where email_opt_in = true and email is not null;

-- SMS marketing audience
select phone, name from subscribers where sms_opt_in = true and phone is not null;
```

---

## 6. Compliance notes (important for SMS)

- Keep the boxes **unchecked** everywhere except the dedicated Subscribe form (where clicking
  "Subscribe" is itself the email opt-in). This is intentional and compliant.
- **SMS (TCPA):** you must honor **STOP/HELP** replies and include "Msg & data rates may apply."
  The consent wording in `MarketingOptIn.js` already says this. Your SMS provider (Twilio,
  etc.) typically handles STOP automatically — confirm it's enabled.
- Add/confirm a **Privacy Policy** and **SMS terms** link near these forms, and make sure
  your emails include a working **unsubscribe** link (CAN-SPAM).
- The audit log captures IP + user-agent + exact consent text + timestamp per opt-in, which is
  what you'd need if a recipient ever disputes consent.
