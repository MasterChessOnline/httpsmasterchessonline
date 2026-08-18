# Online igra radi + 10 najkorisnijih ideja

## Korak 0 — Bez ovoga ništa online ne radi

Hostovana baza je trenutno **pauzirana**. Dok je pauzirana, nema registracije, nema
matchmakinga, nema online partija — bez obzira na kod. Prvi korak plana je da je
pokrenem (traži tvoje odobrenje), pa da proverim da li je stvarno zdrava.

Posle pokretanja proveravam:
- da li se online partija kreira i pojavljuje kod protivnika,
- da li Realtime kanali stižu (potez, chat, presence),
- da li watchdog završava „mrtve" partije,
- da li se ELO i istorija upisuju posle partije.

## Popravke online igre (posle pokretanja baze)

1. **Test od dva igrača u pravom browseru** — dve sesije, jedna partija, potezi u
   oba smera, chat, abandon/timeout. Sve što padne popravljam odmah.
2. **Rezilijentnost na prekid** — ako Realtime ne stigne, polling na 3s ostaje
   kao rezerva; reconnect posle gubitka mreže bez izgubljene partije.
3. **Prazan queue** — jasno stanje „čekam protivnika" + realna alternativa
   (bot / pozovi prijatelja linkom), bez lažnih igrača.

## 10 najkvalitetnijih ideja (po odnosu koristi/trud)

1. **Instant online link „Igraj sa prijateljem"** — jedan klik generiše link,
   protivnik ulazi bez naloga; posle partije oba dobijaju poziv za nalog.
2. **Queue koji nikad ne ostavlja igrača praznog** — dok čeka na čoveka, igra
   protiv bota; kad se čovek pojavi, ponuda „prebaci se na pravu partiju".
3. **Push/e-mail „protivnik te čeka"** — kad se drugi igrač uključi u queue,
   obavesti nedavno aktivne igrače (real signal, ne fake).
4. **Prime-time sat** — jedan fiksni sat dnevno („20:00 online sat") da se
   igrači skupe u istom trenutku i queue nije prazan.
5. **Rematch i lanac partija** — posle svake partije jedan taster „revanš",
   koji drži igrače u sesiji i diže vreme na sajtu.
6. **Guest → nalog u jednom koraku** — gost igra, a nalog se pravi jednim
   klikom sa sačuvanim rezultatima/streakom (bez ponovnog kucanja).
7. **Javni profil partije (share)** — svaka odigrana partija ima javnu stranicu
   sa tablom i rezimeom; to je i SEO sadržaj i viralni link.
8. **Dnevni izazov + streak** — jedan zadatak dnevno sa serijom; najjači
   mehanizam vraćanja igrača.
9. **Leaderboard nedelje** — kratkoročna rang lista sa resetom, vidljiva na
   početnoj, da svaka pobeda ima trenutni efekat.
10. **Onboarding u 30 sekundi** — novi igrač: 1 partija → 1 zadatak → nalog;
    bez menija i bez lutanja.

Redosled implementacije: 1, 2, 5, 6 (odmah utiču na online), pa 3, 4, 9, 8,
zatim 7 i 10.

## Tehnički detalji

- `supabase--cloud_status` vraća pauzirano stanje → `resume`, pa poll do zdravog.
- Provera: `src/pages/PlayOnline.tsx` (Realtime kanali, presence, premove,
  polling fallback), `supabase/functions/online-game-watchdog`.
- Provera u pravom browseru (Playwright, dve sesije) umesto pretpostavki.
- Linkovi za prijatelja idu preko postojeće `/vs/{code}` rute gde je moguće.
- Nema bot-fill u matchmakingu bez jasne oznake da je bot — pravilo projekta.
