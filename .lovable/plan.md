
# Investor & Acquisition Pitch — "Why MasterChess"

Goal: when an investor (or any visitor) asks "why MasterChess vs chess.com / lichess, and why put money here?", the site answers it instantly — on the homepage and on a dedicated, shareable pitch page you can open in the meeting.

## What I'll build

### 1. New section on homepage: `WhyInvest` (above the existing WhyMasterChess)
A bold, board-room-ready strip that frames MasterChess as a category play, not a clone.

Blocks:
- **The Gap** — chess.com = cluttered, paywalled, ad-heavy. lichess = free but utilitarian, no brand, no creator economy. MasterChess = premium, brand-first, creator-native.
- **The Wedge** — streamer-first chess platform (DailyChess_12 baked in, Streamer Mode, overlays, Stream Hub). No one owns the "chess + creators" lane.
- **The Moat** — premium identity (gold/black, ranks, titles, badges), referral/invite engine with conversion tracking, gamification (XP, missions, skill tree), authentic human-only play (no bot farms, no engine help).
- **The Market** — 600M+ chess players globally, post-Queen's Gambit boom still compounding, Twitch chess category top 20 consistently.
- **The Ask / Why Now** — fully shipped product, live tournaments, creator integration, ready to scale paid acquisition + creator partnerships.

### 2. New page `/pitch` (linked from footer + section CTA)
A long-form, screenshot-able pitch deck as a web page. Sections:
1. Hero: "A premium chess brand for the streaming era."
2. Problem (chess.com & lichess weaknesses, framed respectfully, no trash talk)
3. Solution (3 pillars: Premium Brand • Creator Native • Authentic Play)
4. Product proof (live feature grid with screenshots/links: Play, Tournaments, Stream Hub, Referrals, Skill Tree, Opening Trainer)
5. Differentiators table (MasterChess vs "other big chess sites" — generic phrasing, no naming competitors directly)
6. Traction-ready surfaces (referrals, conversion tracking, daily challenges, missions — what's already instrumented)
7. Business model angles (premium memberships, creator revenue share, tournament sponsorships, white-label streamer overlays)
8. Roadmap (next 90 days bullets)
9. Team / Vision quote block
10. CTA: "Play the product" + "Contact founder" (mailto)

### 3. Small additions
- Footer link: "Investors / Pitch" → `/pitch`
- Route added in `src/App.tsx`
- Pitch page is SEO-tagged (title, meta, JSON-LD Organization) so it's shareable on LinkedIn/X

## Tone & rules
- No direct slander of chess.com/lichess — use "legacy chess sites" / "incumbents"
- Investor-grade copy: short, punchy, numbers where honest, no fake metrics
- Same Gold & Black 4D visual system, glassmorphism, Framer Motion reveals
- Mobile-first (viewport is 393px)
- All copy in English (matches rest of marketing pages)

## Files
- create `src/components/landing/WhyInvest.tsx`
- create `src/pages/Pitch.tsx`
- edit `src/pages/Index.tsx` (mount `WhyInvest` above `WhyMasterChess`)
- edit `src/App.tsx` (add `/pitch` route, lazy import)
- edit `src/components/Footer.tsx` (add "Investors" link)

No backend changes, no schema changes, no business logic touched.
