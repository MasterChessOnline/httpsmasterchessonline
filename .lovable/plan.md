Plan:

1. Make MasterKurs playback use validated full lines first
- Use `MASTERCLASS_VALIDATED_LINES` as the primary source for every MasterKurs lesson (`qg-*`, `rl-*`, `ck-*`, `sd-*`, etc.).
- Convert each validated SAN line into `MoveStep[]` so the board always starts at move 0 from the real starting position unless a validated line explicitly has a `startFen`.
- Stop using `lesson.fen` as the active board start when playable moves exist; keep it only as a no-moves fallback.

2. Fix “static position” behavior globally
- In `Learn.tsx`, build variations in this order: validated MasterKurs line → explicit lesson variations → practiceLine fallback → static FEN fallback.
- Reset active variation and board move index every time the user opens a new chapter/line, so every chapter starts from the beginning.
- Ensure Queen’s Gambit chapters are not stuck on the lesson FEN like the screenshot.

3. Make controls obvious under the board
- Keep visible Start, Back, Play/Pause, Forward, End controls directly under the board.
- Change labels/titles to English: “Start”, “Previous”, “Play”, “Pause”, “Next move”, “End”.
- Show a clear move counter and keep the full move list clickable so clicking any SAN jumps the board to that exact position.

4. Make the whole Learn/MasterKurs UI English
- Replace Serbian labels in `VariationsExercise.tsx`, `InteractiveBoard.tsx`, `NikolaCoachAvatar.tsx`, and AI prompts/messages with English.
- Examples: “Variation”, “Nikola is preparing analysis…”, “Click Next move — Nikola will explain every move aloud.”, “Replay”, “Pause”.
- Update spoken commentary request payloads so the AI explanation/voice output is English.

5. Make coach speech actually English audio
- Update the variation explanation function request from the client to ask for English move-by-move analysis.
- Update `nikola-tts` instructions to speak natural English as a young friendly chess coach.
- Update browser fallback speech from `sr-RS` to `en-US` so even fallback audio speaks English.

6. Improve the avatar normality without embedding the screenshot directly
- Replace the current awkward face overlay with a cleaner circular “young chess coach” avatar style, closer to the user’s requested look but privacy-safe.
- Keep lip-sync, blink, glow, mute/replay, and speaking animation working.

7. Validate the fix
- Run a read-only validation script with `chess.js` to confirm every MasterKurs validated line can be played from start to finish.
- Check the changed labels are English and that the board’s first position for a MasterKurs chapter is move 0, not the lesson’s static concept position.