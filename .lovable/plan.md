## Plan: P0 Entry Fix for Registered Players

1. **Rebuild the entry splash as a simple non-blocking overlay**
   - Keep the real homepage mounted underneath from the first render.
   - Splash lasts exactly 3–4 seconds, then fades out.
   - Add a hard 5-second failsafe that removes the splash and navigates to `/homepage` if needed.
   - Reset the session key version so every user gets the new clean entry once.

2. **Remove likely freeze sources on logged-in home entry**
   - Disable/delete the old logged-in entry takeover/dashboard flow (`EntryQuickDashboard`) from the entry path.
   - Prevent global logged-in overlays from mounting before the splash is fully gone.
   - Keep route loading as a small non-blocking pill, never a full-screen frozen layer.

3. **Make auth restore fully non-blocking**
   - Auth should only restore `session/user` quickly.
   - Profile, streaks, coins, notifications, ratings, invites, and homepage data must load in the background with 5-second timeouts.
   - Any failed/slow request logs the error and continues; it must never block homepage render.

4. **Protect against loops**
   - Check `useEffect` dependencies in the entry/auth/home path so `user/session/profile` updates cannot trigger infinite reload/render cycles.
   - Ensure there is only one auth listener in `AuthProvider`.
   - Ensure `/`, `/home`, and `/homepage` all render the same homepage and never bounce back to Entry/Login automatically.

5. **Add clear debug logs**
   - Log: `Entry started`, `Checking auth...`, `Auth OK`, `Homepage rendered`, `Entry finished`, `Profile loading`, `Profile skipped/loaded`.
   - Logs must be console-only and must not show user secrets.

6. **Test the exact failing case**
   - Use Playwright with the injected logged-in auth session when available.
   - Test guest load: `/` opens, splash disappears, homepage visible.
   - Test registered load: restore session, open `/`, splash disappears, homepage visible and clickable.
   - Test logout/login flow as far as the available preview auth session allows.
   - Check console for errors, redirect loops, and repeated auth listeners.

7. **Outcome**
   - Registered players can enter the site normally.
   - No screen can remain frozen on entry.
   - If backend/auth/profile is slow, homepage still opens and data fills in later.