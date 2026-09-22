# MasterChess — Google Play Store Submission

Use this checklist to publish MasterChess as an Android app.

## 1. Accounts

1. Open Google Play Console: https://play.google.com/console
2. Create a developer account.
3. Pay Google's one-time developer fee.
4. Complete identity verification.

## 2. App identity

- App name: `MasterChess`
- Package name / app ID: `live.masterchess.app`
- Category: `Game` → `Board`
- Tags: `Chess`, `Board`, `Strategy`, `Education`
- Default language: `English`
- Website: `https://masterchess.live`
- Contact email: use the official MasterChess support email.

## 3. Store listing copy

### Short description

Free online chess: play instantly, train endgames, solve puzzles, join tournaments and challenge friends.

### Full description

MasterChess is a free chess app built for fast play and real improvement.

Play a game instantly, challenge friends, train against bots, solve daily puzzles, practise endgames and join tournaments from your phone.

What you can do:

- Play chess instantly with no subscription.
- Play online games and invite friends with a link.
- Practise against beginner-to-advanced bots.
- Train practical endgames.
- Solve daily chess puzzles.
- Join tournaments and track your rating.
- Review games and learn from your mistakes.
- Build your profile, streaks, coins and achievements.

MasterChess focuses on real play, fair games and a clean mobile experience.

## 4. Required graphics

Create these before upload:

- App icon: 512×512 PNG, already available as `public/app-icon-512.png`.
- Feature graphic: 1024×500 PNG or JPG.
- Phone screenshots: at least 2, recommended 6–8.
- Recommended screenshots: home screen, instant play, bot game, endgame trainer, puzzles, tournaments, profile.

## 5. Privacy and policy

Use these answers in Play Console:

- Ads: No.
- Paid features: No subscription required for play.
- Account creation: Yes, optional for saving rating/profile.
- Data collected: account email/profile details only when the user creates an account; gameplay data for ratings and history.
- Data shared with third parties: No sale of user data.
- Child-directed app: Do not mark as primarily child-directed unless you are ready for Google Families rules.

Privacy policy URL:

`https://masterchess.live/privacy`

## 6. Build the Android app

Run locally on a real development computer, not inside Lovable:

```bash
bun install
bun run build
npx cap sync android
npx cap open android
```

In Android Studio:

1. Open `Build` → `Generate Signed App Bundle / APK`.
2. Choose `Android App Bundle`.
3. Create or select a release signing key.
4. Build the `.aab` file.
5. Upload the `.aab` to Play Console.

## 7. Release path

1. Create the Play Console app.
2. Fill Store listing.
3. Upload screenshots and feature graphic.
4. Fill Data safety.
5. Fill Content rating.
6. Add Privacy Policy URL.
7. Create an Internal testing release first.
8. Install it on your phone and test: open app, play guest game, sign up/login, play bot, open tournament page.
9. Promote to Production after the internal test is clean.

## 8. Final pre-submit checks

- `https://masterchess.live` opens correctly on Android Chrome.
- Login and signup work.
- Guest play works without account.
- Bot games work.
- Tournaments open without broken Dragan Brakus Cup links.
- Privacy page and contact page are reachable.
- The app icon appears correctly.
- No fake player counts or fake activity are shown.