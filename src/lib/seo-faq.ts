// Sitewide FAQ used on the Home page. Powers both the visible accordion
// and the FAQPage JSON-LD schema for Google rich snippets.
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: "Is MasterChess really free?",
    a: "Yes. Online play, ratings, reviews, puzzles, tournaments and lessons are free forever. There is no paywall, no premium tier that hides features, and no ads.",
  },
  {
    q: "Do I need to sign up to play?",
    a: "No. Click Play as Guest and your first game starts in about 5 seconds. An account is only required if you want a persistent rating, friends, tournaments, or to save your match history.",
  },
  {
    q: "Can I play chess against my friend over a link?",
    a: "Yes. Open Challenge, copy your personal link (masterchess.live/vs/your-name) and send it over WhatsApp, Telegram or SMS. When your friend opens it, you both go straight into a game — no account required for either side.",
  },
  {
    q: "Is there any AI assistance or engine evaluation during human games?",
    a: "No. In human-vs-human games there is no engine eval bar, no best-move arrows and no AI hints. Reviews after the game are manual only. We take fair play seriously.",
  },
  {
    q: "What time controls are available?",
    a: "13 presets across Bullet (1+0, 2+1), Blitz (3+0, 5+0, 5+3), Rapid (10+0, 15+10), and Classical (30+0, 60+0). You can also set custom times when creating a challenge link.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. MasterChess runs in any modern mobile browser (iPhone, Android) with no app install required. You can also Add to Home Screen for an app-like icon and full-screen experience.",
  },
  {
    q: "How does the rating system work?",
    a: "We use an ELO-based system. New accounts start around 1200. Beat a stronger opponent and you gain more points; lose to a weaker one and you lose more. Separate ratings are tracked per time control (Bullet, Blitz, Rapid, Classical).",
  },
  {
    q: "Can I play chess offline against a computer?",
    a: "Yes. The bot opponents (9 personalities from 400 to 2000 ELO) run locally in your browser using Stockfish, so you can keep playing even with no internet once the page is loaded.",
  },
];
