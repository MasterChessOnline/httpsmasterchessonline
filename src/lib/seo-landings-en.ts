// English "for X / no Y" SEO landing-page configs targeting long-tail queries.
import type { SeoLandingConfig } from "@/components/SeoLandingPage";

const en = (p: string) => ({ lang: "en", path: p });
const sr = (p: string) => ({ lang: "sr", path: p });

export const EN_LANDINGS: Record<string, SeoLandingConfig> = {
  "chess-for-kids": {
    path: "/chess-for-kids",
    lang: "en",
    title: "Free Chess for Kids — Safe, Ad-Free, No Tracking | MasterChess",
    description: "A safe, ad-free chess site for kids. No third-party ads, no tracking pixels, no creepy DMs. Built so children can learn and play chess without distractions.",
    eyebrow: "Safe · Ad-free · No tracking",
    h1: "Free chess for kids — safe and ad-free",
    intro: "Most chess sites are crowded with ads, pop-ups, and tracking. MasterChess was built so kids can learn the game in a calm, distraction-free space — and parents don't have to worry about what's on the page next to the chessboard.",
    primaryCta: { label: "Play now — free", href: "/play/online" },
    secondaryCta: { label: "Start lessons", href: "/learn" },
    bullets: [
      "Zero ads, zero pop-ups",
      "No tracking pixels, no third-party scripts",
      "Friendly bots from 400 to 800 ELO for beginners",
      "Interactive lessons that teach piece movement",
      "No public chat with strangers in beginner mode",
      "Works on tablets, phones, and laptops",
    ],
    sections: [
      {
        heading: "Why we built it for kids too",
        body: "A 9-year-old should be able to open a chess site and start learning without being shown a betting ad or asked to subscribe. We don't run ad networks. We don't show banners. We don't have an algorithm pushing 'recommended for you' content.\n\nThe site looks the same for everyone — clean board, clear lessons, real opponents.",
      },
      {
        heading: "What kids can do",
        body: "Take the free beginner lessons (piece movement, basic tactics, common checkmates). Play against the weakest bots and gradually move up. Solve daily puzzles. When ready, play matched games at their level.",
      },
    ],
    faq: [
      { q: "Are there really no ads?", a: "Correct. We don't run any ad network, and we never will. The site is funded by optional cosmetic purchases for adults." },
      { q: "Does my kid need an account?", a: "No. They can play as a guest. An account only matters if you want to track their rating progress over time." },
      { q: "Is there chat?", a: "Online games have a limited quick-chat with 8 fixed messages — no free-text chat with strangers." },
    ],
    internalLinks: [
      { label: "Chess for beginners", href: "/chess-for-beginners" },
      { label: "Free online chess", href: "/free-online-chess" },
      { label: "No ads chess", href: "/chess-no-ads" },
    ],
  },

  "chess-for-beginners": {
    path: "/chess-for-beginners",
    lang: "en",
    title: "Learn Chess from Zero — Free Lessons, No Signup | MasterChess",
    description: "Start playing chess from zero with free interactive lessons. Piece movement, basic tactics, opening principles — all in under an hour. No signup required.",
    eyebrow: "From zero · Under 1 hour",
    h1: "Learn chess from zero",
    intro: "You don't need to read a book. Our interactive lessons take you from 'never played' to 'finished my first game' in under an hour. Click the pieces, see legal moves, learn by doing.",
    primaryCta: { label: "Start free lessons", href: "/learn" },
    secondaryCta: { label: "Play against easy bot", href: "/play" },
    bullets: [
      "Piece-by-piece interactive lessons",
      "Basic tactics: pins, forks, skewers",
      "Opening principles in 10 minutes",
      "Easy bots from 400 ELO",
      "Daily puzzles for practice",
      "No signup, no email, no app",
    ],
    sections: [
      {
        heading: "Your first hour",
        body: "Minutes 0-15: how each piece moves. Minutes 15-30: special moves (castling, en passant, promotion). Minutes 30-45: how to win — basic checkmate patterns. Minutes 45-60: your first game against a beginner-level bot.",
      },
      {
        heading: "What comes after",
        body: "Once you're comfortable, try the daily puzzles to sharpen tactics. Move up to a slightly harder bot. Then start playing real humans — matchmaking finds you opponents around 800 ELO to start.",
      },
    ],
    internalLinks: [
      { label: "Chess for kids", href: "/chess-for-kids" },
      { label: "Free online chess", href: "/free-online-chess" },
    ],
  },

  "chess-no-signup": {
    path: "/chess-no-signup",
    lang: "en",
    title: "Play Chess Online — No Signup Required | MasterChess",
    description: "Play chess online without signing up. No email, no password, no verification. Click 'Play as guest' and start a game in 5 seconds on MasterChess.",
    eyebrow: "Zero friction · Play as guest",
    h1: "Play chess online — no signup",
    intro: "Most chess sites force you to create an account before your first game. MasterChess doesn't. Click Play as Guest and you're in a real match in 5 seconds.",
    hreflang: [en("/chess-no-signup"), sr("/sr/sah-bez-registracije")],
    primaryCta: { label: "Play as guest", href: "/play-guest" },
    secondaryCta: { label: "Play vs friend", href: "/play-chess-vs-friend" },
    bullets: [
      "No email, no password, no OTP",
      "No phone verification",
      "No app to install",
      "Your data isn't stored",
      "Real-time matchmaking still works",
      "Optional signup later for rating tracking",
    ],
    sections: [
      {
        heading: "What you give up as a guest",
        body: "Without an account, your ELO rating doesn't persist between sessions, and game history is local-only. That's it. Everything else — matchmaking, bot games, review, friend links — works exactly the same.",
      },
      {
        heading: "When to sign up",
        body: "If you want to keep your rating, climb the leaderboard, join tournaments, or unlock cosmetic piece sets — sign up takes one click with Google. No email verification required.",
      },
    ],
    internalLinks: [
      { label: "Free online chess", href: "/free-online-chess" },
      { label: "No ads chess", href: "/chess-no-ads" },
    ],
  },

  "chess-no-ads": {
    path: "/chess-no-ads",
    lang: "en",
    title: "Free Chess with No Ads, No Tracking | MasterChess",
    description: "Play chess online with zero ads, zero pop-ups, zero tracking pixels. MasterChess is ad-free by design — no banners, no auto-play videos, no third-party trackers.",
    eyebrow: "Zero ads · Zero tracking",
    h1: "Chess with no ads. No tracking.",
    intro: "Other free chess sites bury the board under banner ads, video pre-rolls, and 'upgrade to Premium' nags. MasterChess does none of that. You see the board, the pieces, and your opponent. That's it.",
    primaryCta: { label: "Play now — free", href: "/play/online" },
    secondaryCta: { label: "Read our pledge", href: "/fair-play" },
    bullets: [
      "No banner ads, no video ads",
      "No tracking pixels (Meta, Google Ads, etc.)",
      "No third-party analytics on game pages",
      "No 'upgrade now' interruptions",
      "No dark patterns",
      "Funded by optional cosmetic purchases",
    ],
    sections: [
      {
        heading: "How is this free, then?",
        body: "Optional cosmetic upgrades — premium piece sets, board themes, and a few QoL features — fund the platform. Nobody is required to buy anything to play, study, or compete. The free experience is the real product.",
      },
      {
        heading: "What 'no tracking' actually means",
        body: "We don't load Facebook Pixel, Google Ads conversion tags, or third-party retargeting scripts. Basic anonymous analytics (page views) exist for understanding what's broken — that's it.",
      },
    ],
    internalLinks: [
      { label: "Chess for kids", href: "/chess-for-kids" },
      { label: "Chess no signup", href: "/chess-no-signup" },
      { label: "Free online chess", href: "/free-online-chess" },
    ],
  },

  "play-chess-vs-friend": {
    path: "/play-chess-vs-friend",
    lang: "en",
    title: "Play Chess vs Friend via Link (1 Click) — MasterChess",
    description: "Send a friend a link on WhatsApp and play chess together in 10 seconds. No app, no signup, no friend request. Free on MasterChess.",
    eyebrow: "1 link · 0 signup",
    h1: "Play chess vs a friend — over a link",
    intro: "Generate a link like masterchess.live/vs/your-name, drop it in a WhatsApp/Telegram/SMS chat, and play. No app to install. No 'send friend request' dance.",
    hreflang: [en("/play-chess-vs-friend"), sr("/sr/sah-protiv-prijatelja")],
    primaryCta: { label: "Make a challenge link", href: "/viral" },
    secondaryCta: { label: "Play random opponent", href: "/play/online" },
    bullets: [
      "1 click — link is ready",
      "Friend clicks → game starts",
      "Neither of you needs an account",
      "Works on any device with a browser",
      "Choose time control together in lobby",
      "Rematch over the same link",
    ],
    sections: [
      {
        heading: "How it works",
        body: "1. Open the Viral / Challenge page.\n2. Type your name (or use a random code).\n3. Tap 'Copy link' and paste into WhatsApp/Telegram/iMessage.\n4. When your friend taps the link, it drops them straight into a game lobby with you.",
      },
      {
        heading: "Why a link beats friend requests",
        body: "Matchmaking is great when you want any opponent at your level. But when you want to play a *specific* person — your cousin in another city, a coworker, that one classmate — a link is the fastest path. No usernames to look up, no 'are you online' guessing.",
      },
    ],
    internalLinks: [
      { label: "Chess no signup", href: "/chess-no-signup" },
      { label: "Free online chess", href: "/free-online-chess" },
    ],
  },

  "free-online-chess": {
    path: "/free-online-chess",
    lang: "en",
    title: "Free Online Chess — Play 24/7, No Limits | MasterChess",
    description: "Play free online chess against real players, 24/7. Bullet, Blitz, Rapid, and Classical. No ads, no signup required, no daily limit. Free forever on MasterChess.",
    eyebrow: "Free forever · No limits",
    h1: "Free online chess",
    intro: "MasterChess is free, real, and ad-free. Play as many games as you want, against real humans, in 13 time controls — from 1-minute bullet to 60-minute classical. No limits, no premium gating.",
    hreflang: [en("/free-online-chess"), sr("/sr/sah-online")],
    primaryCta: { label: "Play now", href: "/play/online" },
    secondaryCta: { label: "Play as guest", href: "/play-guest" },
    bullets: [
      "Free forever — no paywall",
      "No daily game limit",
      "Real humans, no engine assistance",
      "13 time controls",
      "ELO rating + leaderboard",
      "Free post-game review",
    ],
    sections: [
      {
        heading: "What 'free' usually means elsewhere",
        body: "On most chess platforms, 'free' means 3 puzzles per day, locked openings book, and ads everywhere. On MasterChess, free is the actual product. The paid stuff is purely cosmetic — fancier piece sets and board themes for people who want them.",
      },
      {
        heading: "Why no daily limit",
        body: "Limiting how many puzzles or games you can play would be terrible product design. You're here to play chess. We don't make money by stopping you.",
      },
    ],
    faq: [
      { q: "Will free always include everything?", a: "Yes. Gameplay, ratings, tournaments, lessons, puzzles — all stay free. Only cosmetic items are paid." },
      { q: "Do I need an app?", a: "No. The site works in any modern browser, mobile or desktop. There's also an optional PWA install." },
      { q: "How do you make money?", a: "Optional cosmetic purchases — piece sets and board themes — fund development. No ads, no data sales." },
    ],
    internalLinks: [
      { label: "No ads chess", href: "/chess-no-ads" },
      { label: "Chess no signup", href: "/chess-no-signup" },
      { label: "Play vs friend", href: "/play-chess-vs-friend" },
    ],
  },
};
