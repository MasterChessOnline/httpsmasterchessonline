# Maks online + registracija: kompletan paket

Cilj: da online deo bude "kao kod velikih" (nema praznog lobija, nema izgubljenih partija, nema zaglavljenog reda) i da registracija hvata svakog posetioca gde god da klikne.

## 1. Online — šta se dodaje

- **Otvoreni izazovi (lobby)**: igrač postavi "seek" (tempo, rated/casual), svi vide listu i jednim klikom prihvate. Rešava problem kad su dva igrača online ali u različitim vremenskim kontrolama i nikad se ne spoje.
- **Gledanje partija (spectate)**: `/watch` lista partija u toku + `/watch/:id` tabla u realnom vremenu. Neregistrovani gledaju bez naloga — ostaju na sajtu (vreme na sajtu = SEO signal).
- **Auto-timeout i auto-abort**: server označava partiju kao izgubljenu na sat, i abortuje partiju gde protivnik nije odigrao prvi potez u 30s. Sada partije mogu da vise zauvek.
- **Reconnect bez gubitka**: kad se mreža vrati, stanje se povlači sa servera; poruka "Opponent disconnected — wins in 0:15" sa odbrojavanjem.
- **Rematch preko servera**: trenutni rematch ide preko chat poruka; prelazi na tabelu ponuda pa radi i kad se strana osveži.
- **Anti-abuse**: brojač napuštanja partija na profilu i kratki cooldown na red posle 3 aborta.
- **Prisustvo i "kome mogu da pišem"**: lista online prijatelja sa "Challenge" dugmetom, direktni izazov + notifikacija.
- **Guest online**: neregistrovan igra online sa nick-om (bez rejtinga); posle partije obavezan "Save your rating" ekran → registracija.

## 2. Registracija — maksimalna konverzija

- **Jedan klik svuda**: `CreateFreeAccount` traka/dugme na svakoj stranici za neprijavljene (isti komponent, konsistentno).
- **Skraćena forma**: email + password i to je sve; ime/država/FIDE ostaju opcioni posle prve partije (progressive onboarding).
- **Google/Apple na vrhu** (već postoji) + "nastavi kao gost pa sačuvaj nalog".
- **Save-progress hook**: sve što gost odigra (partije, streak, coins) se posle registracije prenosi na nalog.
- **Post-game gate**: posle svake gostujuće partije jedan ekran sa rezultatom + "Sačuvaj rejting" (najjača tačka konverzije).
- **Welcome email + 3-dnevni niz** (dan 0 dobrodošlica, dan 1 "odigraj partiju", dan 3 "tvoj rejting čeka") preko postojećeg mailera.
- **Push posle registracije**: prompt tek posle prve pobede, ne odmah.

## 3. Ceo sajt — konzistentnost

- Svaka stranica dobija: jasan CTA (Play / Create free account), meta title+description, i unutrašnje linkove na 3 relevantne stranice (SEO + vreme na sajtu).
- Provera i popravka svih ruta koje traže login a nisu jasno označene (da gost ne udari u prazan ekran).
- Zajednički `EmptyState` sa akcijama umesto praznih lista bilo gde na sajtu.

## Tehnički detalji

- Nove tabele: `open_challenges` (seek lista), `rematch_offers`, `guest_sessions` (za prenos napretka). Uz svaku tabelu GRANT + RLS.
- Nove server funkcije: `accept_open_challenge` (atomično, `FOR UPDATE SKIP LOCKED` kao postojeći `claim_queue_opponent`), `expire_online_games` (cron svakih 30s: sat i abort), `claim_guest_progress`.
- Realtime: dodati `open_challenges` u publikaciju.
- Frontend: nove strane `/lobby`, `/watch`, `/watch/:id`; izmene u `src/hooks/use-online-game.ts` (seek + reconnect + timeout), `src/pages/PlayOnline.tsx` (rematch preko tabele, disconnect UI), `src/pages/Signup.tsx` (kraća forma + claim gost napretka).
- Bez lažnih igrača i bez bot-fill u matchmaking-u (pravilo projekta ostaje).

## Redosled izvođenja

1. Migracija (tabele, grants, RLS, RPC, cron) i timeout/abort — bez ovoga online nije pouzdan.
2. Lobby otvorenih izazova + realtime.
3. Spectate strane.
4. Registracija: kraća forma, CTA svuda, guest → account prenos.
5. Email niz + push posle prve pobede.
6. Prolaz kroz sve stranice: CTA, meta, interni linkovi, empty states.
7. Test sa dva prava naloga u browseru (potezi, sat, chat, revanš, disconnect) pre nego što kažem da je gotovo.
