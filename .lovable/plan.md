I will implement a stricter fix focused only on MasterKurs lessons and Nikola voice.

1. Force every MasterKurs line to start from the initial chess position
- In the Learn lesson builder, every MasterKurs validated line will use no custom FEN and will start from the normal initial chess board.
- Lesson `fen` will never be passed as a fallback into MasterKurs boards, so a chapter cannot open from a middle/static position.
- The board component will get a stronger reset key based on course, lesson, variation, and move count so every new line fully remounts at move 0.

2. Make every line visibly playable from move 0
- Keep the visible controls directly under the board: start, previous, play/pause, next, end, and move counter.
- Add a clearly visible full variation strip under the board so the user can see and click the whole move sequence.
- Ensure clicking a move in the move list jumps the board to that move instead of leaving the same position.

3. Fix mode/engine interference for lessons
- Disable engine/eval controls inside MasterKurs lesson boards, because project rules forbid engine help in human-play contexts and it also clutters the course playback.
- Keep guided mode as the default for every MasterKurs line.

4. Make Nikola speak at maximum audible volume
- In the voice hook, add a GainNode between streamed TTS audio and output/analyser and set it to a strong safe volume boost.
- Also increase browser fallback speech volume to max.
- Stop duplicate TTS calls when move changes happen rapidly so audio does not cancel itself before it becomes audible.

5. Validate after implementation
- Run a read-only validation script that loads every MasterKurs line and confirms it plays legally from the initial position.
- Check the Nikola TTS request path still returns streaming audio.