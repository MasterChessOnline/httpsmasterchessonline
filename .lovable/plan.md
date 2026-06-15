# Plan: 5 Viral Growth Features

Implementiram svih 5 predloženih feature-a redosledom po ROI-u.

## 1. Referral System
- **DB:** `referrals` tabela već postoji (vidim u shemi) — proveriću kolone i dopuniti ako treba (inviter_id, invitee_id, code, reward_claimed, created_at)
- **Route:** `/invite` — generiše unique link `?ref=CODE`, prikazuje stats (pozvani, claimed coins)
- **Logic:** Edge function `claim-referral` — dodaje 100 coina i inviteru i invitee-ju kad invitee odigra prvu partiju
- **Badge:** "Recruiter" badge nakon 3 uspešna referrala
- **UI:** Card na homepage-u "Pozovi prijatelja → 100 coina oboje"

## 2. Global Leaderboard on Homepage
- **Component:** `<GlobalLeaderboard />` sa 3 tab-a (Top Rating / Most Active / Rising Stars)
- **Edge function:** `leaderboard-cache` — 5-min cache, vraća top 10 po kategoriji
- **UI:** "Your Rank: #142" za logovane korisnike, klik na ime → profil
- **Mount:** Homepage ispod hero sekcije

## 3. Personality Quiz
- **DB migration:** dodati `chess_personality` kolonu u `profiles`, kreirati `quiz_results` tabelu
- **Route:** `/personality-quiz` — 5 pitanja, 4 tipa (Aggressive Hawk, Positional Python, Tactical Tiger, Solid Tortoise)
- **Share card:** kao BeatNikolaShareCard — generiše PNG za WhatsApp/X/IG
- **Badge:** Personality badge na profilu

## 4. Live Spectate
- **Route:** `/spectate` — lista trenutno aktivnih `online_games` (status='in_progress')
- **Detail:** `/spectate/:gameId` — Realtime subscribe na `online_game_moves`, anonimno gledanje
- **UI:** Spectator count, live chat (reuse `game_messages` ili novi `spectator_chat`)
- **Homepage card:** "Watch Live Games (12 active)"

## 5. Interactive Onboarding Wizard
- **Component:** `<OnboardingWizard />` — 3 koraka (skill level → favorite opening → invite friend)
- **Trigger:** prikazuje se jednom za nove korisnike (`profiles.onboarding_completed=false`)
- **Save:** `profiles.skill_level`, `profiles.favorite_opening`, `profiles.onboarding_completed`
- **Post-wizard:** redirect na personalizovane preporuke (lessons + bot match)

## Tehnički detalji
- **Nove tabele:** `quiz_results` (user_id, personality_type, scores jsonb)
- **Profili — nove kolone:** `chess_personality`, `skill_level`, `favorite_opening`, `onboarding_completed`
- **Nove rute:** `/invite`, `/spectate`, `/spectate/:gameId`, `/personality-quiz`, `/leaderboard`
- **Edge functions:** `claim-referral`, `leaderboard-cache`
- **Nove komponente:** `GlobalLeaderboard`, `OnboardingWizard`, `PersonalityQuiz`, `PersonalityShareCard`, `SpectateList`, `SpectateRoom`, `ReferralCard`
- **Nav update:** dodati `/spectate`, `/leaderboard`, `/personality-quiz` u Command Palette i Header

## SEO benefit
- `/leaderboard` i `/personality-quiz` su nove indeksabilne stranice
- Share card-ovi → backlinks sa WhatsApp/X/Reddit
- `/spectate` povećava dwell time

## Redosled implementacije
1. DB migracija (sve tabele/kolone odjednom)
2. Referral system + homepage card
3. Global Leaderboard
4. Personality Quiz + share card
5. Live Spectate
6. Onboarding Wizard
7. Update Command Palette + Header + Footer

Da li da krenem?