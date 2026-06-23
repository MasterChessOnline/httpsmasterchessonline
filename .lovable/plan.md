# MasterCourse + Navigation Upgrades

## 1. Fix coach text duplication

**File:** `src/components/learn/VariationsExercise.tsx` (`handleMoveIndexChange`)

Currently: `` `${info.san}. ${info.explanation}` `` → AI sometimes returns explanations that already include `"13.b5 — break!"`, producing `"b5. 13.b5 — break!"`.

Changes:
- Add a `stripMovePrefix(san, text)` helper that removes any leading:
  - turn number + dot (`13.`, `13...`, `13. `)
  - bare SAN echo (`b5`, `Nf3`)
  - common separators (`—`, `-`, `:`, `,`)
- Apply it to both the per-move `info.explanation` and to `ai.summary` before speaking.
- Final spoken line becomes: `` `${san} — ${cleanedExplanation}` ``, with no separator when explanation is empty.
- Also tighten the prompt in `supabase/functions/explain-variation/index.ts` to instruct the model: *"Do NOT repeat the SAN or include move numbers — start directly with the idea."*

## 2. Real-voice audio architecture (ready for your recordings)

Goal: drop-in `.mp3`/`.wav` overrides per lesson/variation/move; fall back to TTS when missing.

- **New module:** `src/lib/nikola-voice-clips.ts`
  - `type VoiceClipKey = { courseId: string; variationId?: string; moveIndex?: number; san?: string }`
  - `voiceClipManifest`: a typed mapping `Record<string, string>` (key → asset URL).
  - `resolveVoiceClip(key)`: tries most-specific match first (`course/var/move`), then `course/var`, then `course`. Returns `null` if none.
  - `buildClipKey(...)` and `registerClip(...)` helpers so uploads are 1-line additions.
- **New folder:** `src/assets/voice/` with a `README.md` describing the naming convention (`{courseId}__{variationId}__{moveIndex}-{san}.mp3`) and `lovable-assets create` workflow → `.asset.json` pointers auto-registered in the manifest.
- **Hook upgrade:** `src/hooks/use-nikola-voice.ts` gets a new `speakClipOrText(text, key)` method:
  1. If `resolveVoiceClip(key)` returns a URL → play via `HTMLAudioElement` (still feeds the existing `AnalyserNode` for lip-sync).
  2. Else → existing TTS path.
  Existing `speak()` API stays unchanged for backward compat.
- **Wire it in:** `VariationsExercise` passes `{ courseId, variationId, moveIndex, san }` to `speakClipOrText` for both intro summary and per-move lines.
- **Settings toggle:** add `"Use Nikola's real voice when available"` (default ON) in `src/pages/Settings.tsx`, persisted to localStorage and read by the hook.

When you upload `.m4a`/`.mp3` files later, the only action is: run `lovable-assets create`, drop the resulting `.asset.json` into `src/assets/voice/`, add one line to the manifest. No code changes elsewhere.

> Note: the attached `.m4a` is a *spoken instruction* from you, not a lesson clip — I will not register it as a MasterCourse voiceover. Send the actual move-explanation recordings (or a ZIP) when ready.

## 3. Learn navbar → AI Coach fully functional

- `Navbar.tsx` Learn dropdown: rename `"Coach"` → `"AI Coach"`, update `desc` to: *"Chat with your personal AI chess coach — ask anything, review games, get a plan."*
- Same rename in `NavSearchPalette.tsx` and `Topics.tsx` for consistency.
- Verify `/coach` route renders `src/pages/Coach.tsx` (already wired in `App.tsx:272`).
- Add an `AICoachIntroCard` at the top of `Coach.tsx` (collapsible, dismissible via localStorage) explaining the 3 things the coach does: **Answer questions**, **Review your games**, **Suggest training plans** — with example prompts as clickable chips.

## 4. MasterCourse variations = engine/theory truth

Goal: every line shown must be either (a) Stockfish top choice or (b) ECO/GM opening theory.

- **Validator script (already exists):** `scripts-validate-tree.ts` — extend it:
  - For each move, query a Lichess Masters opening DB snapshot (already bundled in `src/lib/lichess-explorer.ts` patterns) OR run `stockfish-repair-masterclass.ts` style Stockfish check (already in repo) at depth 18.
  - Mark each move with `source: "theory" | "engine" | "unknown"`; fail the build on `unknown` unless explicitly whitelisted.
- **Runtime guard:** in `src/lib/lesson-moves.ts` types, add optional `source` field on each move. `VariationsExercise` renders a small badge next to suspicious moves (only shown when `source === "unknown"`).
- **Data sweep:** run the extended validator over `src/lib/masterclass-validated-lines.ts`, `masterclass-curated-lines.ts`, `masterclass-practice-extras.ts`. Auto-replace any move whose evaluation drops > 80cp vs Stockfish top with the engine's best move (using the existing `stockfish-repair-masterclass.ts` repair loop). Output a diff report to the chat for your review.
- **Docs:** add `docs/MASTERCOURSE_THEORY_POLICY.md` describing the validation rule, threshold, and how to add new lines safely.

## Technical details

- Strip regex: `/^\s*(?:\d+\s*\.{1,3}\s*)?(?:SAN\s*[—\-:,]?\s*)?/i` with SAN escaped.
- Voice clip storage uses the existing Lovable Assets CDN (no Supabase Storage bucket needed).
- No new DB migrations.
- No breaking API changes — `speak()` continues to work; `speakClipOrText()` is additive.

## Files touched

- `src/components/learn/VariationsExercise.tsx` (dedup + clip wiring)
- `src/hooks/use-nikola-voice.ts` (clip playback path)
- `src/lib/nikola-voice-clips.ts` *(new)*
- `src/assets/voice/README.md` *(new)*
- `src/components/Navbar.tsx`, `src/components/NavSearchPalette.tsx`, `src/pages/Topics.tsx` (label + desc)
- `src/pages/Coach.tsx` (intro card)
- `src/pages/Settings.tsx` (real-voice toggle)
- `supabase/functions/explain-variation/index.ts` (tighter prompt)
- `scripts-validate-tree.ts` (theory/engine validation)
- `src/lib/lesson-moves.ts` (`source` field)
- `docs/MASTERCOURSE_THEORY_POLICY.md` *(new)*
