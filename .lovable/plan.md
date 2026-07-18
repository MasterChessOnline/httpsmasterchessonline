
## Šta ćemo uraditi (i zašto)

Cilj (kao ChessStalker FIDE tab): ukucaš svoj **FIDE ID** i sajt odmah pokaže tvoje **pravo ime, titulu, državu i pravi FIDE blic rejting** — i taj rejting/ime idu direktno u **DB Cup standings** i u tvoj profil na sajtu.

Plumbing već postoji na tri mesta:
1. `/dragan-brakus/register` — poziva `fide-lookup` čim ukucaš ID.
2. `/signup` — takođe poziva `fide-lookup` (dodato prošli put).
3. `DraganBrakusLive` standings već čita `first_name`, `last_name`, `fide_title`, `federation`, `fide_blitz_rating` iz `tournament_registrations` i pravilno ih prikazuje.

**Provereno sad**: pozvao sam našu edge funkciju za Magnus Carlsena i vratila je `name: "International"` sa svim rejtinzima `null`. To znači da parser u `supabase/functions/fide-lookup/index.ts` više ne odgovara stvarnom HTML-u na `ratings.fide.com` (menjali su markup). Sve ostalo radi — samo je izvor podataka slep.

## Fix (jedan fajl + verifikacija)

### 1) Rewrite `supabase/functions/fide-lookup/index.ts`

Sadašnji regexi (`std\.?\s*rating…`, `<div[^>]*>(\d{3,4})`) su iz starog dizajna. Novi profil koristi drugačiju strukturu (tabela sa "Standard | Rapid | Blitz" i profilni blok sa imenom/federacijom/titulom).

Uraditi:
- Skinuti `https://ratings.fide.com/profile/{id}` sa realnim UA i pratiti redirekte.
- **Ime**: uzeti iz `<title>...</title>` (`"Prezime, Ime FIDE Chess Profile"`) — najpouzdaniji signal, uvek postoji; ako nema zareza uzeti prvi neprazan `<h1>`/`<h2>` čvor u profilnom bloku i preskočiti sekcije poput "International"/"Federation".
- **Federacija**: iz linka `href="/rating/{FED}/"` ili iz `<img class="flag" ... title="SRB">` — ne oslanjati se na tekstualne labele.
- **Titula**: iz reda "FIDE title" u tabeli osnovnih podataka; ako nema — `null`.
- **Rejtinzi (Std/Rapid/Blitz)**: pronaći tabelu čiji redovi imaju kolone "std", "rapid", "blitz"; uzeti prvi (tekući) mesečni red. Fallback: skenirati sve `\b(\d{4})\b` iznose u sekciji "Ratings" u paru sa oznakama kolone.
- **Godina rođenja**: iz reda "B-Year" ili iz `<title>` ako je prisutna.

Dodati **fallback izvore** (redom, dok jedan ne uspe):
- `https://ratings.fide.com/profile/{id}` (glavno)
- `https://ratings.fide.com/incl_profile.php?event={id}` (stari, ponekad još radi)
- `https://app.fide.com/api/v1/client/players/{id}` (nezvanično; JSON — ako vrati 200 i ima `name`/`ratings`, prevesti u naš oblik)

Zadržati postojeći 6h cache i CORS. Dodati `?debug=1` opciju koja vraća sirov HTML u response (samo za admina) da bismo brzo dijagnostikovali sledeću promenu markup-a bez novog deploya.

### 2) Ništa se ne dira u UI-ju

`/dragan-brakus/register`, `/signup` i `DraganBrakusLive` već rade ispravno kad `fide-lookup` vrati tačne podatke — nema izmene komponenti.

### 3) Verifikacija (radim odmah po deploy-u)

Curl-om iz sandbox-a proverim 3 poznata ID-a i potvrdim vidljivost u UI-u:
- `1503014` Magnus Carlsen → očekivano `Carlsen, Magnus · NOR · GM · Blitz ~2890`
- `14106503` (SRB primer) → očekivano ime + SRB + blitz
- `2020009` Ju Wenjun (WGM) → titula + CHN + blitz

Zatim otvorim `/dragan-brakus/register`, unesem `1503014`, kliknem Register i potvrdim da u `DraganBrakusLive` standings-u red pokazuje **pravo ime, GM oznaku, NOR i pravi blic rejting** (a ne 1200 default).

## Tehnički detalji

- Fajl koji menjamo: `supabase/functions/fide-lookup/index.ts` (parser + fallback fetch lanac).
- Ne diramo bazu, ne diramo migracije, ne diramo `db-cup-register` (već ispravno konzumira polja `name/federation/title/blitz_rating/…`).
- Ne diramo `DraganBrakusLive.tsx` (već prikazuje `fide_blitz_rating` sa emerald bojom i `fide_title` zlatnom).
- Ne diramo `Signup.tsx` (već koristi isti `fide-lookup` odgovor).

## Šta se NEĆE dešavati

- Neću praviti novi turnir, novu tabelu, ni migraciju.
- Neću skidati/menjati FIDE brendiranje ili pravila; samo čitamo javne profile stranice.
- Neću tražiti nijedan tajni ključ — sve je javni HTTP GET.

Kad odobriš, prelazim u build i menjam samo taj jedan fajl pa odmah verifikujem sa Magnusovim ID-om.
