import { Navigate } from "react-router-dom";
import SeoLanding from "@/components/SeoLanding";

const url = (s: string) => `https://masterchess.live/${s}`;

/* ----------------- /play-chess-with-friends-free ----------------- */
export function PlayChessWithFriendsFree() {
  return (
    <SeoLanding
      slug="play-chess-with-friends-free"
      metaTitle="Play Chess With Friends Free — Private Link, No Signup | MasterChess"
      metaDescription="Create a private chess link, send it to a friend, and play instantly. Free, no signup, no ads. Works on phone and desktop."
      eyebrow="Free · No signup"
      h1={<>Play chess <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">with friends</span>, instantly.</>}
      intro="Generate a private link, share it, and the board opens for both of you. No accounts, no waiting, no popups."
      bullets={[
        "One-click invite link — works in any chat app",
        "Bullet, Blitz, Rapid, Classical time controls",
        "Voice chat available in-game",
        "Full game history saved if you sign up later",
      ]}
      primaryCta={{ to: "/friends", label: "Create invite link" }}
      secondaryCta={{ to: "/play-guest", label: "Or play vs a bot first" }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Play Chess With Friends Free",
        url: url("play-chess-with-friends-free"),
        isPartOf: { "@type": "WebSite", name: "MasterChess", url: "https://masterchess.live/" },
      }}
    />
  );
}

/* ----------------- /best-free-chess-site-2026 ----------------- */
export function BestFreeChessSite2026() {
  return (
    <SeoLanding
      slug="best-free-chess-site-2026"
      metaTitle="Best Free Chess Site in 2026 — MasterChess Review"
      metaDescription="The best free chess website in 2026. No ads, no paywalls, real human play, Stockfish analysis, daily tournaments. Read why MasterChess tops the list."
      eyebrow="Updated 2026"
      h1={<>Best free chess site of <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">2026</span>.</>}
      intro="A short, honest review of what makes a chess site actually worth using in 2026 — and why MasterChess keeps showing up first."
      bullets={[
        "100% free — no ads, no paywalls, no premium tier",
        "Real human matchmaking by ELO, no bots padding the queue",
        "Free Stockfish analysis on every game",
        "Daily Arena + Swiss tournaments",
        "Built by a 13-year-old solo — every feature ships fast",
      ]}
      primaryCta={{ to: "/play-guest", label: "Try it now" }}
      secondaryCta={{ to: "/reviews", label: "Read player reviews" }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: { "@type": "WebApplication", name: "MasterChess", url: "https://masterchess.live/" },
        author: { "@type": "Person", name: "MasterChess Editorial" },
        datePublished: "2026-01-15",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        name: "Best Free Chess Site in 2026",
      }}
    />
  );
}

/* ----------------- /chess-opening-trainer-free ----------------- */
export function ChessOpeningTrainerFree() {
  return (
    <SeoLanding
      slug="chess-opening-trainer-free"
      metaTitle="Free Chess Opening Trainer — Learn Repertoires Move by Move | MasterChess"
      metaDescription="Master Ruy Lopez, Sicilian, Caro-Kann, Queen's Gambit and more with a free interactive opening trainer. Spaced repetition, Stockfish analysis, no paywall."
      eyebrow="Free training"
      h1={<>The opening trainer that's <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">actually free</span>.</>}
      intro="Pick an opening, drill it move by move, see where you went wrong with Stockfish. No subscription, no chapter limits."
      bullets={[
        "50+ openings with main lines and theory",
        "Explore mode or Train mode (you guess the moves)",
        "Built-in Stockfish for instant feedback",
        "Your repertoire is saved across devices",
      ]}
      primaryCta={{ to: "/openings", label: "Open the trainer" }}
      secondaryCta={{ to: "/learn", label: "Read opening guides" }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "MasterChess Opening Trainer",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web Browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }}
    />
  );
}

/* ----------------- /daily-chess-puzzle ----------------- */
export function DailyChessPuzzleRedirect() {
  return <Navigate to="/puzzles" replace />;
}

/* ----------------- /chess-rating-explained ----------------- */
export function ChessRatingExplained() {
  return (
    <SeoLanding
      slug="chess-rating-explained"
      metaTitle="Chess Rating (ELO) Explained — How It Works in 2026 | MasterChess"
      metaDescription="What is a chess rating? How does ELO change after a win or loss? What does 1200, 1500, 1800, 2000 mean? Clear answers, real examples."
      eyebrow="Article"
      h1={<>Chess rating, <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">finally explained</span>.</>}
      intro="A 3-minute read. What ELO actually measures, why your rating jumps after big wins, and what each tier means in 2026."
      bullets={[
        "ELO measures expected score, not raw skill",
        "Rating change = K × (actual − expected). K is usually 20–40 for online play",
        "800 = beginner · 1200 = club · 1600 = strong club · 2000 = expert · 2400+ = master",
        "Beat someone 400 points above you and you can jump 30+ points in one game",
      ]}
      primaryCta={{ to: "/rating-calculator", label: "Try the calculator" }}
      secondaryCta={{ to: "/leaderboard", label: "See the leaderboard" }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Chess Rating (ELO) Explained",
        author: { "@type": "Person", name: "Nikola Šakotić" },
        datePublished: "2026-01-10",
        dateModified: "2026-06-15",
        publisher: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
        mainEntityOfPage: url("chess-rating-explained"),
      }}
    />
  );
}

/* ----------------- /learn-chess-in-7-days ----------------- */
export function LearnChessIn7Days() {
  const steps = [
    "Day 1 — board, pieces, how they move",
    "Day 2 — checkmate, stalemate, draws",
    "Day 3 — opening principles (control center, develop pieces, castle)",
    "Day 4 — tactics: fork, pin, skewer, discovered attack",
    "Day 5 — endgame basics: K+Q vs K, K+R vs K, opposition",
    "Day 6 — your first opening (Italian Game or Queen's Gambit)",
    "Day 7 — play 5 rated games, review each one with Stockfish",
  ];
  return (
    <SeoLanding
      slug="learn-chess-in-7-days"
      metaTitle="Learn Chess in 7 Days — Free Beginner Roadmap | MasterChess"
      metaDescription="A realistic 7-day chess plan that takes you from zero to playing real rated games. Daily lesson, daily drill, daily game. Free."
      eyebrow="7-day plan"
      h1={<>Learn chess in <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">7 days</span>.</>}
      intro="One short lesson per day, one drill, one game. By day 7 you'll play your first rated game and know exactly what you did right and wrong."
      bullets={steps}
      primaryCta={{ to: "/learn", label: "Start Day 1" }}
      secondaryCta={{ to: "/play-guest", label: "Or play a game now" }}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Learn Chess in 7 Days",
          description: "A realistic 7-day chess plan for total beginners.",
          totalTime: "P7D",
          step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.split(" — ")[0], text: s })),
        },
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Learn Chess in 7 Days",
          description: "Free 7-day beginner roadmap.",
          provider: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
        },
      ]}
    />
  );
}

/* ----------------- /changelog ----------------- */
export function Changelog() {
  const releases = [
    { date: "2026-06-15", title: "Daily Spin Wheel + new SEO landings", body: "Added Daily Spin Wheel reward loop and 10+ new landing pages targeting long-tail chess search." },
    { date: "2026-06-01", title: "Voice chat in online games", body: "WebRTC P2P voice chat shipped for all online matches." },
    { date: "2026-05-20", title: "Battle Royale & Battle Pass", body: "8-player single-elim Battle Royale and 30-tier Battle Pass season system." },
    { date: "2026-05-01", title: "Clan system", body: "Clubs got tags, banner colors, weekly quests, and a top-clans leaderboard." },
    { date: "2026-04-15", title: "Bot personalities v2", body: "9 named bots from 400 to 2000 ELO with unique styles and in-game chat." },
    { date: "2026-04-01", title: "Game review (no engine bar in human play)", body: "Manual PGN replay with Clutch Moments — but no engine bar during live human games." },
  ];
  return (
    <SeoLanding
      slug="changelog"
      metaTitle="Changelog — What's New at MasterChess"
      metaDescription="A live log of new features, bug fixes, and improvements shipping on MasterChess. Updated almost weekly."
      eyebrow="Live updates"
      h1={<>What's <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">new</span>.</>}
      intro="Solo-built means fast shipping. Here's everything that landed recently."
      bullets={releases.map((r) => `${r.date} — ${r.title}: ${r.body}`)}
      primaryCta={{ to: "/", label: "Back to home" }}
      secondaryCta={{ to: "/built-by-a-kid", label: "Who builds this?" }}
      jsonLd={releases.map((r) => ({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: r.title,
        datePublished: r.date,
        author: { "@type": "Person", name: "Nikola Šakotić" },
        publisher: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
        articleBody: r.body,
        mainEntityOfPage: url("changelog"),
      }))}
    />
  );
}

/* ----------------- /alternative-to-major-chess-sites ----------------- */
export function AlternativeToMajorChessSites() {
  return (
    <SeoLanding
      slug="alternative-to-major-chess-sites"
      metaTitle="A Free Alternative to Major Chess Sites — No Ads, No Paywall | MasterChess"
      metaDescription="Looking for a chess platform without ads, without a paywall, and without 'upgrade' popups? MasterChess is the indie, player-funded alternative."
      eyebrow="The alternative"
      h1={<>An <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">indie alternative</span> to the big chess sites.</>}
      intro="Same features — online play, bots, tournaments, analysis, openings — without ads, paywalls, or upgrade nags. Built by one teenager who plays the game."
      bullets={[
        "Stockfish analysis on every game — never gated",
        "Real human matchmaking, no bot-fill",
        "Daily Arena + Swiss tournaments, free entry",
        "9 AI bot personalities from 400 to 2000 ELO",
        "Opening trainer with 50+ repertoires",
        "Player-funded only — no investors, no ads",
      ]}
      primaryCta={{ to: "/play-guest", label: "Try the alternative" }}
      secondaryCta={{ to: "/no-ads-chess", label: "Why no ads?" }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Free Alternative to Major Chess Sites",
        url: url("alternative-to-major-chess-sites"),
        isPartOf: { "@type": "WebSite", name: "MasterChess", url: "https://masterchess.live/" },
      }}
    />
  );
}
