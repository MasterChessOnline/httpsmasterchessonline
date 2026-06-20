# Google Maps — MasterChess Integration

## What ships
- `/connections` — opt in / set lat-lng-city
- `/community/map` — global player pin map (only opted-in users)
- Public DB view `community_map_pins` (anon-readable, no private data exposed)

## Setup
1. Connect the **Google Maps** connector (Lovable connectors panel). The managed connection works automatically on `*.lovable.app`.
2. On the **custom domain** (masterchess.live) the managed key is referrer-restricted to lovable.app. To unlock the map on the live domain:
   - Create an API key in your own Google Cloud project (Maps JavaScript API + Places API New enabled)
   - Restrict by HTTP referrer to `https://masterchess.live/*` and `https://*.masterchess.live/*`
   - Reconnect the Google Maps connector with the custom key

## Google Business Profile (trust signal)
1. https://business.google.com → Add business → **MasterChess.live**
2. Category: **Game publisher**
3. Service area: Worldwide (or your region)
4. Website: https://masterchess.live
5. Hours: 24/7
6. Logo + cover photo (use `/og-image.jpg`)
7. Publish weekly posts (tournament announcements, champion shoutouts) — they show in Google Search.

## Roadmap (not yet shipped — easy follow-ups)
- `/clubs/map` (DB columns `clubs.lat/lng/city` are already added)
- `/tournaments/map` heat layer

These can reuse the same pattern as `CommunityMap.tsx`.
