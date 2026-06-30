Plan:

1. Make the queen entry splash the only startup overlay
- Keep the MASTERCHESS queen/crown splash visible for 3–4 seconds.
- Ensure it always completes its fade-out and removes itself.
- Do not show Safe Entry Mode or any fallback safe-home screen.

2. Remove the frozen blue route-loading screen on homepage entry
- Change the global route loading fallback so it does not cover the homepage with a full-screen gradient/background.
- On `/`, render the real homepage underneath the splash immediately.
- If a lazy route is loading elsewhere, use a small non-blocking loader instead of a full-screen frozen screen.

3. Harden homepage boot so it cannot stay blank after splash
- Keep `/` and `/home` routed directly to the normal full homepage.
- Remove leftover startup timeout/watchdog constants/logics that can cause unwanted fallback behavior.
- Keep only lightweight debug logs for entry steps if needed, but no UI fallback takeover.

4. Verify the exact flow
- Open `/` fresh.
- Confirm first screen is the queen MASTERCHESS splash.
- Wait 3–4 seconds.
- Confirm homepage appears immediately with navbar, DB Cup banner, and hero content.
- Confirm no “Safe Entry Mode” and no blue frozen screen remains.