# Architecture rules

- Navbar keeps account tools in a desktop popover or compact navigation drawer and shares the same top authentication controls at every screen size; this avoids duplicating account behavior and header crowding.
- Prep Scout uses a bounded public read-only edge endpoint for external player records; official and online identities stay separate to avoid false identity matches.
- Preparation statistics and local PGN validation use chess.js and completed games only, with no engine calls; imported files remain on-device for privacy and fair play.