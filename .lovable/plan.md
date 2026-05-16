# Make MasterChess Explode vs chess.com / lichess

Goal: when anyone lands on the homepage, in 5 seconds they understand **why MasterChess beats chess.com and lichess** and they want in. Pure frontend/presentation work — no backend changes.

## What I'll add

### 1. `ProofStrip` (new) — directly under the hero
A single-line, scroll-marquee strip: "No ads · No bots · No clutter · Streamer-first · Gold-grade UI · 10s to first game · Human-only ELO · Daily tournaments · Skill tree · Real ranks". Subtle gold shimmer, infinite loop. Instant gut-punch of differentiators.

### 2. `VsTheRest` (new) — the headline weapon
A bold side-by-side comparison table: **MasterChess vs chess.com vs lichess** across ~10 rows:
- Premium cinematic UI
- Zero ads / popups
- Streamer Mode + overlay embeds
- Creator integration (DailyChess_12)
- Human-only ELO (no bot inflation)
- Skill Tree + XP gamification
- Referral program with conversion tracking
- 10-second time-to-first-game
- Modern, mobile-first design
- Built-in community / Chess Moments

✅ green checks for MasterChess, ❌/⚠️ for the others — **factual, not slanderous** (we only check ourselves green; competitors get neutral marks where they genuinely lack the feature). Glassmorphic card, gold highlight on our column.

### 3. `Manifesto` (new) — the emotional hook
Full-bleed dark section, large editorial typography:
> "Chess deserves better than ads, popups and bot farms. MasterChess is chess the way it should feel — premium, honest, alive."
Three short lines + a single gold CTA "Claim your seat".

### 4. `WallOfReasons` (new) — 12 micro-cards
Tight 3×4 (desktop) / 2×6 (mobile) grid of one-line punchy reasons with icons: "Zero ads. Forever.", "Real humans only.", "Your rank, earned.", "Streamer-grade overlays.", "Tournaments every night.", "Built in 2026, not 2007.", "Mobile-first board.", "Invite friends, track conversions.", "Skill tree that levels you up.", "Daily missions, daily wins.", "Community that sees you.", "Yours to export, always.".

### 5. `StickyJoinBar` (new) — bottom-of-viewport on mobile, dismissible
Slim gold bar that slides in after scrolling 60% of homepage: "Join MasterChess — free, 10s setup → [Create account]". One-tap acquisition for mobile users (the user's current viewport is 393px).

### 6. Hero upgrade
Add a small kicker line above the hero headline: **"The premium home of online chess"** + a subtle "Built different from chess.com & lichess" microcopy under the CTAs. No layout rewrite — just copy + one badge.

### 7. Homepage assembly (`src/pages/Index.tsx`)
New order under hero:
1. `ProofStrip` (marquee)
2. existing `StatsSection`
3. `WhyInvest` (existing)
4. `VsTheRest` ⭐ new headline weapon
5. `WhyMasterChess` (existing)
6. `Manifesto` ⭐ new
7. `WallOfReasons` ⭐ new
8. `CallToActionSection` (existing)
9. `StickyJoinBar` (floating, mobile-only)

## Technical notes
- All new components in `src/components/landing/`.
- Uses existing design tokens: `text-gradient-gold`, `glass-4d`, `shadow-glow-lg`, `ripple-btn`, primary/foreground/muted-foreground HSL tokens. No new colors.
- Framer Motion for marquee, scroll reveals, sticky bar slide-in.
- Mobile-first (393px): comparison table becomes stacked accordion-style on <640px, manifesto type scales down, wall becomes 2-col.
- No new dependencies. No backend, no schema, no edge functions.
- SEO: keeps single H1 in hero; new sections use H2/H3.

## Files
- create `src/components/landing/ProofStrip.tsx`
- create `src/components/landing/VsTheRest.tsx`
- create `src/components/landing/Manifesto.tsx`
- create `src/components/landing/WallOfReasons.tsx`
- create `src/components/landing/StickyJoinBar.tsx`
- edit `src/pages/Index.tsx` (mount the new sections)
- edit `src/components/HeroSection.tsx` (kicker + microcopy only — small copy tweak)

After implementation I'll QA at 393px viewport to confirm everything reads cleanly on mobile.
