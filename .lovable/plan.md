Plan:

1. Fix MasterKurs board playback
- Make every chapter/variation start from the real initial position of its line, not from the already-played `lesson.fen` position.
- Ensure Queen’s Gambit and all other MasterKurs lines reset to move 0 whenever a chapter or variation opens.
- Keep the visible move list, but make clicking any move jump the board to that exact move.

2. Move controls directly under the board
- Put clear previous/next/start/end/play controls immediately below the board, before explanation, engine panel, and move list.
- Keep keyboard arrows/swipe support, but the main UI will be obvious: back arrow, forward arrow, play/pause, counter.
- Make this apply globally to every MasterKurs and every variation/line.

3. Stop “static position only” behavior
- If a lesson has playable moves, the board will always use the playable move sequence as the source of truth.
- Only use `lesson.fen` as a static fallback when there are no moves at all.
- Fix the Queen’s Gambit issue where the screen shows the line text but the board stays stuck.

4. Improve Nikola avatar from your uploaded photo
- Use your uploaded image as reference/source, but keep the face privacy-safe based on the blurred upload.
- Create a polished circular coach/avatar asset that looks better in the MasterKurs panel.
- Replace the current generated Nikola avatar with this improved “you as coach” avatar.

5. Make Nikola actually speak during courses
- Keep the existing Lovable AI TTS voice route so it plays real generated audio, not just text.
- Trigger speech when the user presses next/back or clicks a move in the line.
- Keep lip movement/pulse/blink animation synced to the audio analyser.
- Add safe fallback text only if audio fails, but normal behavior will be spoken audio.

Technical notes:
- Main files to update: `InteractiveBoard.tsx`, `VariationsExercise.tsx`, `Learn.tsx`, `NikolaCoachAvatar.tsx`, and possibly `lesson-moves.ts` if any MasterKurs IDs still lack playable move data.
- I will not add engine assistance to human play; this is only inside MasterKurs learning.
- I will not embed the blurred face directly as-is; I’ll make a cleaner privacy-safe avatar from the upload.