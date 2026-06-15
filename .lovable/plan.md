# Plan: "Sajt da eksplodira" — Viral + Retention Pack

Cilj: maksimalan viral coefficient + mobile retention. Sve dugmad, sve hookove, sve što tera ljude da se vrate I da dele.

## 1. Viral Share Layer (najveći ROI)
- **OG image generator** edge function `og-beat-nikola` → dinamička slika sa imenom igrača, brojem poteza, "Nikola crushed by X" → koristi se kad neko deli `/beat-nikola?u=<id>`
- **Personal brag URL**: svaka pobeda generiše `/wall/<username>` stranicu sa share dugmadima (X, WhatsApp, Telegram, Instagram Story link, copy)
- **One-tap share dugmad** u `BeatNikolaShareCard` (WhatsApp + Telegram + X + IG) sa pre-popunjenim tekstom na engleskom

## 2. Mobile-first Polish
- **PWA manifest + service worker** (Workbox) → "Add to Home Screen" prompt posle 2 poseta
- **Install banner** komponenta sa Nikola avatarom: "Add MasterChess to home screen"
- **Haptic feedback** na svaki potez na mobile (`navigator.vibrate(10)`)
- **Bottom nav** floating bar za mobile (Play / Live / Wall / Profile) — uvek dostupan
- **Pull-to-refresh** disable na board screen-u (sprečava bug)

## 3. Retention Hooks
- **Daily streak counter** na home (🔥 X days) — localStorage + DB sync, push notif ako prekida
- **"Nikola te izaziva"** notifikacija svaki dan u 18h (Web Push API + edge cron)
- **Comeback bonus**: ako se vrati posle 3+ dana → 500 coins + special badge
- **Email digest** edge function (weekly): tvoja statistika + top 3 wall of fame

## 4. Friction Killers
- **Guest play bez signup-a** već postoji → dodati "Save your progress" sticky banner posle 1. pobede
- **One-tap Google signup** prompt (Google One Tap API) na home
- **Skip tutorial** dugme ako se vidi da je već igrao

## 5. Social Proof Explosion
- **Live activity feed** na home: "MarkoNS just beat Nikola in 28 moves" (rolling, realtime iz `bot_games`)
- **Counter sa tickerom**: "12,847 games played today" (animated count-up)
- **Trending openings** widget: top 3 otvaranja danas iz `online_games`

## 6. Gamification Boost
- **First-win confetti** + sound (već imamo win, dodaje se canvas-confetti)
- **Combo system**: 3 wins in row = 2x XP popup
- **Mystery box** posle 5 igara: random skin / coins / XP

## 7. SEO / Discovery
- **Sitemap.xml** dinamički (sve wall stranice, openings, bots)
- **Schema.org Game markup** na svakoj bot stranici
- **Meta tags per route** preko react-helmet već postoji → popuniti za /beat-nikola, /live, /wall/*

---

## Tehnički obim
- 1 nova edge funkcija (`og-beat-nikola` za OG slike preko `@vercel/og`-style canvas)
- 1 RPC + 1 tabela: `daily_streaks (user_id, current, longest, last_play_date)`
- ~10 novih komponenti (InstallBanner, BottomNav, ActivityFeed, StreakBadge, ComboPopup, MysteryBox, ShareButtons, OneTapAuth, WallProfile, LiveTicker)
- 1 nova ruta `/wall/:username`
- PWA: `vite-plugin-pwa`
- Confetti: `canvas-confetti`

## Šta NE dodajem (poštujem constraint-e)
- ❌ Nikakva AI/engine analiza u human play
- ❌ Nikakvi fake/ghost igrači — sve iz realnih `bot_games`/`online_games`
- ❌ Nikakvi puzzles
- ❌ Email verification (auto-confirm ostaje)

---

**Pitanje pre kreće**: hoćeš da krenem sve odjednom (jedna velika serija), ili da idem po prioritetu **1 → 2 → 3** pa stop za review? Sve odjednom = ~15-20 fajlova u jednom commit-u.
