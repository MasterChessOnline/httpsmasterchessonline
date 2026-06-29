## Plan

1. **Hard reset the Home entry**
   - Remove the remaining entry risk points: no splash, no watchdog, no service-worker cache registration, no `IndexFast` path, no heavy decorative layers before Home paints.
   - Make `/` render the original Home immediately and keep lazy loading only for below-the-fold/non-critical parts.
   - Add a small internal readiness marker so we can verify Home is actually rendered, not stuck on a background.

2. **Stabilize Home performance**
   - Keep Home visible first, then delay animations/background/decorative chrome until after the first paint/idle.
   - Ensure no modal, banner, loader, or cached shell can cover the first screen.

3. **Fix DB Chess Cup Register Now flow**
   - Change every DB Cup “Register Now” button to go directly to `/dragan-brakus/register`.
   - Replace the redirect-only register page with a real registration form.
   - The form will allow: optional FIDE ID, auto lookup/autofill if available, manual first/last name if no FIDE ID, and submit.
   - If the visitor is not signed in, show a clear sign-in/register prompt and return them to the same DB Cup registration page after auth.

4. **Make registration appear in standings**
   - On submit, register the authenticated user for the DB Cup and save first name, last name, optional FIDE ID, federation/title/city/club.
   - After success, navigate to `/dragan-brakus/live` so the player can immediately see the standings list.
   - Update empty standings text to send users to `/dragan-brakus/register`, not just the landing page.

5. **Verify end-to-end**
   - Use browser verification for `/` to confirm Home renders quickly and is not blocked.
   - Verify `/dragan-brakus` Register Now opens the form.
   - Verify the form supports manual name registration and FIDE lookup path without 404.