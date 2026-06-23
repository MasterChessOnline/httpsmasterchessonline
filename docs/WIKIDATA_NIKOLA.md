# Wikidata entry — Nikola Šakotić

## Zašto Wikidata?
- Wikidata = baza koju Google koristi za **Knowledge Panel** (kutija desno u search rezultatima)
- Lakše je nego Wikipedia (manje stroga pravila)
- Knowledge Panel = autoritet, instant trust, više klikova
- **Besplatno**

## Preduslovi (treba ti pre nego što napraviš Wikidata entry)
Wikidata zahteva **2-3 nezavisna izvora** (članci o tebi). Zato prvo PR pitch-evi (`PR_PITCHES.md`), pa onda Wikidata.

Minimalno:
- 1 članak na srpskom portalu (Netokracija, Startit, Telegraf, B92...)
- 1 članak na internacionalnom mediju (TechCrunch, IndieHackers, HN front page)
- 1 dodatni izvor (YouTube intervju, podcast, drugi portal)

## Kako napraviti

### 1. Napravi nalog
- Idi na wikidata.org/wiki/Special:CreateAccount
- Username, email, lozinka

### 2. Create a new Item
- wikidata.org/wiki/Special:NewItem
- **Label (English):** `Nikola Šakotić`
- **Label (Serbian):** `Никола Шакотић` (ćirilica) + `Nikola Šakotić` (latinica kao alias)
- **Description (EN):** `Serbian software developer and creator of MasterChess`
- **Description (SR):** `srpski programer i kreator platforme MasterChess`

### 3. Dodaj Statements (svaki je tipa "property → value")

| Property | Value | Reference |
|---|---|---|
| `instance of` (P31) | `human` (Q5) | — |
| `sex or gender` (P21) | `male` (Q6581097) | — |
| `country of citizenship` (P27) | `Serbia` (Q403) | — |
| `occupation` (P106) | `software developer` (Q1622272) | — |
| `occupation` (P106) | `web developer` (Q3589290) | — |
| `date of birth` (P569) | `2013` (godina samo) | Reference: link na članak koji to pominje |
| `place of birth` (P19) | `Belgrade` (Q3711) | — |
| `notable work` (P800) | (kreiraj prvo item "MasterChess" Q?????) | Reference: članak |
| `official website` (P856) | `https://masterchess.live/nikola-sakotic` | — |
| `YouTube channel ID` (P2397) | `UC8W92XBMdu20Z0tKBbwsaWA` | — |

**SVAKI statement mora imati Reference:** klikni "add reference" → "reference URL" (P854) → zalepi link na članak.

### 4. Napravi i Item za MasterChess
- New Item:
  - Label EN: `MasterChess`
  - Description EN: `Online chess platform`
  - `instance of` (P31): `website` (Q35127), `chess software` (Q21198)
  - `developer` (P178): tvoj novi Q-broj (Nikola Šakotić)
  - `official website` (P856): `https://masterchess.live`
  - `inception` (P571): datum lansiranja
  - `country of origin` (P495): Serbia (Q403)

### 5. Sačekaj
- Knowledge Panel se pojavi za 2-8 nedelja
- Google "Nikola Šakotić" — videćeš kutiju desno

---

## Ako nemaš dovoljno izvora još
**NEMOJ praviti Wikidata entry još** — biće obrisan kao "non-notable".
Prvo pošalji PR pitch-eve, dobij 3+ članka, pa onda Wikidata.

## Wikipedia (kasnije)
Kad imaš 5+ nezavisnih članaka u poznatim medijima → razmotri Wikipedia članak.
- Mnogo strožija pravila ("notability guidelines")
- Najbolje da ga napiše neko drugi (ne ti sam — sukob interesa)
- Možeš zamoliti novinara koji je već pisao o tebi
