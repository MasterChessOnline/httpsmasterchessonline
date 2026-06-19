## Cilj

Site ima samo **Master Courses (Masterkursi)**. Svaka varijacija je bolje objašnjena. Klik na varijaciju odmah je učitava na **istu tablu** sa prev/next dugmićima koja zaista pomeraju figure. Pored table stoji **Nikola avatar** koji **stvarno priča** (AI glas) i komentariše svaki potez dok korak po korak ide kroz varijantu — usne se kreću, oči trepću.

---

## 1. Ukloni sve osim Master Courses

**`src/pages/Learn.tsx`**
- U `TABS` ostavi samo `{ key: "masters", label: "Master Courses", icon: Crown }`. Skloni Openings i Training tabove.
- `CourseList` uvek renderuje `masterclassCourses` (sakrij `openings`/`training` grane, obriši `TrainingTab` komponentu).
- Default `tab` state = `"masters"`.
- Tip `LearnTab` postaje `"masters"` (zadrži za buduće proširenje).
- Update SEO `description` da spominje samo master kurseve.

**`src/pages/Lessons.tsx`** — preusmeri na `/learn` (`<Navigate to="/learn" replace />`), ukloni rutu iz menija/footera (search `"/lessons"` po `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `CommandPalette.tsx`, sitemape).

**`src/pages/OpeningTrainer.tsx`** + ruta `/openings` — preusmeri na `/learn`. (`OpeningTrainerView.tsx` ostaje jer ga `MasterGameView` koristi.)

**`/guides`, `/learn/glossary`, `/learn/checkmate-patterns`, `/players`, `/learn/:slug`** — ne diramo (to su SEO stranice, ne kursevi). Korisnik je tražio da "kursevi" budu samo masterkursevi.

Sitemap regen nije obavezan — stari URL-ovi će redirect-ovati.

---

## 2. Bolje objašnjenje svake varijante (per-move komentari)

**`src/lib/lesson-moves.ts`** — `MoveStep` već ima opciono `explanation?: string`. Trenutno mnogi potezi nemaju komentar; pisanje 130+ × 10 ručno je nemoguće. Rešenje:

**Nova edge funkcija `supabase/functions/explain-variation/index.ts`** (Lovable AI Gateway, model `google/gemini-3-flash-preview`):
- Input: `{ courseTitle, variationName, startFen, moves: [{san, fen?}] }`
- Output: `{ moves: [{san, explanation, idea}] }` — kratko (15–25 reči po potezu) na **srpskom**, plus jedna `summary` rečenica za celu varijantu.
- Caching: rezultat se piše u novu tabelu `variation_explanations` (PK = hash inputa) da se ne plaća drugi put.

Migracija:
```
CREATE TABLE public.variation_explanations(
  cache_key text PRIMARY KEY,
  course_id text NOT NULL,
  variation_id text NOT NULL,
  summary text,
  moves jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.variation_explanations TO anon, authenticated;
GRANT ALL  ON public.variation_explanations TO service_role;
ALTER TABLE public.variation_explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cached explanations"
  ON public.variation_explanations FOR SELECT USING (true);
```

Klijent (`VariationsExercise.tsx`) na izbor varijante:
1. Pokušava `select` iz cache-a.
2. Ako prazno → poziva edge funkciju, prikazuje "Nikola priprema objašnjenje…" sa shimmer placeholder-om.
3. Smešta rezultat u local state — koristi ga i UI i TTS.

Fallback ako edge padne: koristi postojeći `lesson.content` + `keyPoints`.

---

## 3. Tabla sinhronizovana sa varijantom (prev/next radi)

Trenutno `VariationsExercise` već ubacuje `InteractiveBoard` sa `moves`, ali u **guided** modu se očekuje da korisnik klikne pravu figuru. Korisnik želi da samo gleda — strelica napred = potez se odigra, strelica nazad = potez se vraća.

**Izmene u `src/components/learn/InteractiveBoard.tsx`** — dodaj novi mode `"watch"`:
- Preskače validaciju "tvoj potez".
- `→` ili klik **Sledeći potez** → `setMoveIndex(i+1)`, animira figuru, pušta `move`/`capture` zvuk, šalje event `onMoveAdvance(index, san, fen)`.
- `←` vraća. `⏮ ⏭` start/kraj. `▶` auto-play (postoji).
- Vidno veliki "‹ Nazad / Sledeći ›" dugmići ispod table (mobile-friendly, min 44px).

**`VariationsExercise.tsx`**:
- Prosledi `mode="watch"` (osim ako korisnik klikne "Vežbaj ovu varijantu").
- Dodaj toggle `Watch / Practice`.
- Kad se promeni `active` (izabrana varijanta) → resetuje `moveIndex` na 0 i emit `onSelectVariation` da TTS krene od početka.

---

## 4. Nikola avatar koji priča (AI glas + animacija usana)

**Avatar slika** — generiši jednu portret-ilustraciju (`src/assets/nikola-avatar-talk.png`, transparent, 512×512) — dečak 13 god., dobroćudan, u stilu gold/black brenda. Koristi se za bazu.

**`src/components/learn/NikolaCoachAvatar.tsx`** (nova):
- Krug 96–120px, slika unutra.
- Kad `speaking=true`: 
  - Soft glow ring (`box-shadow` pulse u primary).
  - Mali overlay "usta" `<div>` koji se otvara/zatvara po amplitudi (`requestAnimationFrame` čita amplitudu iz `AnalyserNode`).
  - Treptanje očiju svakih 3–5s (CSS keyframes drugi overlay).
- Dugmići: ▶ Reci ponovo, ⏸ Pauza, 🔇 Mute (persist u `localStorage` `nikola_voice_muted`).

**`src/hooks/use-nikola-voice.ts`** (nova):
- `speak(text: string)` → `fetch('/functions/v1/nikola-tts', {body:{text}})`, SSE stream `pcm`, sastavlja AudioBuffer chunks (po pattern-u iz `ai-text-to-speech` knowledge fajla).
- Vrati `AnalyserNode` da avatar može da čita amplitudu.
- `stop()` prekida current playback.
- Queue: ako stigne novi `speak()` dok prethodni traje → prekida prethodni, počinje novi.

**Edge funkcija `supabase/functions/nikola-tts/index.ts`**:
- `POST {text}` → poziva `https://ai.gateway.lovable.dev/v1/audio/speech` sa `model: openai/gpt-4o-mini-tts`, `voice: "verse"` (mladalački, topao), `stream_format: "sse"`, `response_format: "pcm"`, `instructions: "Speak warmly and clearly, like a friendly 13-year-old chess coach explaining to a friend. Keep energy bright."`
- Prosleđuje SSE body 1:1 na klijent. CORS headeri uključeni.
- `verify_jwt = false` (svako može da sluša svoj komentar).
- Chunking: tekst >400 reči se deli na rečenice (postoji helper u knowledge fajlu).

**Integracija u `VariationsExercise`**:
- Kad korisnik izabere varijantu → `speak(summary)`.
- Na svaki `onMoveAdvance(i, san)` → ako postoji `explanation[i]`, `speak("${san}. ${explanation}")`.
- Auto-play (`▶`) prirodno čita potez-po-potez (sledeći potez čeka da glas završi → koristi `onended` umesto fiksnog 1.1s timera).
- Cache audio u memoriji po `hash(text)` da se isti komentar ne plaća kad korisnik klikne ←→.

**Jezik glasa**: srpski tekst, model `gpt-4o-mini-tts` ima dobar SR akcenat. Ako zvuči loše, instruction nadograđujemo "Speak Serbian naturally with clear pronunciation".

---

## 5. UI flow (korisnička priča)

1. Otvori `/learn` → vidi samo karticu **Master Courses** (Crown header, 7 kurseva).
2. Klik na kurs → lista varijanti (kao sada).
3. Klik na varijantu → otvara se **LessonView** sa:
   - Levo: tabla sa figurom u startnoj poziciji + **‹ Nazad | Sledeći ›** | **▶ Auto** | **🔁 Reset**.
   - Desno: avatar Nikole (animirani), ispod njega "Šta govori sada" transkript trenutnog poteza.
   - Ispod table: lista svih varijanti (može se prebacivati bez napuštanja stranice).
4. Klik **Sledeći** → figura se pomera, Nikola izgovori `"e4 — Borba za centar od prvog poteza."`. Auto se zaustavlja na kraju varijante.
5. Toggle **Vežbaj** → prelazi u postojeći guided mode (drag-drop pravog poteza), Nikola pohvali/ispravi.

---

## Tehničke izmene — sažetak

| Fajl | Akcija |
|---|---|
| `src/pages/Learn.tsx` | Ukloni Openings/Training tabove i `TrainingTab` |
| `src/pages/Lessons.tsx` | Zameni sa Navigate→/learn |
| `src/pages/OpeningTrainer.tsx` | Zameni sa Navigate→/learn |
| `src/App.tsx` | Sredi rute (`/lessons`, `/openings`) |
| `src/components/Navbar.tsx`, `Footer.tsx`, `CommandPalette.tsx` | Ukloni linkove ka `/lessons` i `/openings` |
| `src/components/learn/InteractiveBoard.tsx` | Dodaj `watch` mode + jasniji prev/next + `onMoveAdvance` callback |
| `src/components/learn/VariationsExercise.tsx` | Watch toggle, fetch explanations, integriši NikolaCoach |
| **NEW** `src/components/learn/NikolaCoachAvatar.tsx` | Avatar + animacija + mute kontrola |
| **NEW** `src/hooks/use-nikola-voice.ts` | TTS streaming hook |
| **NEW** `src/assets/nikola-avatar-talk.png` | Portret (premium imagegen) |
| **NEW** `supabase/functions/nikola-tts/index.ts` | SSE proxy ka Lovable AI TTS |
| **NEW** `supabase/functions/explain-variation/index.ts` | Generiše objašnjenja na srpskom |
| **NEW migracija** | `variation_explanations` tabela + RLS + GRANT |

## Ne diramo
- `OpeningTrainerView.tsx` (koristi `MasterGameView`).
- Sve SEO stranice (`/guides`, `/players`, `/glossary`, blog).
- Postojeće course data (`courses-data.ts`, `lesson-moves.ts`) — sadržaj se dopunjava AI-em, ne menja se ručno.

## Šta ne radi plan
- TTS troši Lovable AI kredite po pozivu (cache pomaže). Ako padne 402/429 → fallback na browser `speechSynthesis` sa porukom "AI glas trenutno nije dostupan".
- Nikolin avatar je 2D slika sa CSS overlay-em za usta — nije pravi rigged lip-sync, ali izgleda živo i sinhronizovano sa amplitudom glasa.