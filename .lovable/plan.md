
# Dragan Brakus Cup — Chess-Results + Prizes + Influencer + Marketing Wave

Cilj: turnir vidljiv na chess-results.com/Serbia, MasterChess nagrade umesto novca, paket za IT lika, i tri marketing pravca paralelno (registracije + mediji + lokalna scena).

## 1. Chess-Results submission pack (korak-po-korak)

Pošto nemaš nalog, pripremam sve da pošalješ Šahovskom savezu Srbije / chess-results administratoru i da oni objave turnir.

- `docs/CHESS_RESULTS_SUBMIT.md` — uputstvo na srpskom:
  1. Registracija na chess-results.com (Account → Register, Country: Serbia)
  2. Kontakt e-mail Šahovskog saveza Srbije + template poruke (priloženo)
  3. Šta poslati pre turnira (announcement TRF, vremenski raspored, pravila)
  4. Šta poslati posle svakog kola (`tournament-export` pozivi)
  5. Final upload (TRF16, krstarica, PGN bundle) i kako tagovati turnir kao FIDE-Rated kandidata
- `docs/CHESS_RESULTS_EMAIL_TEMPLATE.md` — gotov mejl na srpskom za savez/Otto Borik admin
- `tournament-export` proširenje: dodaje `announcement-trf` (pre-turnir TRF sa registracijom bez rezultata) i `swiss-manager-tur` (.tur fajl koji chess-results direktno čita)
- `/dragan-brakus` landing: novi blok "Live on Chess-Results Serbia" sa placeholder linkom; čim dobiješ URL turnira, lepiš ga u `tournaments.external_results_url` (novo polje) i automatski se prikazuje badge

## 2. MasterChess nagrade (zamena za novac)

Migration:
- `tournaments.prize_kind` = `'masterchess_loot'` (umesto EUR)
- Drop `prize_pool_eur` iz UI prikaza za ovaj turnir, držim u bazi za history
- `tournament_prizes` tabela: `place int, coins int, badge_key text, cosmetic_key text, label text`

Default raspodela za Dragan Brakus Cup:
| Mesto | Coins | Badge | Cosmetic |
|------|------:|-------|----------|
| 1.   | 25 000 | `dragan_brakus_champion_2026` (unique, lifetime) | Custom piece set "Brakus Gold" + board theme |
| 2.   | 15 000 | `dragan_brakus_silver_2026` | Board theme "Brakus Silver" |
| 3.   | 10 000 |  `dragan_brakus_bronze_2026` | Board theme "Brakus Bronze" |
| 4–10. | 3 000 | `dragan_brakus_finalist_2026` | — |
| Best Female / Best Veteran / Best U16 | 5 000 + special badge | | |
| Svi koji odigraju ≥7 partija | 500 + `dragan_brakus_participant_2026` | | |

Auto-payout edge function `tournament-payout-brakus` koja se trigeruje kada admin označi `tournament.status='finished'`:
- čita standings, kreira `unique_badges` zapise (za 1. mesto), upisuje `player_badges` ostalima
- dodaje coins u `profiles.master_coins`
- piše u `user_inventory` za cosmetics
- audit trail u `tournament_payouts` (nova tabela)

Landing prepravka: prize section pokazuje **MasterChess loot** sa ikonicama coina + badge previewima (renderovanim iz `badges_catalog`), bez EUR.

## 3. Affiliate / referral tracking za IT lika (i bilo koju partnerstvo)

Već postoji `referrals` tabela. Dodajem:
- `affiliates` tabela: `code text PK, owner_name, owner_email, partner_tier ('founder'|'media'|'club'|'creator'), commission_coins_per_signup int default 200, commission_coins_per_tournament_join int default 500, total_signups int, total_joins int, created_at`
- `/r/{code}` route (već postoji slično, proširujem) → set cookie `mc_ref=code` (90 dana) + insert u `referrals` sa `source='affiliate:{code}'`
- Pri registraciji: ako cookie postoji, upiši affiliate
- Pri registraciji za Dragan Brakus turnir: trigger uplaćuje coins na affiliate owner's balance i broji `total_joins`
- `/admin/affiliates` panel: kreiraj/uredi kodove, vidi konverziju (samo admin role)
- `/partner/{code}` public dashboard za partnera (read-only, bez logina) — pokazuje broj klikova, signup-a, joinova; URL šaljemo IT liku

Pre nego što se vidite — kreiram mu kod `nikola-it-2026` (ili ime po izboru) odmah.

## 4. "Why MasterChess" one-pager + landing za IT lika

- `/why-masterchess` (novi route, public) — landing strana namenjena partnerima/medijima:
  - Hero: "Built by a 13-year-old. Used by hundreds. Backed by FIDE-grade infra."
  - Sekcije: Founder story, Tech stack (React/Supabase/Stockfish/WebRTC), Traction metrics (live brojevi iz DB: registered users, games played, tournaments hosted), Roadmap, Press mentions, "What we need" (mentor / sponsor / dev / media)
  - CTA: "Become a partner" → otvara modal sa formom (ide u `contact_messages` sa `category='partnership'`)
- PDF eksport iste strane → `/mnt/documents/WhyMasterChess_OnePager_v1.pdf` (generišem reportlab-om, brand colors, vizualni mockup, za štampu / mejl prilog)

## 5. Press kit v2

`/dragan-brakus/press` već postoji. Dodajem:
- `/press` (sajt-wide press hub) sa download dugmićima:
  - Logo pack (SVG/PNG, light + dark) → upload u Lovable Assets
  - Founder photo pack (već postoje 2 slike — re-eksport u 1200x1200 + 400x400)
  - Brand colors swatch PDF
  - 60-sec auto-loop video (statički MP4 sa gameplay screenshotima + tekstom; generišem ffmpeg-om iz postojećih screenshotova)
  - Screenshot pack ZIP (5 ključnih stranica u 1920x1080)
- Update `docs/PR_PITCHES.md` sa nova 3 pitch templata: tech blog, esports portal, lokalna TV

## 6. Sponsor/partner tier na /dragan-brakus

- `tournament_sponsors` tabela: `tournament_id, name, logo_url, website, tier ('title'|'gold'|'silver'|'community'), display_order`
- Render zona "Partners & Sponsors" iznad footer-a sa logoima
- Admin može da dodaje preko `/admin/tournaments/{id}/sponsors`
- IT lik ide kao `title` ili `gold` tier čim potpiše

## 7. Marketing wave — sva tri paralelno

### A. Maximum registracija (500)
- `RegistrationFomoBanner` komponenta — sticky na vrhu `/dragan-brakus`: "🔥 X/500 spots — locked at Y players: prize escalator triggers next tier"
- Prize escalator pretvaram u "loot escalator": na 100/200/300/400 igrača otključavaju se dodatni cosmetic-i (npr. exclusive emoji pack, profile frame)
- Push notif via `SmartNotifier` 7 dana, 3 dana, 1 dan, 1h pre starta (samo opted-in)
- WhatsApp/Telegram/X share generator sa OG slikom koja prikazuje trenutni broj prijavljenih (edge function `og-brakus`)
- Email burst (ako je email infra spremna): 3 talasa registrovanim ne-prijavljenim igračima

### B. Medijska pažnja
- `docs/MEDIA_OUTREACH.md` — lista 15 srpskih portala (RTS Sport, B92, Sportal, Mondo, Telegraf, N1, Nova S, Sport Klub, lokalni IT portali: Netokracija, Startit, Helloworld.rs, IT mreža + 4 šahovska kanala)
- Pre-pisan press release na srpskom + engleskom u `docs/PRESS_RELEASE_BRAKUS_v1.md` sa embargo datumom
- Edge function `media-pitch-tracker` (lagana): admin upiše kome je poslat pitch, status (sent/opened/replied/published) — tabela `media_outreach`
- Wikidata predlog za "Dragan Brakus Cup" sa source linkovima

### C. Lokalna Beograd scena
- `docs/LOCAL_OUTREACH_BELGRADE.md` — lista 30 šahovskih klubova + 20 osnovnih/srednjih škola sa kontakt mejlovima i adresama (ručno kustomizovati pre slanja; pripremiću template)
- A4 PDF flajer za štampu (`/mnt/documents/DraganBrakus_Flyer_A4_v1.pdf`) — Cirilica + Latinica varijante
- 5 dodatnih `gbp_posts` (Google Business Profile) sa lokalnim hash tagovima
- "Klub prijavljuje tim" funkcija: jedan member može da prijavi do 10 svojih saigrača odjednom (`/dragan-brakus/team-register`) — povećava virality kroz klubove

## 8. Tehnički sažetak (za tebe — ne moraš čitati)

**Migration:**
- nova polja: `tournaments.external_results_url`, `tournaments.prize_kind`
- nove tabele: `tournament_prizes`, `tournament_payouts`, `tournament_sponsors`, `affiliates`, `media_outreach`
- GRANT + RLS za sve (public read gde je za prikaz, admin/organizer write)

**Edge functions:**
- proširenje `tournament-export` (announcement-trf, swiss-manager-tur)
- nova `tournament-payout-brakus`
- nova `og-brakus` (dinamička OG slika)

**Routes:**
- `/why-masterchess`, `/press`, `/partner/{code}`, `/r/{code}` (proširen), `/dragan-brakus/team-register`, `/admin/affiliates`, `/admin/tournaments/{id}/sponsors`

**Artifacts u /mnt/documents:**
- `WhyMasterChess_OnePager_v1.pdf`, `DraganBrakus_Flyer_A4_v1.pdf`, `PressRelease_DraganBrakus_v1.pdf`, logo/press ZIP-ovi

## 9. Šta ne pravim (osim ako tražiš)

- Ne menjam Home (po memoriji: user veto na redizajn Home)
- Ne pominjem konkurentske sajtove u UI (Lichess/Chess.com)
- Ne uvodim AI pomoć u ljudske partije
- Ne kreiram fake/ghost igrače za FOMO — sve metrike su realne iz baze

## 10. Redosled isporuke

Sve u jednom talasu po odobrenju:
1. Migration (prizes, sponsors, affiliates, payouts, external_results_url)
2. Edge functions (export proširenje, payout, og-brakus)
3. Frontend: prize section rewrite, sponsors block, FOMO banner, team-register, /why-masterchess, /press, /partner/{code}, /admin paneli
4. Docs & artifacts: chess-results pack, press release, outreach lists, PDF flajer, one-pager PDF
5. Seed: 1. affiliate kod za IT lika, default prizes za Dragan Brakus, 5 GBP postova, 3 PR pitch template-a

Reci "ajde" pa krećem.
