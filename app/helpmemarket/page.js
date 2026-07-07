// app/helpmemarket/page.js
// Unlisted marketing playbook. Reachable only at /helpmemarket — no nav/footer link.
// noindex keeps it out of search engines.
"use client";
import { useState } from "react";

const CLAUDE_PROMPT = `You are a ruthless, world-class Instagram growth strategist. I'm going to connect you to my Instagram profile. Audit it with brutal, specific honesty — no compliments to soften the blow, no vague advice.

Go through and score each of these 1–10, then explain exactly what's wrong and how to fix it:

1. Follower-to-following ratio — does it signal credibility or desperation?
2. Bio — is it instantly clear who I help, how, and why they should care? Is there a call to action?
3. Profile photo & highlight covers — professional or amateur?
4. Feed aesthetic — is there a cohesive look, or is it random?
5. Photo/video quality — lighting, framing, resolution.
6. Content mix — am I posting things people actually save and share, or just talking about myself?
7. Captions — hook in the first line? Or scroll-past filler?
8. Before/after or proof-of-work content — do I have any? If not, how much is it costing me?
9. Posting consistency — can you tell from the grid?
10. Engagement — are comments real conversations or crickets?

Then give me:
- The 3 biggest problems dragging the account down, ranked.
- A 30-day fix plan with specific weekly actions.
- 5 content ideas tailored to my niche that would actually get saved and shared.

Be blunt. I want the truth, not encouragement.`;

const STEPS = [
  {
    n: "01",
    tool: "Claude",
    title: "Get a brutal profile audit",
    body:
      "Let Claude tear your profile apart — follower ratio, bio, photo quality, engagement, the missing before/afters. It's the honest feedback no friend will give you.",
    connect:
      "How to connect: install the Claude for Chrome extension, open your Instagram profile in Chrome, then paste the prompt below into Claude. It reads what's on screen and audits it live.",
    hasPrompt: true,
  },
  {
    n: "02",
    tool: "ChatGPT",
    title: "Write a script that hooks",
    body:
      "Take the audit's content ideas into ChatGPT and turn each one into a tight 30–60 second script. Ask for a scroll-stopping first line, one clear point, and a reason to follow. Short, spoken, human.",
  },
  {
    n: "03",
    tool: "Teleprompter",
    title: "Film it without freezing up",
    body:
      "Load the script into a teleprompter app so you can read naturally while looking into the lens. No memorizing, no ums, no forty takes. You'll sound confident because you're not fighting your own memory.",
  },
  {
    n: "04",
    tool: "CapCut",
    title: "Cut the raw footage — no captions yet",
    body:
      "Edit the base video in CapCut: trim dead air, tighten the pacing, drop in b-roll or cutaways. Leave captions off for now — they come next, from a tool that does them better.",
  },
  {
    n: "05",
    tool: "Captions",
    title: "Add captions & graphic effects",
    body:
      "Run the clean cut through the Captions app for animated, word-by-word captions and eye-catching graphic effects. This is what makes a video feel produced instead of homemade — and keeps people watching to the end.",
  },
  {
    n: "06",
    tool: "ManyChat",
    title: "Reply to every DM & comment — automatically",
    body:
      "Set up ManyChat to respond to every comment and DM the moment it lands. Instant replies keep people engaged, trigger the algorithm, and turn casual viewers into a community that actually sticks around.",
  },
];

export default function HelpMeMarket() {
  const [copied, setCopied] = useState(false);

  function copyPrompt() {
    try {
      navigator.clipboard.writeText(CLAUDE_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {/* Page-scoped styles. Kept here so this page owns its look without touching global css. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hmm{--pink:#ff5c8a;--violet:#7c5cff;--cyan:#22d3ee;--night:#0b0a1a;--star:#ffd166;
          background:radial-gradient(1200px 600px at 70% -10%, #241b4d 0%, transparent 60%),
                     radial-gradient(1000px 500px at 0% 20%, #1a2f4d 0%, transparent 55%),
                     var(--night);
          color:#f2f0ff;min-height:100vh;overflow-x:hidden;position:relative;}
        .hmm *{box-sizing:border-box;}
        .hmm .stars{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
        .hmm .stars span{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;
          opacity:.5;animation:tw 3s ease-in-out infinite;}
        @keyframes tw{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.9;transform:scale(1.6)}}
        .hmm-wrap{max-width:960px;margin:0 auto;padding:0 22px;position:relative;z-index:2;}

        /* HERO */
        .hmm-hero{padding:6rem 0 4rem;text-align:center;}
        .hmm-eyebrow{display:inline-block;font-size:.8rem;letter-spacing:.28em;text-transform:uppercase;
          color:var(--cyan);border:1px solid rgba(34,211,238,.35);border-radius:999px;
          padding:.4rem 1rem;margin-bottom:1.6rem;background:rgba(34,211,238,.06);}
        .hmm-h1{font-size:clamp(2.4rem,7vw,4.6rem);font-weight:900;line-height:1.02;letter-spacing:-.03em;
          margin:0 0 1.2rem;
          background:linear-gradient(100deg,#fff 0%,var(--pink) 45%,var(--violet) 75%,var(--cyan) 100%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          background-size:200% auto;animation:shine 6s linear infinite;}
        @keyframes shine{to{background-position:200% center}}
        .hmm-sub{font-size:clamp(1.05rem,2.4vw,1.3rem);color:#c9c4ef;max-width:44ch;margin:0 auto 2.4rem;line-height:1.5;}
        .hmm-cta{display:inline-block;font-weight:800;font-size:1.05rem;padding:1rem 2rem;border-radius:14px;
          color:#0b0a1a;background:linear-gradient(100deg,var(--pink),var(--violet));
          box-shadow:0 12px 40px rgba(124,92,255,.45);cursor:pointer;transition:transform .18s,box-shadow .18s;}
        .hmm-cta:hover{transform:translateY(-3px);box-shadow:0 18px 50px rgba(255,92,138,.5);}

        /* floating 3D-ish orbs */
        .hmm-orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.55;pointer-events:none;
          background:radial-gradient(circle at 30% 30%, #fff, transparent 40%),var(--violet);}
        .orb1{width:120px;height:120px;top:12%;left:6%;animation:float1 9s ease-in-out infinite;
          background:radial-gradient(circle at 30% 30%,#fff,transparent 42%),var(--pink);}
        .orb2{width:80px;height:80px;top:26%;right:8%;animation:float2 11s ease-in-out infinite;
          background:radial-gradient(circle at 30% 30%,#fff,transparent 42%),var(--cyan);}
        .orb3{width:56px;height:56px;top:60%;left:12%;animation:float1 13s ease-in-out infinite;}
        @keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-28px) translateX(14px)}}
        @keyframes float2{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(24px) translateX(-16px)}}

        /* SECTION HEADS */
        .hmm-sec-head{text-align:center;margin:4.5rem 0 2.5rem;}
        .hmm-sec-head h2{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:900;letter-spacing:-.02em;margin:0 0 .6rem;}
        .hmm-sec-head p{color:#b9b3e6;max-width:46ch;margin:0 auto;}

        /* STEP CARDS */
        .hmm-steps{display:flex;flex-direction:column;gap:1.4rem;}
        .hmm-card{position:relative;border-radius:20px;padding:1.8rem 1.8rem 1.8rem 2rem;
          background:linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px);
          transition:transform .22s ease, box-shadow .22s ease, border-color .22s;
          transform-style:preserve-3d;}
        .hmm-card:hover{transform:perspective(900px) rotateX(3deg) translateY(-5px);
          box-shadow:0 24px 60px rgba(124,92,255,.28);border-color:rgba(124,92,255,.5);}
        .hmm-card-top{display:flex;align-items:baseline;gap:1rem;margin-bottom:.7rem;flex-wrap:wrap;}
        .hmm-num{font-size:2.4rem;font-weight:900;line-height:1;
          background:linear-gradient(120deg,var(--pink),var(--violet));
          -webkit-background-clip:text;background-clip:text;color:transparent;}
        .hmm-tool{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;
          color:#0b0a1a;background:var(--cyan);padding:.28rem .7rem;border-radius:999px;}
        .hmm-card h3{font-size:1.35rem;font-weight:800;margin:0 0 .5rem;letter-spacing:-.01em;}
        .hmm-card p{color:#c4bfe8;line-height:1.6;margin:0;}
        .hmm-connect{margin-top:.9rem !important;font-size:.9rem;color:#a7ffe6 !important;
          border-left:2px solid var(--cyan);padding-left:.9rem;}

        /* PROMPT BOX */
        .hmm-prompt{margin-top:1.3rem;border-radius:14px;border:1px solid rgba(34,211,238,.3);
          background:rgba(11,10,26,.6);overflow:hidden;}
        .hmm-prompt-bar{display:flex;align-items:center;justify-content:space-between;
          padding:.7rem 1rem;background:rgba(34,211,238,.1);border-bottom:1px solid rgba(34,211,238,.2);}
        .hmm-prompt-bar span{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);font-weight:700;}
        .hmm-copy{font-weight:700;font-size:.85rem;padding:.45rem .9rem;border-radius:9px;border:none;cursor:pointer;
          background:var(--cyan);color:#052027;transition:background .15s;}
        .hmm-copy:hover{background:#67e8f9;}
        .hmm-prompt pre{margin:0;padding:1.1rem 1.2rem;white-space:pre-wrap;word-wrap:break-word;
          font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82rem;line-height:1.55;color:#dcd8fb;
          max-height:280px;overflow:auto;}

        /* EMAIL CTA */
        .hmm-email{margin:5rem 0 2rem;border-radius:24px;padding:2.6rem 2rem;text-align:center;
          background:linear-gradient(135deg, rgba(255,92,138,.16), rgba(124,92,255,.16));
          border:1px solid rgba(255,255,255,.14);}
        .hmm-email h2{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:900;letter-spacing:-.02em;margin:0 0 .6rem;}
        .hmm-email p{color:#cfcaf0;max-width:48ch;margin:0 auto 1.6rem;line-height:1.55;}
        .hmm-email .sub-mount{max-width:440px;margin:0 auto;}
        /* recolor the shared SubscribeForm to fit the dark theme */
        .hmm-email input{background:#fff;color:#111;border:none !important;}
        .hmm-email .btn{background:linear-gradient(100deg,var(--pink),var(--violet)) !important;color:#fff !important;}

        .hmm-foot{text-align:center;color:#8983b8;font-size:.85rem;padding:2rem 0 4rem;}

        @media (max-width:600px){
          .hmm-hero{padding:4rem 0 3rem;}
          .hmm-card{padding:1.4rem;}
          .hmm-num{font-size:2rem;}
        }
        @media (prefers-reduced-motion: reduce){
          .hmm *{animation:none !important;}
        }
      `,
        }}
      />

      {/* noindex — keeps the page out of search results while staying reachable by link */}
      <meta name="robots" content="noindex, nofollow" />

      <div className="hmm">
        <div className="stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                top: `${(i * 137) % 100}%`,
                left: `${(i * 71) % 100}%`,
                animationDelay: `${(i % 10) * 0.3}s`,
              }}
            />
          ))}
        </div>

        <span className="hmm-orb orb1" />
        <span className="hmm-orb orb2" />
        <span className="hmm-orb orb3" />

        <div className="hmm-wrap">
          {/* HERO */}
          <header className="hmm-hero">
            <span className="hmm-eyebrow">The Growth Playbook</span>
            <h1 className="hmm-h1">Turn your Instagram into a follower magnet.</h1>
            <p className="hmm-sub">
              A no-fluff, step-by-step system to fix your profile, make content people actually
              save, and build a community that sticks — using AI at every step.
            </p>
            <a className="hmm-cta" href="#steps">Show me the system →</a>
          </header>

          {/* STEPS */}
          <div className="hmm-sec-head" id="steps">
            <h2>The 6-step system</h2>
            <p>Follow it in order. Each step feeds the next — that's why it works.</p>
          </div>

          <div className="hmm-steps">
            {STEPS.map((s) => (
              <article className="hmm-card" key={s.n}>
                <div className="hmm-card-top">
                  <span className="hmm-num">{s.n}</span>
                  <span className="hmm-tool">{s.tool}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>

                {s.connect && <p className="hmm-connect">{s.connect}</p>}

                {s.hasPrompt && (
                  <div className="hmm-prompt">
                    <div className="hmm-prompt-bar">
                      <span>Paste this into Claude</span>
                      <button className="hmm-copy" onClick={copyPrompt}>
                        {copied ? "Copied ✓" : "Copy prompt"}
                      </button>
                    </div>
                    <pre>{CLAUDE_PROMPT}</pre>
                  </div>
                )}
              </article>
            ))}
          </div>

      
          <p className="hmm-foot">Helpful × Humans — grow real, stay independent.</p>
        </div>
      </div>
    </>
  );
}
