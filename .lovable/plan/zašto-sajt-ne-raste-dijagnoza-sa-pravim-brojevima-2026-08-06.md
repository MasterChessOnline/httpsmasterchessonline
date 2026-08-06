# Zašto sajt ne raste — dijagnoza sa pravim brojevima

Izmerio sam stvarno stanje (analitika za 30 dana + baza). Problem nije "nedostatak funkcija" — sajt ima ogroman broj funkcija. Problem su 4 tačke gde svaki novi igrač otpada.

## Šta brojevi kažu (7.7 – 6.8.2026)

| Metrika | Vrednost | Šta znači |
|---|---|---|
| Posetioci (30d) | 517 (~17/dan) | Vrh levka je premali |
| Pregleda strana | 1427, bounce 46% | Ljudi gledaju, ali ne ostaju |
| Novi nalozi (30d) | 13 (7d: 3) | Konverzija posetilac→nalog ≈ 2.5% |
| Ukupno naloga | 78 | Mala baza |
| Online partije (7d) | **1** | Multiplayer je prazan → prvi igrač nema s kim |
| Email pretplata | **0 redova** | Nula retencionih mejlova može da se pošalje |
| Push pretplata | **0 redova** | Nula notifikacija može da se pošalje |
| Referral / share linkovi | 0 / 2 | Viralna petlja se praktično ne koristi |
| Registracije na turnir | 3 | Turnir ne puni sajt |

Izvori posete: Direct 373, Bing 164, DuckDuckGo 27, **Google samo 25**, Instagram 17.
Najgledanije: `/` 394, `/play-guest` 137, `/play` 103.

## Četiri prava problema

1. **Google praktično ne donosi saobraćaj.** 67 SEO strana postoji, ali Google daje 25 poseta u 30 dana, dok Bing daje 164. To je znak da programske strane nisu indeksirane / nemaju vrednost u Google-u, ne da treba još strana. (GSC podatke danas nisam mogao da pročitam — konektor je bio nedostupan; prvi korak plana je da to potvrdimo pravim GSC izveštajem, ne nagađanjem.)
2. **Levak propušta.** 137 ljudi je otvorilo `/play-guest`, a nastalo je 13 naloga za mesec. Gost igra i ode bez ikakvog traga (bez mejla, bez naloga, bez poziva).
3. **Nulta retencija.** Tabele za email i push pretplatu su prazne, pa svi već napravljeni sistemi (dnevna zagonetka mejlom, notifikacije, retention mejlovi) šalju u prazno. Ko jednom ode — nema šta da ga vrati.
4. **Prazna arena.** 1 online partija u 7 dana. Novi igrač klikne "Play online", niko nije tu, i to je zadnji put da je došao.

## Plan — 4 popravke po redu prioriteta

### 1. Zatvori levak (najveći efekat, najmanje rada)
- Posle svake gost-partije (`/play-guest`) prikazati ekran "sačuvaj svoj rezultat": jedno polje za email + jedan klik na nalog. Sada se rezultat gubi.
- Upis emaila odmah kreira red u `email_preferences` (uključena dnevna zagonetka) — time postojeći mejl sistemi počinju da rade.
- Na registraciji automatski kreirati `email_preferences` i ponuditi push dozvolu posle prve pobede (ne na prvom sekundu — tada svi odbiju).

### 2. Napravi da arena nikad ne izgleda prazna (bez lažnih igrača)
- Umesto praznog matchmakinga: "nema protivnika sada" → odmah ponudi bot iste jačine + "pozovi prijatelja linkom" + "obavesti me kad neko uđe" (push/mejl).
- Zakazana dnevna vremena za igru ("Arena svaki dan 20:00") da se retki igrači skupe u istom trenutku umesto da se razilaze kroz 24h.
- Nikakvi lažni igrači, botovi u matchmakingu ni izmišljena aktivnost — to ostaje zabranjeno.

### 3. Uključi viralnu petlju koja već postoji
- `/vs/{code}` share link i referral sistem su napravljeni ali se ne koriste: dodati poziv na deljenje na kraju **svake** partije (rezultat + slika table) i na profilu.
- Referral nagrada vidljiva na jednom mestu, sa brojačem "pozvao si X igrača".

### 4. Sredi Google umesto da praviš još strana
- Prvi korak: pravi GSC izveštaj (striking distance + indeksiranost) preko postojećeg `/admin/gsc` panela i `gsc-opportunities` funkcije — da vidimo koliko od 67 strana je uopšte indeksirano.
- Zatim: spojiti/izbrisati strane koje se međusobno kanibalizuju, ojačati samo one koje već imaju impresije, i interno linkovati sa `/` i `/play`.
- Bing već radi bolje — iskoristiti to i držati IndexNow pingove aktivnim.

## Tehnički detalji
- Nova komponenta za post-guest-game hvatanje emaila, poziva `email_preferences` insert.
- Trigger/RPC koji na kreiranje profila upisuje default `email_preferences` red.
- Prilagođavanje `matchmaking_queue` UX-a u `/play/online`: fallback ekran sa 3 akcije.
- Share CTA komponenta ponovno upotrebljena na kraju partije (koristi `challenge_links` i postojeći share modul).
- Bez novih tabela osim ako se pokaže da je potrebna tabela za "obavesti me kad ima igrača".

## Šta NE radimo
- Ne pravimo još SEO strana dok ne vidimo GSC podatke.
- Ne redizajniramo Home.
- Ne dodajemo lažnu aktivnost ni bot-fill u matchmaking.
