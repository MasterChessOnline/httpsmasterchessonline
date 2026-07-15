# Google Business Profile — 30-dnevni launch

Već imaš dokumente `docs/GBP_*` u projektu. Ovo je **execution checklist** koji sve povezuje.

## Nedelja 1 — Verifikacija i osnova

- [ ] Otvori https://business.google.com i kreiraj profil (ako nije već)
- [ ] Business name: `MasterChess`
- [ ] Kategorije: **Chess club** (primary) + **Software company** + **Sports event organizer**
- [ ] Adresa: unesi Beograd adresu (kućnu je OK, ne mora fizička kancelarija — service area business)
- [ ] Service area: cela Srbija + region
- [ ] Verifikacija: video (najbrža opcija — vidi `docs/GBP_VERIFICATION_VIDEO_SCRIPT.md`)
- [ ] Website: `https://masterchess.live`
- [ ] Phone: dodaj (može mobilni; koristi WhatsApp Business za odgovore)
- [ ] Hours: `Open 24/7` (jer je online sajt)
- [ ] Description (750 chars):
```
MasterChess is a free, ad-free online chess platform built in Belgrade, Serbia.
Play against 9 bot personalities from beginner to master (400-2000 ELO),
join real-time Swiss tournaments, analyze your games with Stockfish, and
train openings and endgames. No signup required to play as a guest.

Home of the DB Chess Cup — free tournaments named in memory of Serbian
chess coach Dragan Brakus.

Made solo by a 13-year-old developer. No subscription, no ads, ever.
Play chess like a king at masterchess.live.
```

## Foto pack — 20+ fotki (uploaduj u Photos tab)

- [ ] Logo (profilna) — kruna 720×720
- [ ] Cover — turnir screenshot 1080×608
- [ ] 5× screenshots (home, board, DB Cup landing, tournament wall, stats)
- [ ] 3× foto Nikola (radni sto, board, portret)
- [ ] 3× foto board (fizički set, dobra svetla)
- [ ] 3× foto mobilna aplikacija (screenshot na telefonu)
- [ ] 2× foto zajednice (ako imaš iz nekog offline meetup-a)
- [ ] 3× "za tim" foto (i ako je samo Nikola — pokaži radni prostor)

## Nedelja 2 — Prvi postovi

Idi na Posts tab → **What's new** → napravi:

### Post #1
> **DB Chess Cup — 18. jula, besplatna prijava**
>
> Prvi veliki turnir na MasterChess platformi. Švajcarski sistem, 7 kola,
> otvoreno za sve rejtinge. Prijavi se u 30 sekundi.
>
> [Register now] → /dragan-brakus

### Post #2
> **Bot arena — igraj protiv 9 različitih ličnosti**
>
> Svaki bot igra drugačije. Od agresivnog početnika do pozicionog majstora.
> Pokušaj da pobediš Nikolu bota — najteži je 2000 ELO.
>
> [Try bots] → /play

### Post #3
> **Bez reklama. Bez pretplate. Zauvek.**
>
> Napravio ga trinaestogodišnjak iz Beograda jer je hteo šahovski sajt
> bez pop-up-a. Sada je otvoren za sve.
>
> [Play now] → /play-guest

**Cadence**: minimum 1 post nedeljno. Ideal 3/nedeljno (auto preko `publish-gbp-posts` edge funkcije).

## 30 postova unapred (copy-paste u edge funkciju)

**Pon posts (Puzzle)**:
1. Puzzle nedelje — daj FEN + rešenje na linku
2. Endgame trick: King and pawn vs King
3. "Da li vidite mat u 3?" izazov
4. Blunder analiza slavne partije

**Sre posts (Player spotlight / feature)**:
5. Top igrač nedelje
6. Feature launch: Voice chat u online partijama
7. Novi bot: "Nikola AI" 2000 ELO
8. Streamer takeover: DailyChess_12 live

**Pet posts (Tournament / event)**:
9. Weekly Sunday Blitz — 20h
10. DB Cup countdown
11. Novi Swiss turnir dostupan
12. Battle Royale nedeljom

**Ned posts (Educational)**:
13. Otvaranje nedelje: Sicilian Defense
14. Endgame lekcija: Rook + King vs King
15. Tips: kako da pređeš 1000 ELO
16. Zamke u Italian Game

... (nastavi ovaj obrazac × 3 meseca = 36 postova)

## Nedelja 3 — Reviews playbook

**Cilj**: 20 recenzija (4.5+ prosek) prvi mesec.

**Kako**:
1. Napravi listu 30 ljudi koji ti mogu ostaviti recenziju (prijatelji, porodica, prvi igrači)
2. Pošalji im **personalizovan** WhatsApp:

```
Ćao [ime],

Znaš da sam napravio MasterChess sajt.
Ako imaš 2 min i telefon pri ruci — možeš li mi ostaviti Google
recenziju? Direktan link:

[GBP review link]

Napiši šta ti se sviđa (ili ne) — iskreno, ne moraš 5*. Svaka
pomaže da nas Google više prikazuje.

Hvala!
```

**Deep link**: `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`
(Place ID dobijaš iz `resolve-place-id` edge funkcije)

**In-app trigger** (već postoji `docs/GBP_REVIEWS_PLAYBOOK.md`):
- Posle 3. pobede, prikaži modal: "Volite MasterChess? ⭐ Ostavite recenziju"

## Nedelja 4 — Lokalne citation

Submit na (svaka ~2 min):

- [ ] **Bing Places** — https://www.bingplaces.com
- [ ] **Apple Maps Connect** — https://mapsconnect.apple.com
- [ ] **Šahovski savez Srbije** — https://sahsavez.rs (kontakt za listing)
- [ ] **011info** — https://www.011info.com (Beograd katalog)
- [ ] **Poslovi Oglasi** — https://www.poslovi-oglasi.com
- [ ] **Sport.rs** — kontakt za listing
- [ ] **Mozzart Sport** — chess sekcija
- [ ] **Katalog.rs**
- [ ] **PoslovnaPretraga.rs**
- [ ] **Firme.rs**
- [ ] **Yelp** (za regionalne pretrage)
- [ ] **Foursquare / Swarm**
- [ ] **Yandex Business** (RU + regionalna pretraga)
- [ ] **Kompass** (B2B katalog)
- [ ] **Europages**

**Konzistentnost — NAP** (Name, Address, Phone): mora biti **identičan** svugde:
```
MasterChess
[tvoja adresa, Beograd 11000, Srbija]
+381 [telefon]
https://masterchess.live
```

Različit NAP = Google ne veruje profilu.

## Očekivani rezultat 30 dana

- 300+ profile views
- 40+ website clicks
- 20+ reviews (4.5+ prosek)
- Rank u top 5 za "chess Belgrade" i "šah online Srbija"
- 15–30 signup direktno iz GBP-a
