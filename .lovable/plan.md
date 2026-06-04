## Cilj
Pretvoriti 10k IG posetilaca u registrovane igrace. Trenutno imamo `/ig`, `/play-guest` i skraceni signup. Dodajemo psiholoske okidace + frikciju ka registraciji.

## 10 novih mehanizama

### 1. Exit-Intent Modal sa poklonom
Kad korisnik krene da zatvori tab (mouse leave gore) → modal: "Cekaj! 500 coina + Bronze badge ako se prijavis sad." CTA Google login. Trigger samo 1x po sesiji (localStorage).

### 2. "Nastavi gde si stao" posle 1. goste igre
Trenutno `/play-guest` ima modal posle 1 igre. Pojacati: prikazati guest rating ("Tvoj rating: 812") + "Sacuvaj napredak — bez prijave nestaje za 24h". Countdown timer pojacava FOMO.

### 3. Social proof traka na `/ig` i `/`
Live brojac: "🔴 247 igraca online • 1,832 partija danas • Nikola iz Beograda upravo pobedio". Realni podaci iz `online_games` + `profiles`. Auto-rotacija svakih 4s.

### 4. Instagram-only nagrade stranica `/ig-bonus`
Otkljucava se iz `?ref=ig`. Pokazuje 3 ekskluzivna IG bonusa: 500 coina, "IG Founder" badge, 7 dana Premium tema. CTA "Uzmi sad (Google login)".

### 5. Progressive profiling
Umesto svih polja odjednom: signup samo email+password → posle 1. pobede pita username → posle 3. partije pita avatar/level. Smanjuje psiholosku barijeru.

### 6. WhatsApp/Telegram share posle pobede
Posle guest pobede dugme "Podeli pobedu" → generise sliku finalne pozicije + link `masterchess.live/ig?ref=friend`. Viralna petlja.

### 7. "Igraj sa prijateljem" guest link
Guest moze generisati 1-click link za partiju sa prijateljem (bez prijave). Posle partije OBA igraca dobijaju prompt za signup sa bonusom.

### 8. Mobilni "Add to Home Screen" prompt
PWA install banner na `/ig` posle 30s — "Dodaj MasterChess na pocetni ekran". Instalirana app = 5x veca verovatnoca registracije.

### 9. Streak teaser na guest modu
Posle 1. partije: "Imas 1-dan streak! Prijavi se da ga sacuvas + udvostrucis coine sutra." Pokazuje vizuelni 7-dan streak grid sa praznim kockicama.

### 10. Personalizovani onboarding na osnovu ?ref
- `?ref=ig` → "Dobrodosao sa Instagrama!" + IG ikonica + bonus
- `?ref=ig-story` → drugaciji bonus
- `?ref=ig-reel` → drugaciji
Sve trackovano u `funnel_events` da znamo koji IG post najbolje radi.

## Prioritet (preporuka)
**Faza A (max impact, 1 dan):** #1 Exit-intent, #3 Social proof, #9 Streak teaser
**Faza B (viralnost, 1 dan):** #6 Share pobede, #7 Friend link
**Faza C (zadrzavanje):** #2 pojacan modal, #4 IG bonus stranica, #5 Progressive profiling, #8 PWA, #10 ref tracking

## Tehnicki detalji
- Exit intent: `mouseleave` event na `document.documentElement` sa `e.clientY < 0`
- Social proof: novi hook `useLiveActivity()` koji cita iz `online_games` + `profiles` preko Realtime
- Share image: `html2canvas` na board → blob → Web Share API (fallback download)
- Friend link: koristi postojeci `online_games` sistem sa `guest_token` u localStorage
- PWA: vec imamo manifest, dodati `beforeinstallprompt` handler
- `funnel_events`: nova tabela sa RLS (insert anon, select admin)

## Sta NE diramo
- Postojeci `/play-guest`, `/ig`, `Signup.tsx` core flow ostaje isti
- Bez izmena RLS politika osim nove `funnel_events` tabele
- Bez puzzle/static sadrzaja (postuje constraint memory)

Koju fazu prvo? Ili sve odjednom?