// "Chess for {age}" programmatic SEO — long-tail queries like
// "chess for 5 year olds", "best chess for seniors" — low competition,
// high intent. Each page targets a specific age bracket with
// age-appropriate advice, recommended start path, and CTAs.
export interface AgeGuide {
  slug: string;
  age: string;            // for URL display + h1
  ageRange: string;       // longer phrasing for body
  headline: string;       // hero title
  metaTitle: string;      // <60 chars
  metaDescription: string; // <160 chars
  intro: string;
  benefits: string[];
  startHere: { label: string; href: string; reason: string }[];
  parentTip?: string;     // shown for kids brackets
  faq: { q: string; a: string }[];
}

export const AGE_GUIDES: AgeGuide[] = [
  {
    slug: "5-year-olds",
    age: "5",
    ageRange: "5-year-olds",
    headline: "Chess for 5-Year-Olds",
    metaTitle: "Chess for 5 Year Olds — Easy Start, Fun First Lessons",
    metaDescription: "Free chess for 5-year-olds: friendly bots, picture lessons, and 60-second puzzles built for tiny attention spans.",
    intro: "Five-year-olds learn chess best in 5-10 minute bursts with bright pieces, instant feedback, and a tiny win every session. MasterChess gives them all three — no ads, no chat with strangers.",
    benefits: [
      "Builds focus before school",
      "Teaches turn-taking and patience",
      "First wins boost confidence fast",
      "Recognizes patterns earlier than peers",
    ],
    startHere: [
      { label: "Play the easiest bot", href: "/play/bots", reason: "300-ELO bot lets them win — and want a rematch." },
      { label: "Solve a 1-move puzzle", href: "/puzzles", reason: "One puzzle a day. 30 seconds. Big celebration." },
      { label: "Watch piece animations", href: "/learn", reason: "Visual lessons before any rules text." },
    ],
    parentTip: "Sit next to them. Don't correct every move — let them lose small games. The goal at this age is the feeling of choosing, not winning.",
    faq: [
      { q: "Can a 5-year-old really learn chess?", a: "Yes — Magnus Carlsen started at 5. Most kids learn the moves in 2-3 sessions if they're shown, not told." },
      { q: "How long should each session be?", a: "5 to 10 minutes max. End BEFORE they get bored — they'll ask to come back." },
      { q: "Is MasterChess safe for a 5-year-old?", a: "Yes. No public chat, no strangers, no ads. Parents control everything." },
    ],
  },
  {
    slug: "7-year-olds",
    age: "7",
    ageRange: "7-year-olds",
    headline: "Chess for 7-Year-Olds",
    metaTitle: "Chess for 7 Year Olds — Lessons, Puzzles, Safe Play",
    metaDescription: "Chess for 7-year-olds done right: bite-size lessons, friendly bots, and daily puzzles that build real skill.",
    intro: "Seven is the golden age to start chess. Kids this age can hold 2-3 moves in their head and love the feeling of trapping a piece. MasterChess gives them a clear path: learn → puzzle → play → improve.",
    benefits: [
      "Improves math and reading scores (studies show)",
      "Teaches planning ahead — 2-3 moves deep",
      "Healthy screen time with real cognitive benefit",
      "First proper rating they can be proud of",
    ],
    startHere: [
      { label: "Beat the 500-ELO bot", href: "/play/bots", reason: "Achievable goal — gives them a real win in week one." },
      { label: "Daily 1-puzzle streak", href: "/puzzles", reason: "Builds the habit. 7-day streak unlocks a badge." },
      { label: "Learn forks and pins", href: "/learn", reason: "First tactics they can actually use in games." },
    ],
    parentTip: "Play with them, not just supervise. Losing to a parent who explains is the fastest learning loop at this age.",
    faq: [
      { q: "Will my 7-year-old play strangers?", a: "Only if you allow it. By default they play bots and you can disable online matches in Settings." },
      { q: "How long until they beat me?", a: "If they do daily puzzles + 2 games a day, expect them to beat a casual parent in 3-6 months." },
      { q: "Is there a leaderboard?", a: "Yes — kids can climb a rating ladder. Public rank but no public chat." },
    ],
  },
  {
    slug: "10-year-olds",
    age: "10",
    ageRange: "10-year-olds",
    headline: "Chess for 10-Year-Olds",
    metaTitle: "Chess for 10 Year Olds — Tactics, Online Play, Coaching",
    metaDescription: "Chess for 10-year-olds: tactics trainers, online matches with peers their level, and a real rating that grows with them.",
    intro: "By 10, most kids can reach 1000-1200 ELO in a year if they practice. MasterChess gives them peer matches, a tactics trainer, and the social loop (friends, badges, streaks) that keeps them coming back.",
    benefits: [
      "Joins competitive online tournaments",
      "Builds resilience — losing and trying again",
      "Develops a real chess style (aggressive, positional, sneaky)",
      "Prepares for school chess club or rated FIDE tournaments",
    ],
    startHere: [
      { label: "Daily puzzles", href: "/puzzles", reason: "Tactics are 80% of how kids win at this age." },
      { label: "Online match with peers", href: "/play/online", reason: "Real practice against humans their level." },
      { label: "Free tournaments", href: "/tournaments", reason: "Tonight Arena at 20:00 — first taste of competition." },
    ],
    faq: [
      { q: "How do I know if my child is improving?", a: "Watch the rating graph — also called ELO. Going from 600 → 1000 in a year is normal with daily practice." },
      { q: "Should they take a coach?", a: "Only after reaching ~1000 ELO. Before that, puzzles and games are enough." },
      { q: "Are MasterChess kids ratings real?", a: "Yes — based on the same Glicko-style math as international chess." },
    ],
  },
  {
    slug: "13-year-olds",
    age: "13",
    ageRange: "13-year-olds",
    headline: "Chess for 13-Year-Olds",
    metaTitle: "Chess for 13 Year Olds — Compete, Climb, Make Friends",
    metaDescription: "Chess for 13-year-olds: rated online play, weekly tournaments, opening prep, and a community that takes them seriously.",
    intro: "MasterChess was built by a 13-year-old, so we know what works at this age: real competition, no babysitter UI, and friends to play. You're old enough to crush adults — start here.",
    benefits: [
      "Compete in regional online tournaments",
      "Build an opening repertoire like a real player",
      "Make friends through clubs and team battles",
      "Stream and share games on TikTok or Instagram",
    ],
    startHere: [
      { label: "Tonight 20:00 Arena", href: "/tournaments", reason: "Daily blitz with everyone — instant friends + rating." },
      { label: "Opening trainer", href: "/openings", reason: "Pick one opening for white, one for black. Master it." },
      { label: "Beat me", href: "/beat-nikola", reason: "Challenge the 13-year-old founder. Brag if you win." },
    ],
    faq: [
      { q: "How fast can I improve?", a: "From 800 → 1500 in 6-12 months if you do daily puzzles + 5 rated games a day." },
      { q: "Can I stream my games?", a: "Yes — there's a Streamer Mode (press F) that hides distracting UI." },
      { q: "Are there teen tournaments?", a: "Tonight Arena is open to all, but expect a lot of teens — it's our biggest crowd." },
    ],
  },
  {
    slug: "16-year-olds",
    age: "16",
    ageRange: "teens (15-18)",
    headline: "Chess for Teens (15-18)",
    metaTitle: "Chess for Teens — Rated Play, Streaming, Tournaments",
    metaDescription: "Chess for teens 15-18: serious rated games, opening prep, weekend majors, and streaming-friendly tools.",
    intro: "Teen chess players want two things: real competition and ways to share their best games. MasterChess gives you both — climb to 1800+, stream in distraction-free mode, post your sharpest wins.",
    benefits: [
      "Rated games against strong opponents around the world",
      "Streamer Mode for OBS / TikTok / Twitch",
      "Weekend Major tournaments with leaderboard glory",
      "Opening explorer with master games and stats",
    ],
    startHere: [
      { label: "Find your style", href: "/style-quiz", reason: "Aggressive, positional, or tactical? 6-question quiz." },
      { label: "Weekend Major", href: "/tournaments", reason: "Friday 21:00, Saturday 14:00 + 21:00, Sunday 19:00." },
      { label: "Streamer overlay", href: "/streamer-overlay", reason: "Drop into OBS as a browser source. Zero setup." },
    ],
    faq: [
      { q: "Can I make money from chess streaming?", a: "Not easily, but a small audience opens doors — coaching, sponsorships, content deals." },
      { q: "How serious can I get?", a: "Teens reach 2000+ regularly with 2 hours of daily practice. Reaching FIDE Candidate Master from MasterChess play is realistic." },
    ],
  },
  {
    slug: "adults",
    age: "adults",
    ageRange: "adults (25-45)",
    headline: "Chess for Adults",
    metaTitle: "Chess for Adults — Learn From Scratch or Get Back In",
    metaDescription: "Chess for adults: structured lessons, time controls that fit a busy schedule, and bots calibrated to your level. No condescending UI.",
    intro: "Most adult chess sites treat you like a beginner forever. MasterChess respects your time: pick a 5-minute time control, get matched fast, see what you did wrong, improve. Or learn the rules in one calm afternoon.",
    benefits: [
      "Mental sharpness — proven to slow cognitive decline",
      "Quick games that fit a lunch break",
      "Adjustable bots — match exactly your level",
      "No teenage spam in chat — quiet, focused community",
    ],
    startHere: [
      { label: "5+0 Quick Match", href: "/play", reason: "Fits a coffee break. Get matched in seconds." },
      { label: "Adult learning path", href: "/learn", reason: "No cartoon mascots. Just clear explanations." },
      { label: "Calibrate a bot", href: "/play/bots", reason: "Set the bot to your exact ELO. Win 60% of the time." },
    ],
    faq: [
      { q: "I haven't played since school. Where do I start?", a: "Pick a 600-ELO bot, play 5 games. You'll remember the rules by game 3 and feel the patterns by game 10." },
      { q: "How much time per week to improve?", a: "30-60 minutes a day is the sweet spot. More than 2 hours hits diminishing returns for most adults." },
    ],
  },
  {
    slug: "seniors",
    age: "seniors",
    ageRange: "seniors (60+)",
    headline: "Chess for Seniors",
    metaTitle: "Chess for Seniors — Sharp Mind, Calm Pace, No Pressure",
    metaDescription: "Chess for seniors 60+: larger pieces, no chat noise, slower time controls, and a kind community. Great for daily mental exercise.",
    intro: "Chess is one of the best-studied tools for keeping the mind sharp after 60. MasterChess offers slow time controls (15+10, 30+0), large readable pieces, and a quiet, ad-free interface. Play daily — your brain will thank you.",
    benefits: [
      "Linked to slower cognitive decline in long-term studies",
      "Social — play with grandchildren or friends abroad",
      "Slow time controls — no rush, no anxiety",
      "Daily puzzles act like a mental workout",
    ],
    startHere: [
      { label: "15+10 Classical", href: "/play", reason: "Plenty of time per move. No clock pressure." },
      { label: "One daily puzzle", href: "/puzzles", reason: "Five minutes a day. That's all it takes." },
      { label: "Play a calm bot", href: "/play/bots", reason: "Bots that take their time and don't trash-talk." },
    ],
    faq: [
      { q: "Is the text large enough?", a: "Yes — and you can zoom your browser to 125% with no layout breaking. The board also scales." },
      { q: "Will I play strangers?", a: "Only if you choose. You can stay with bots forever — they're free, infinite, and patient." },
    ],
  },
  {
    slug: "beginners",
    age: "beginners",
    ageRange: "complete beginners (any age)",
    headline: "Chess for Complete Beginners",
    metaTitle: "Chess for Beginners — Learn the Rules in 10 Minutes",
    metaDescription: "Chess for beginners: learn how the pieces move, win your first game, and get a real rating — all free, all today.",
    intro: "Never moved a chess piece? Perfect — this is the cleanest start anywhere. In 10 minutes you'll know how every piece moves. In 30 minutes you'll have won your first game against a friendly bot. No signup, no ads.",
    benefits: [
      "Learn the rules with no pressure",
      "Win your first game today",
      "Earn a real rating from day one",
      "Free forever for the basics",
    ],
    startHere: [
      { label: "Play as guest", href: "/play-guest", reason: "Zero clicks. Open a game right now." },
      { label: "First lesson", href: "/learn", reason: "How each piece moves. With pictures." },
      { label: "300-ELO bot", href: "/play/bots", reason: "Designed to let beginners win their first game." },
    ],
    faq: [
      { q: "Do I need to sign up?", a: "No. Play as guest. Sign up only when you want to save your rating." },
      { q: "How long to learn the rules?", a: "10 minutes for movement, 30 minutes for full rules including castling, en passant, and promotion." },
      { q: "What if I lose every game?", a: "Drop to the easiest bot (300 ELO). It WILL let you win. From there you climb one bot at a time." },
    ],
  },
];

export const getAgeGuide = (slug: string) => AGE_GUIDES.find((g) => g.slug === slug);
