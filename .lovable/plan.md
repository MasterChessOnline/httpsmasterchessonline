
# Plan rasta MasterChess — 14 dana

Cilj: prvih **100 pravih korisnika** za 2 nedelje. Sve ostalo (turniri, klanovi, ELO ladder) postaje smisleno tek posle toga.

---

## DEO 1 — Šta SAJT radi (ja implementiram)

### A. Sakrij prazne sobe (ne briši — sakrij)
Korisnik ulazi i vidi 0 ljudi → bounce. Rešenje: prazne sobe se ne prikazuju dok nemaš bazu.

- **Battle Royale, Arena, Team Battles, Tournaments, Clubs** → ulaz iza `/more` linka u footeru. Skidaju se iz glavnog menija i sa home-a.
- **LivePlayerCounter / TrustStrip** kada vraćaju 0 → komponente se **ne renderuju** umesto da pišu "Be the first" (to potvrđuje da je prazno).
- **Spin Wheel, Chests, Skill Tree, Missions kartice** sa home-a → ostaju kao stranice, ali se sklanjaju iz home grida.
- Glavni meni: **Play · Puzzles · Learn · Profile · More**. Pet stavki, ne 15.

Gamification ostaje (XP, Battle Pass, ranks) — to je tvoj retention layer.

### B. Win-flow viral (najjači single fix)
Trenutno: dobiješ partiju → vidi se rezultat → kraj. Nula viralnog izlaza.

Posle svake pobede (vs bot ili human):
1. **Auto-popup share card** — generisana slika sa: finalna pozicija + tvoj username + rezultat + QR za rematch link. Već postoji `ChessCard` komponenta, samo treba ubaciti u win modal.
2. **"Challenge your friend" CTA** — kopira `masterchess.live/vs/{username}` link.
3. **3 dugmeta**: Download image · Share to WhatsApp · Share to Instagram Story.

Ovo je **jedini razlog zašto bi neko od tvojih korisnika prosledio sajt dalje**.

### C. `/vs/{shortcode}` deep link wiring
`ChallengeLink.tsx` već postoji. Treba:
- Generisati kratke linkove (`/vs/abc123`) iz Promo/Viral stranica.
- Landing page = full-screen "Player X challenges you" + Play Now CTA bez signupa (guest mode već postoji).
- Tracker u Supabase: ko je kliknuo, ko je odigrao — da vidiš šta zaista konvertuje.

### D. Reduktivni home redesign (mini)
*Memorija kaže "Do NOT redesign Home — user veto"*, pa **ne diram layout**. Samo:
- Sklanjam prazne live brojače (gore B).
- Prvi viewport mora imati **1 jasan CTA**: Play Now.
- DailyChess_12 sekcija ostaje, ali ide ispod fold-a.

### E. SEO landing strane (programmatic)
- `/beat/{botId}` — već postoji infrastruktura. Generišem 9 stranica (po botu) sa real meta + JSON-LD.
- `/openings/{slug}/for-beginners` — 20 najpopularnijih otvaranja, jedna stranica svako.
- `/play-from/{city}` — 30 gradova (Belgrade, Zagreb, Sarajevo, Skopje, Sofia, Bucharest, Athens...). Long-tail "play chess online from {city}".

Sve ide u sitemap, sve ima unique title/description/og.

---

## DEO 2 — Šta TI radiš (2h/dan)

Sajt sam ne dovodi ljude. Distribucija je tvoj posao. Evo egzaktnog rasporeda:

### Dnevno (60 min)
- **20 min** — 1 Reels/Short (15-30s): brza pobeda, mat u 4, "kako sam pobedio bota X". Cross-post: Instagram + TikTok + YouTube Shorts. Uvek link u biju `masterchess.live`.
- **20 min** — 1 Reddit komentar/post u r/chess, r/chessbeginners, r/AnarchyChess. NIKAD goli link — daj vrednost.
- **20 min** — odgovori na DM-ove, komentare, share `/vs/nikola` link u 3 WhatsApp/Discord grupe.

### Nedeljno (60 min ostatka)
- **1 duži YouTube video** (5-10 min) na DailyChess_12: "How I built a free chess site" ili "Beating 1800 ELO bot live". Link u opisu + pinned komentar.
- **1 Reddit "Show & Tell" post** u r/SideProject, r/InternetIsBeautiful: "I built a chess site with zero ads, AMA".

### Šta očekivati realno
- Nedelja 1: ~50 unique posetilaca, 5-10 signupa.
- Nedelja 2: ~200 unique, 20-30 signupa.
- Nedelja 4: ako si dosledan, 500+ unique/nedeljno i Google počinje da rangira SEO landing strane.

**Ako ne odradiš svoj deo — sajt sa najboljim featurima na svetu ostaje prazan.** Ovo je matematika, ne mišljenje.

---

## Tehnički deo (za implementaciju)

```
src/components/PostGameWinModal.tsx       (NOVO) auto-popup share card
src/components/Header.tsx                 reduce nav to 5 items + More dropdown
src/pages/Index.tsx                       hide empty-state widgets when count=0
src/components/LivePlayerCounter.tsx      return null if value === 0
src/pages/ChallengeLink.tsx               polish guest landing
src/pages/PlayFromCity.tsx                (NOVO) programmatic SEO route
src/lib/seo-cities.ts                     (NOVO) city list + metadata
src/pages/BeatBotLanding.tsx              ensure all 9 bots have full meta
scripts/generate-sitemap.ts               add /play-from/* and /beat/* + /openings/*/for-beginners
supabase migration: challenge_link_clicks (id, code, ip_hash, clicked_at, converted)
```

Bez novih backend feature-a, bez novih gamification sistema, bez novih stranica izvan SEO landing strana. Disciplina = preživljavanje.

---

## Šta NE radim (svesno)

- Ne diram layout home-a (tvoj veto).
- Ne brišem Battle Royale/klanove (samo sakrivam).
- Ne dodajem phantom bot-fill (krši "zero fake engagement").
- Ne pravim plaćene reklame setup (Google Ads bacanje love dok cold-start nije rešen).
- Ne pravim još jedan progression sistem.

---

## Sledeći korak

Klikni **Implement plan** i krećem sa DEO 1 (skidanje noise-a + win-flow share card + 1 SEO landing tip kao primer). To je nedelja 1. Posle toga merimo realne brojke pre nego što idemo dalje.
