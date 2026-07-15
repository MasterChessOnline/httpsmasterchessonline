# Analytics & Verification IDs — What to Paste Where

The code is wired. You just need to paste 6 IDs (5 min work).

## 1. GA4 (Google Analytics 4)
- Get ID at https://analytics.google.com → Admin → Data Streams → Web
- Format: `G-XXXXXXXXXX`
- Add to project **Environment Variables** (Lovable → Project Settings → Env):
  - `VITE_GA4_ID = G-XXXXXXXXXX`

## 2. Meta Pixel (Facebook/Instagram Ads)
- Get ID at https://business.facebook.com → Events Manager
- Format: 15-digit number
- Env: `VITE_META_PIXEL_ID = 1234567890123456`

## 3. TikTok Pixel
- Get ID at https://ads.tiktok.com → Assets → Events
- Format: `CXXXXXXXXXXXXXXXXXXX`
- Env: `VITE_TIKTOK_PIXEL_ID = CXXXXXXXXXXXXXXXXXXX`

## 4. Bing Webmaster
- Get at https://www.bing.com/webmasters → Add Site → HTML Meta Tag method
- Copy the `content="..."` value into `index.html`:
  ```html
  <meta name="msvalidate.01" content="PASTE_HERE" />
  ```
- Also paste the GUID into `public/BingSiteAuth.xml` between `<user></user>`

## 5. Yandex Webmaster
- Get at https://webmaster.yandex.com → Add Site → Meta Tag
- Paste into `index.html`:
  ```html
  <meta name="yandex-verification" content="PASTE_HERE" />
  ```

## 6. Facebook Domain Verification (only if running Meta Ads)
- Get at Business Manager → Brand Safety → Domains → Add masterchess.live
- Paste into `index.html`:
  ```html
  <meta name="facebook-domain-verification" content="PASTE_HERE" />
  ```

## After you paste
- **Env vars (GA4/Meta/TikTok):** republish and pixels fire automatically
- **Meta tags (Bing/Yandex/FB):** click "Publish" in Lovable, then click "Verify" on each webmaster dashboard

## Verify it's working
- GA4: open https://masterchess.live in one tab, GA4 Realtime in another — you should see yourself as active user within 30s
- Meta Pixel: install [Meta Pixel Helper Chrome extension](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) — should show green
- TikTok Pixel: install [TikTok Pixel Helper](https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdmlfmiblddjfnjodalhidnn)
- Bing: bing.com/webmasters → Verify button
- Yandex: webmaster.yandex.com → Verify button

## Events already firing (via `track()` helper)
- `signup_completed` → Meta `CompleteRegistration`
- `tournament_registered` → Meta `Lead`
- `game_started` → Meta `StartTrial`
- `purchase` → Meta `Purchase`
- `pwa_installed` → Meta `Subscribe`
- Plus all UTM attribution auto-captured on first visit
