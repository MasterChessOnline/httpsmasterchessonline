# MasterChess — Partner Program (klubovi, treneri, savezi, škole, organizatori)

> Pravilo: **ne graditi funkciju dok bar 3 kluba/trenera ne kažu da bi je koristili.**

---

## Klubovi

1. **Zvanična stranica kluba** — logo, opis, članovi, istorija, galerija, kalendar, kontakt
2. **Klupska liga** — klub vs klub tokom sezone
3. **Klupski rejting** — agregat rezultata članova
4. **Evidencija članova** — dashboard predsednika (broj, aktivnost, partije, turniri)
5. **Besplatan mikro-sajt** — javni profil = klupski sajt
6. **Online prijave za turnire**
7. **Kalendar turnira**
8. **Galerija** (turniri, treninzi)
9. **Vesti kluba**
10. **Digitalne članske karte**

## Treneri

1. **Dashboard trenera** — svi učenici na jednom mestu
2. **Praćenje napretka** — partije, %pobeda, aktivnost, rejting
3. **Privatni zadaci** — domaći / pozicija za analizu
4. **Privatni klub** — pristup samo za učenike
5. **Grupni trening** — interni turnir
6. **Analiza partija** — komentari uz partiju
7. **Raspored časova + podsetnici**
8. **Biblioteka materijala** — PDF, PGN
9. **Profil trenera** — iskustvo, licenca, kontakt
10. **Recenzije učenika**

## Federacije/savezi

- Zvanične stranice saveza
- Nacionalne rang-liste
- Kalendar svih turnira zemlje
- Omladinske lige
- Vesti i rezultati

## Organizatori turnira

- Online prijave
- Lista prijavljenih
- Live tabela
- Parovanja (Swiss/RR)
- Deljenje rezultata jednim klikom
- Trajna stranica turnira (i posle završetka)

## Škole

- Školske lige
- Takmičenje između odeljenja
- Rang-lista škola
- Profili učenika

---

## 🏆 MasterChess Partner Program

Svaki klub/trener/škola koji se pridruži dobija:

- ✅ **Verifikovana oznaka**
- 🌐 **Svoja stranica** (`/club/:slug`, `/coach/:slug`, `/school/:slug`)
- 🎯 **Organizovanje turnira**
- 🔗 **Pozivni link** za nove članove (+ referral kredit)
- 📊 **Statistika o igračima**

Kasnije: bonusi za najaktivnije partnere (istaknute stranice, veći prize pool-ovi, sponzorstvo).

---

## Redosled implementacije (MVP → V2)

**MVP (već postoji delimično):**
- ✅ `clubs` tabela + `club_members` + `club_messages`
- ✅ turniri sa parovanjima i chat
- ⬜ Javna stranica kluba `/club/:slug`
- ⬜ "Postani partner" landing sa formom
- ⬜ Verifikovana oznaka (`clubs.verified`)

**V1:**
- ⬜ Dashboard trenera (`/coach/dashboard`)
- ⬜ Privatni klub (invite-only)
- ⬜ Klupski rejting (agregat)
- ⬜ Kalendar turnira kluba

**V2:**
- ⬜ Federacije / škole (multi-tenant hijerarhija)
- ⬜ Biblioteka materijala (PGN/PDF upload)
- ⬜ Recenzije trenera

---

## Validacija pre gradnje

Pre nego što uložimo vreme, pitati **≥3 kluba i ≥3 trenera**:

> "Da li bi vam **[X funkcija]** stvarno uštedela vreme?"

Ako je odgovor „ne baš" — ne gradimo. Manje features > više korisnih.

---

*Poslednje ažuriranje: 2026-07-16*
