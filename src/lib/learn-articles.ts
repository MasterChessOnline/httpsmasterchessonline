// SEO long-tail content articles. Slugs target high-volume Google chess queries
// surfaced via Semrush keyword research (e.g. "how to play chess" = 40,500/mo).

export interface ArticleSection {
  heading: string;
  body: string; // plain text paragraphs separated by "\n\n"
}

export interface ArticleStep {
  name: string;
  text: string;
}

export interface LearnArticle {
  slug: string;
  title: string;          // <60 chars, contains primary keyword
  metaDescription: string; // <160 chars
  h1: string;
  keyword: string;        // primary target keyword
  intro: string;
  steps?: ArticleStep[];   // for HowTo schema
  sections: ArticleSection[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  updated: string;        // ISO date
}

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "how-to-play-chess",
    title: "How to Play Chess — Rules for Beginners (2026 Guide)",
    metaDescription: "Learn how to play chess from scratch: piece moves, special rules, check, checkmate and how to win. Beginner-friendly guide with a free online board.",
    h1: "How to Play Chess — A Complete Beginner's Guide",
    keyword: "how to play chess",
    intro: "Chess is a two-player strategy game played on an 8×8 board with 16 pieces per side. The goal is to checkmate the opponent's king — to put it under attack with no legal escape. This guide walks you through the entire ruleset in about ten minutes, then lets you jump straight into a free online game against a bot.",
    steps: [
      { name: "Set up the board", text: "Place the board so each player has a light square on the bottom-right corner. Pawns go on the second rank. Rooks in the corners, knights next to them, bishops, then queen on her color (white queen on a light square, black queen on a dark square), and king on the remaining square." },
      { name: "Learn how each piece moves", text: "Pawns move forward one square (two on the first move) and capture diagonally. Rooks move in straight lines. Bishops move diagonally. The queen combines rook and bishop. Knights jump in an L-shape. The king moves one square in any direction." },
      { name: "Understand special moves", text: "Castling (king and rook swap to safety), en passant (a pawn capture immediately after an opposing pawn's two-square advance), and promotion (a pawn that reaches the last rank becomes any piece, usually a queen)." },
      { name: "Recognize check and checkmate", text: "When the king is attacked, that's check — you must respond. If there's no legal way to stop the attack, that's checkmate and the game ends." },
      { name: "Play your first game", text: "Open the free MasterChess board, choose a beginner bot, and play. Use the analysis afterwards to see your blunders and best moves." },
    ],
    sections: [
      {
        heading: "Why chess is worth learning in 2026",
        body: "Chess sharpens pattern recognition, calculation and emotional control. It's the only mainstream game where a child can beat a world champion if they outplay them — pure skill, no luck. Online chess has exploded since 2020 thanks to streamers and Netflix, and the ecosystem is bigger than ever. Best part: it's free to play forever, and you only need a browser.",
      },
      {
        heading: "The objective: checkmate",
        body: "You don't have to capture the king — you only have to make sure it can never escape an attack. Stalemate (no legal moves but not in check) is a draw, so a beginner trick is to keep an escape square for the losing side. Mating patterns like the back-rank mate, the smothered mate, and the two-rook ladder are the first ones to memorize.",
      },
      {
        heading: "First-move principles",
        body: "Control the center with a pawn (e4 or d4), develop knights before bishops, castle within the first ten moves to protect your king, and connect your rooks. Don't move the same piece twice in the opening unless you have to. These four rules alone beat 95% of casual opponents.",
      },
      {
        heading: "Practice plan for your first 30 days",
        body: "Play 3 games per day against a 600-rated bot, then review each game with the engine. After a week, increase to 800. By day 30 you should comfortably handle a 1000 bot and recognize a back-rank mate from across the room.",
      },
    ],
    faqs: [
      { q: "Is chess hard to learn?", a: "The rules take 10 minutes. Becoming good takes years, but you'll enjoy your first wins on day one." },
      { q: "Can I play chess online for free?", a: "Yes. MasterChess and similar platforms offer unlimited free games against people or bots, no signup required to try." },
      { q: "What's the best age to start chess?", a: "Kids can grasp the rules around age 4–5. Adults can start at any age — many strong amateurs began after 30." },
      { q: "How long is a chess game?", a: "Anywhere from 1 minute (bullet) to over 6 hours (classical). Most online games last 10–15 minutes." },
    ],
    relatedSlugs: ["how-to-set-up-chess-board", "how-to-castle-in-chess", "play-chess-online-with-friends"],
    updated: "2026-05-14",
  },
  {
    slug: "how-to-set-up-chess-board",
    title: "How to Set Up a Chess Board (Correct Way + Diagram)",
    metaDescription: "Set up a chess board the correct way: light square on the right, queen on her color, pawns on the second rank. Quick visual guide with a free online board.",
    h1: "How to Set Up a Chess Board Correctly",
    keyword: "how to set up a chess board",
    intro: "Almost every beginner sets the chess board up wrong at least once — usually by flipping the king and queen, or by orienting the board with a dark square on the right. This 60-second guide fixes that for life, then drops you into a free online setup to practice.",
    steps: [
      { name: "Light square on the right", text: "Rotate the board so each player has a light (white) square on their bottom-right corner. Remember the rhyme: 'light on right'." },
      { name: "Pawns on the second rank", text: "Place all 8 pawns of each color on the second row from that player. They form the front wall." },
      { name: "Rooks in the corners", text: "Both rooks (the castle-shaped pieces) go on the corners of the back rank." },
      { name: "Knights next to the rooks", text: "Place the knights (horse-shaped pieces) just inside the rooks." },
      { name: "Bishops next to the knights", text: "Place the bishops just inside the knights, flanking the central two squares." },
      { name: "Queen on her color", text: "White queen on the light central square, black queen on the dark central square. Mnemonic: 'queen on color'." },
      { name: "King on the last square", text: "The king takes the remaining central square. Kings face each other across the board." },
    ],
    sections: [
      {
        heading: "Why orientation matters",
        body: "If the board is rotated 90°, every move you learn from a book or video will be mirrored. Squares like e4 won't exist where they should. Tournament organizers will also stop the clock and reset the board, which is embarrassing on round one.",
      },
      {
        heading: "Common setup mistakes",
        body: "1) Swapping king and queen — fix with the 'queen on color' rule. 2) Board flipped to dark-on-right — fix with 'light on right'. 3) Bishops on the wrong central diagonal because the king and queen are swapped — both errors at once. Check your setup against any starting position on MasterChess before move one.",
      },
      {
        heading: "Setting up an analog vs. an online board",
        body: "Online, the board orients itself — you only worry about which color you're playing. Offline, run through this checklist every time, especially under tournament pressure where small mistakes cost games.",
      },
    ],
    faqs: [
      { q: "Does white always go first in chess?", a: "Yes, white moves first. This gives a small but measurable advantage at every level." },
      { q: "Which square does the queen go on?", a: "The queen always starts on her own color: white queen on a light square, black queen on a dark square." },
      { q: "Is there a light square in the bottom-right corner?", a: "Yes — that's how you know the board is oriented correctly. If you see a dark square there, rotate the board 90°." },
    ],
    relatedSlugs: ["how-to-play-chess", "how-to-castle-in-chess"],
    updated: "2026-05-14",
  },
  {
    slug: "how-to-castle-in-chess",
    title: "How to Castle in Chess — Rules, Kingside &amp; Queenside",
    metaDescription: "Learn how to castle in chess: kingside vs queenside, the four conditions, and when to castle early or delay. Free interactive board to practice.",
    h1: "How to Castle in Chess (Without Breaking the Rules)",
    keyword: "how to castle in chess",
    intro: "Castling is the only move in chess that lets you move two pieces at once. It's also the single most useful tool for keeping your king safe — and the move beginners most often skip or mis-execute. Here's everything you need to know in under five minutes.",
    steps: [
      { name: "Confirm neither the king nor the chosen rook has moved", text: "Castling is forbidden once the king has moved, or once the involved rook has moved. The other rook can still castle." },
      { name: "Clear all squares between the king and rook", text: "There must be no pieces between them. For kingside that's two squares (f1, g1); for queenside that's three (b1, c1, d1)." },
      { name: "Make sure you are not in check", text: "You cannot castle out of check. Resolve the check first, then castle later." },
      { name: "Check the squares the king crosses are not attacked", text: "The king cannot pass through or land on a square attacked by an enemy piece. The rook is allowed to cross attacked squares." },
      { name: "Move the king two squares toward the rook, then jump the rook to the king's other side", text: "On a digital board, drag the king two squares — the rook moves automatically." },
    ],
    sections: [
      {
        heading: "Kingside vs queenside castling",
        body: "Kingside (short) castling lands the king on g1/g8 and is faster and safer because only two squares clear. Queenside (long) castling lands the king on c1/c8 and the rook on d1/d8 — slower, but the rook lands in the center, which is an advantage in open positions.",
      },
      {
        heading: "When to castle early",
        body: "Castle within the first 10 moves in almost every opening except very specific theoretical lines. A king stranded in the center invites tactical disasters: pinned bishops, exposed queens, and tactics that swing games in three moves.",
      },
      {
        heading: "When to delay castling",
        body: "If your opponent has castled into a weak king position, sometimes it pays to keep your king flexible and attack first. This is advanced territory — under 1500 ELO, just castle early.",
      },
    ],
    faqs: [
      { q: "Can you castle through check?", a: "No. The king cannot pass through or land on a square attacked by an enemy piece." },
      { q: "Can you castle if your rook is attacked?", a: "Yes. Only the king's path matters, not the rook's." },
      { q: "Can you castle out of check?", a: "No. You must resolve the check first." },
      { q: "Is castling kingside or queenside better?", a: "Kingside is generally safer; queenside puts the rook in the center but exposes the king more. Choose based on the pawn structure." },
    ],
    relatedSlugs: ["how-to-play-chess", "how-to-set-up-chess-board"],
    updated: "2026-05-14",
  },
  {
    slug: "play-chess-online-with-friends",
    title: "Play Chess Online With Friends — Free, No Signup",
    metaDescription: "Play chess online with friends free in your browser. Share a link, choose a time control, and start playing. No download, no signup required.",
    h1: "Play Chess Online With Friends — Free in Your Browser",
    keyword: "play chess online with friends",
    intro: "You don't need an app or an account to play chess online with a friend. MasterChess lets you create a private game, copy the invite link, and start playing in under 30 seconds. Pick a time control, share the URL, and it's on.",
    steps: [
      { name: "Open the Play page", text: "Go to /play on MasterChess." },
      { name: "Choose 'Play a friend'", text: "Pick a time control (Bullet 1+0, Blitz 5+0, Rapid 10+0, or custom)." },
      { name: "Copy the invite link", text: "MasterChess generates a unique private link for the match." },
      { name: "Send it to your friend", text: "Drop the link in WhatsApp, Discord, Telegram, iMessage — whatever you use." },
      { name: "Play when they join", text: "The game starts as soon as your friend opens the link. Voice or video chat alongside if you want." },
    ],
    sections: [
      {
        heading: "Why play online instead of in person",
        body: "Online chess automatically enforces all the rules (no illegal moves), keeps your time, records every move for analysis, and works across time zones. Your phone or laptop is enough — no board to pack.",
      },
      {
        heading: "Best time controls for friend games",
        body: "Blitz 5+0 is the sweet spot — fast enough to keep things lively, slow enough to think. For absolute beginners, try Rapid 10+0 so neither of you flags. For seasoned blitz players, try Bullet 1+0 for chaos.",
      },
      {
        heading: "How to play chess with friends on a phone",
        body: "MasterChess is fully responsive — the same link works on iPhone, Android, and desktop. Drag the pieces with your finger, tap to move, or use long-press for a precise drag.",
      },
    ],
    faqs: [
      { q: "Do I need an account to play with a friend?", a: "No. The link works for guests. Sign up only if you want your rating and history saved." },
      { q: "Is it free to play chess online with friends?", a: "Yes, fully free, unlimited games, no ads on the board." },
      { q: "Can I play with my friend on a different device?", a: "Yes — desktop, iPhone, Android, tablet all work through the same shared link." },
      { q: "Can we voice chat during the game?", a: "MasterChess supports text chat. For voice, use Discord, WhatsApp, or FaceTime alongside." },
    ],
    relatedSlugs: ["how-to-play-chess", "how-to-castle-in-chess"],
    updated: "2026-05-14",
  },
];

export const getArticleBySlug = (slug: string) =>
  LEARN_ARTICLES.find((a) => a.slug === slug) ?? null;
