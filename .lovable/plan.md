# Plan: Brži, čistiji homepage (bez purple flash-a)

## 1. Ukloniti purple/fuchsia
- `DiscoverStrip` — promeniti **fuchsia** karticu (Personality) u **amber/gold** (brend boja). Sve kartice ostaju vidljive ali u gold-paleti sa diskretnim akcentom (emerald/sky/rose dozvoljene jer su tamne i ne "blješte").
- Zameniti `from-fuchsia-500/20` → `from-amber-500/15` da nestane ljubičasti flash kad scroll otkrije karticu.

## 2. Brži start
- **AppLaunchSplash**: 3000ms → **1200ms**. Trenutno blokira prvi smisleni paint 3s.
- **CinematicIntro**: već 1400ms, ali ima 5 floating chess figura sa `repeat: Infinity` — promeniti u jednokratnu animaciju (bez infinite loop) da CPU ne troši.

## 3. Manje motion-a na mobilnom
- `DiscoverStrip`: `whileInView` motion → ukloniti na mobilnom (<768px), samo CSS fade-in. Trenutno svaka kartica ima zaseban Framer Motion observer što na 369px ekranu znači 5 paralelnih scroll listenera.
- Smanjiti `transition.duration` 0.4s → 0.25s.

## 4. Ostalo
- Verifikovati da `DepthLayers` i `CursorGlow` već skip-uju mobile (jesu — preko `useDeviceCapability`).
- Ne dirati postojeće lazy-loaded sekcije (već optimizovano).

## Fajlovi koje menjam
- `src/components/DiscoverStrip.tsx` — paleta + uslovni motion
- `src/components/AppLaunchSplash.tsx` — `SPLASH_MS = 1200`
- `src/components/CinematicIntro.tsx` — ukloniti `repeat: Infinity` na figurama i crown halo

## Šta NE diram
- Cloud/DB (problem je čisto frontend)
- Lazy chunk strategiju (već dobra)
- Brand identitet — ostaje Gold & Black, samo skidam jedan ljubičasti akcenat

Krećem?