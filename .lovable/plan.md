# Klubovi + Partner Program — Plan

Cilj: pretvoriti postojeći `ClubDetail` u pravi javni mikro-sajt kluba (radi bez login-a, SEO-friendly) i dodati „Postani partner" tok koji vlasnicima klubova/trenerima/školama daje **verifikovanu oznaku** i vlastiti slug (`/club/moj-klub`).

## Šta već imamo
- `clubs` tabela (name, description, icon, banner_color, tag, city, lat/lng, member_count, avg_rating)
- `club_members`, `club_messages`
- `/clubs` lista i `/clubs/:id` (klub detalj, ali internи — traži login/tag u URL-u)

## Šta gradimo

### 1) Baza — migracija
Dodajemo na `clubs`:
- `slug` TEXT UNIQUE — human-readable URL (`/club/beograd-gambit`)
- `verified` BOOLEAN DEFAULT false — plava kvačica
- `partner_type` TEXT — `club | coach | school | federation | organizer | null`
- `logo_url` TEXT
- `website_url`, `contact_email`, `founded_year`
- `history` TEXT (rich text / markdown)

Nove tabele:
- `partner_applications` — prijave sa forme (name, type, contact, message, status: pending/approved/rejected, reviewer_id, decided_at)
- `club_events` — kalendar (title, starts_at, description, event_type, location) — jednostavno, klub-scoped
- `club_news` — kratke objave (title, body, published_at, author_id)
- `club_gallery` — fotografije (image_url, caption, uploaded_by)

Sve sa GRANT-ovima i RLS-om (public SELECT za javne klubove; INSERT/UPDATE za owner+admin).

### 2) Javna stranica kluba `/club/:slug`
Nova ruta pored postojeće `/clubs/:id` (backwards-compat). Sadrži:
- **Hero**: logo, ime, tag, verifikovana kvačica (ako `verified`), city, banner_color pozadina
- **About**: description + history
- **Statistika**: broj članova, prosečan rejting, ukupne pobede, weekly wins
- **Članovi**: grid sa avatarima (top 12 + „prikaži sve")
- **Događaji**: sledeći turniri iz `tournaments` (filter po `club_id` ako postoji) + `club_events`
- **Vesti**: najnovije `club_news`
- **Galerija**: `club_gallery`
- **Kontakt**: email, website
- **CTA**: „Pridruži se klubu" (ako je ulogovan) / „Prijavi se pa se pridruži"
- **Share dugme**: kopira link + otvara WhatsApp/X/Facebook
- **SEO**: dinamični `<title>`, `og:image` (koristi logo), JSON-LD `SportsClub`

### 3) Owner panel (uredi klub)
Na istoj stranici, ako `auth.uid()` je owner/admin — dugme „Uredi". Otvara modal sa tabovima:
- Osnovno (name, description, tag, banner_color, logo upload → Supabase Storage)
- Kontakt (website, email, founded_year, city)
- Istorija (textarea)
- Događaji (add/edit/delete)
- Vesti (add/edit/delete)
- Galerija (upload)

### 4) Partner landing `/partners`
Marketing stranica sa:
- Hero: „Postani MasterChess Partner"
- 3 kolone: **Klubovi / Treneri / Škole** — šta svako dobija
- Benefiti: verifikovana oznaka, javna stranica, referral link, statistika, besplatni turniri
- Forma (`partner_applications`): tip, ime organizacije, ime kontakt osobe, email, telefon, grad, broj članova, poruka
- FAQ (4-5 pitanja)
- SEO title + JSON-LD

### 5) Admin: pregled prijava `/admin/partners`
Vidljivo samo `admin` role (postoji `user_roles`). Lista prijava sa dugmadima **Odobri** / **Odbij**. Odobravanje:
- postavlja `clubs.verified = true` (ako klub postoji ili se kreira nov)
- postavlja `partner_type`
- šalje email obaveštenje (koristi postojeću email infra)

### 6) Verifikovana oznaka svugde
Mala plava/zlatna kvačica pored imena kluba u:
- listi klubova `/clubs`
- detalj stranici
- turnirima gde je klub organizator
- profilu člana (badge „Član verifikovanog kluba X")

## Ne radimo u ovoj iteraciji (sledeći paket)
- Coach Dashboard (učenici, zadaci) — poseban paket
- Klupska liga sa automatskim matchmaking-om
- Digitalne članske karte / QR
- Federacije i školske lige (multi-tenant hijerarhija)

## Tehnički detalji

**Slug**: generiše se od `name` (`slugify`, lowercase, dedupe sufiksom `-2`). Owner može da ga promeni jednom.

**Storage**: bucket `club-assets` (public read) za `logo_url` i `club_gallery`. Migracija kreira bucket + policies.

**Rute**:
```
/partners              → Partners landing + apply form
/club/:slug            → Javna stranica kluba
/clubs                 → (postoji) lista svih klubova + filter „samo verifikovani"
/clubs/:id             → (postoji) redirect na /club/:slug ako slug postoji
/admin/partners        → (novo) admin queue
```

**Fajlovi koje pravimo:**
- `supabase/migrations/xxxx_partner_program.sql`
- `src/pages/PublicClub.tsx` (nova)
- `src/pages/Partners.tsx` (nova)
- `src/pages/AdminPartners.tsx` (nova)
- `src/components/club/ClubHero.tsx`
- `src/components/club/ClubEvents.tsx`
- `src/components/club/ClubNews.tsx`
- `src/components/club/ClubGallery.tsx`
- `src/components/club/ClubEditModal.tsx`
- `src/components/VerifiedBadge.tsx`
- update `src/App.tsx` (nove rute)
- update `src/pages/Clubs.tsx` (filter verifikovanih + link na `/club/:slug`)

## Redosled izvršavanja (u build modu)
1. Migracija (kolone + 4 nove tabele + storage bucket + RLS + GRANT)
2. `VerifiedBadge` komponenta + integracija u `Clubs.tsx`
3. `/club/:slug` javna stranica (read-only prvo)
4. Owner edit modal
5. `/partners` landing + forma
6. `/admin/partners` queue + email obaveštenje na odobravanje
7. Redirect `/clubs/:id` → `/club/:slug`
