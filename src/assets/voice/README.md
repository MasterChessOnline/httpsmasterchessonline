# Nikola Real Voice Clips

Drop your real-voice recordings here, then register them in
`src/lib/nikola-voice-clips.ts`. When a clip is registered for a given
(course, variation, move), the MasterCourse player will use the real
human voice instead of automatic text-to-speech.

## Naming convention

```
{courseId}__{variationId}__{moveIndex}-{san}.mp3
```

Examples:
- `of-1__intro.mp3` — full course intro
- `of-1__main__0-e4.mp3` — first move of the "main" variation in course `of-1`
- `ruy-lopez__berlin-defence.mp3` — variation intro/summary

You can use any format the browser supports: `mp3`, `wav`, `m4a`, `ogg`.

## Recommended workflow (CDN-hosted)

1. Drop the raw audio file into this folder (or anywhere temporary).
2. Upload it to the Lovable Assets CDN:
   ```bash
   lovable-assets create --file src/assets/voice/of-1__intro.mp3 \
     > src/assets/voice/of-1__intro.mp3.asset.json
   rm src/assets/voice/of-1__intro.mp3
   ```
3. Register it in `src/lib/nikola-voice-clips.ts`:
   ```ts
   import intro from "@/assets/voice/of-1__intro.mp3.asset.json";
   registerClip({ courseId: "of-1" }, intro.url);
   ```

That's the only code change needed — playback, fallback to TTS, and the
"real voice" Settings toggle all read from the registry automatically.

## Tips for recording

- Quiet room, phone or laptop mic is fine.
- 1 sentence per move — match the lesson explanation closely.
- ~3–8 seconds per clip. Leave a tiny silence at the start/end.
- Speak naturally — your real voice is the whole point. No need for a
  "radio voice".
