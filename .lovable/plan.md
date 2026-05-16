# Mobile App Upgrade — 4-Phase Plan

Sve 4 oblasti, izvedene redom da svaka faza ima vidljiv efekat i da rizik bude pod kontrolom.

---

## Phase 1 — Gameplay Polish (touch board, portrait, haptics)

**Cilj:** Šahovska tabla i partija da rade savršeno jednom rukom na telefonu.

- **Touch handling table**
  - Tap-tap-to-move kao default na mobile (drag opciono u Settings)
  - Larger tap targets: padding oko polja na touch device (≥ 44×44 efektivno)
  - Drag preview: figura ide iznad prsta + halo na legalnim poljima
  - Dugi tap = preview legalnih poteza (bez puštanja figure)
- **Portrait layout** (`<768px`)
  - Layout: top bar (clock + opponent) → captures pieces → board → captures → bottom bar (my clock + actions)
  - Action dock fiksiran u dnu (Resign / Draw / Chat / Flip) — palac dohvat
  - Promotion picker kao bottom sheet (vaul), ne kao centered modal
- **Haptics** (`navigator.vibrate`, gated by Settings toggle)
  - Move: 8ms, Capture: 14ms, Check: [10,30,10], Mate/Win: [30,40,30,40,60], Illegal: [40]
  - Clock low (<10s): jedan pulse na svakih 5s, drugi pattern u zadnjih 5s
  - Bot taunt prijem: 6ms
- **Settings dodavanje**
  - "Tap to move" / "Drag pieces" / "Both"
  - "Haptic feedback" on/off
  - "Lock landscape on tablet" on/off

**Deliverables:** `useTouchBoard` hook, `useHaptics` hook, novi `MobileGameLayout` wrapper, Settings sekcija "Mobile".

---

## Phase 2 — Native-like Features

**Cilj:** PWA da izgleda i deluje kao native app posle install-a.

- **Web Share API** — share game/PGN/profil/chess-card preko OS share sheet-a (fallback: copy-to-clipboard)
- **Manifest `shortcuts`** — long-press na app ikoni: Quick Match, Play vs Bot, Tournaments, Profile
- **Badging API** (`navigator.setAppBadge`) — broj pending challenges + unread chats na app ikoni
- **iOS splash screens** — generišemo set za sve aktuelne iPhone rezolucije (12/13/14/15/16 Pro/Plus/Mini)
- **Status bar theming** — `apple-mobile-web-app-status-bar-style="black-translucent"` + theme-color koji prati background
- **Bottom sheet pattern** (vaul) za: game settings, share, profile actions, promotion picker, filter sheets
- **Pull-to-refresh** na Home, Tournaments lobby, Leaderboard, History (custom hook, ne native)

**Deliverables:** `useShare`, `useAppBadge` hookovi, splash generator skripta, `BottomSheet` komponenta, `PullToRefresh` wrapper, manifest shortcuts.

---

## Phase 3 — Push Notifications (VAPID + Edge)

**Cilj:** Igrač prima notifikaciju i kad je app potpuno zatvoren.

- **Backend** (Supabase)
  - Tabela `push_subscriptions` (user_id, endpoint, p256dh, auth, platform, created_at) sa RLS
  - Tabela `notification_preferences` (per-type toggle: challenges, your_turn, tournaments, daily_reminder)
  - VAPID ključevi kao secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
  - Edge funkcija `push-send` — prima `{user_ids, payload}`, šalje preko `web-push` (npm), čisti expired endpoints
  - Triggers/Edge hooks:
    - challenge insert → push opponentu ("X challenged you")
    - online_games move → push protivniku ("Your turn")
    - tournament starting (15min, 1min) → push svim registrovanima
- **Frontend**
  - `usePushSubscription` hook — registruje SW, poziva `pushManager.subscribe()` sa VAPID public key, upsert u DB
  - Permission prompt sa kontekstom (ne na page load) — npr. posle prve odigrane partije
  - Service worker `push` event handler + `notificationclick` koji otvara deep link
  - Settings UI za per-type toggle
- **Cleanup**
  - Postojeći `DailyReminderNotifier` (client-side) ostaje kao fallback, ali backend cron preuzima slanje

**Deliverables:** SQL migracije, edge funkcija `push-send`, SW push handlers, `usePushSubscription`, Settings → Notifications panel.

---

## Phase 4 — Performance

**Cilj:** TTI < 2s na 4G mid-range Androidu, smooth 60fps scrolling.

- **Code splitting**
  - `React.lazy` za teške rute: Tournaments, Analysis, Game Review, Stream Hub, Coach, Stats
  - Stockfish WASM lazy load — tek kad korisnik otvori vs Bot ili Analysis (ne na app start)
- **Skeleton loaders** zamenjuju spinnere na: Home cards, Leaderboard, Tournaments, History, Profile
- **Images**
  - `vite-imagetools` plugin → bundled assets generišu `webp` + `avif` varijante
  - Avatari sa `loading="lazy"` + `decoding="async"` + explicit `width`/`height` (anti-CLS)
  - LCP image (home hero) preload u index.html sa `fetchpriority="high"`
- **List virtualization** (`@tanstack/react-virtual`) na: Leaderboard, History, Community feed (>50 items)
- **Network**
  - React Query već postoji — dodati `staleTime`/`gcTime` defaults i `placeholderData` za instant transitions
  - Debounce na search input (300ms) u Command Palette i player search
- **Bundle audit**
  - `rollup-plugin-visualizer` da identifikujemo top 10 najtežih chunkova
  - Tree-shake unused lucide ikone, zameniti barrel imports
- **Mobile-specific**
  - Disable framer-motion page transitions na `lite` mode (već postoji) + extend to heavy animation komponenti
  - `content-visibility: auto` na off-screen sekcijama Home stranice

**Deliverables:** lazy route konfiguracija, `Skeleton*` komponente per page, `vite-imagetools` setup, virtualized liste, bundle analyzer report.

---

## Technical Notes

- **Redosled izvođenja:** Phase 1 → 4 → 2 → 3 (Phase 4 ranije jer ubrzava sve ostale; Phase 3 zahteva produkcijski deploy da bi VAPID radio — testira se na publish URL-u, ne u editor preview-u)
- **PWA constraint:** push notifikacije rade samo na published/installed PWA (ne u Lovable preview iframe) — biće naglašeno korisniku posle Phase 3
- **Bez breaking changes** za desktop — sve dodavanja su iza mobile breakpoint-a (`md:hidden` ili `useIsMobile`) ili iza opt-in Settings toggle-a
- **Bundle target:** initial chunk < 200KB gzipped posle Phase 4

Reci samo "Implement plan" i krećem sa Fazom 1.
