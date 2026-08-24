/**
 * Programmatic long-tail SEO matrix: every opening × every real search intent.
 *
 * Google's chess traffic is overwhelmingly long-tail: people don't search
 * "Sicilian Defense", they search "how to play the Sicilian Defense as black",
 * "Sicilian Defense traps", "best answer to the Sicilian". One landing page per
 * opening cannot rank for all of that, so each intent gets its own page with
 * its own title, angle, and interactive board — no duplicated boilerplate.
 */
import { ALL_OPENING_SLUGS, getOpeningBySlug, type OpeningSeoMeta } from "./opening-seo-meta";
import type { FaqItem } from "./seo-faq";

export interface MatrixIntent {
  slug: string;
  /** Short label for chips and internal links. */
  label: string;
  /** Query family this page targets — used in the intro line. */
  angle: string;
  title: (name: string) => string;
  description: (name: string, moves: string) => string;
  h1: (name: string) => string;
  /** Section headings + bodies, built from the opening's real data. */
  sections: (o: MatrixOpening) => { heading: string; body: string; list?: string[] }[];
  faqs: (o: MatrixOpening) => FaqItem[];
}

export interface MatrixOpening {
  slug: string;
  name: string;
  eco: string;
  category: string;
  difficulty: string;
  startingMoves: string;
  description: string;
  keyIdeas: string[];
  baseFaqs: FaqItem[];
}

function toMatrixOpening(meta: OpeningSeoMeta): MatrixOpening {
  return {
    slug: meta.slug,
    name: meta.name ?? meta.longTitle.split("—")[0].trim(),
    eco: meta.eco ?? "—",
    category: meta.category ?? "opening",
    difficulty: meta.difficulty ?? "intermediate",
    startingMoves: meta.startingMoves ?? "",
    description: meta.description ?? meta.longDescription,
    keyIdeas: meta.keyIdeas ?? [],
    baseFaqs: meta.faqs ?? [],
  };
}

export function getMatrixOpening(slug: string): MatrixOpening | null {
  const meta = getOpeningBySlug(slug);
  return meta ? toMatrixOpening(meta) : null;
}

const firstIdeas = (o: MatrixOpening, n: number) => o.keyIdeas.slice(0, n);
const sideOf = (o: MatrixOpening) =>
  /^1\.(e4|d4|c4|Nf3|b3|g3|f4)\s*$/.test(o.startingMoves.split(" ")[0] + " ") ? "white" : "either side";

export const MATRIX_INTENTS: MatrixIntent[] = [
  {
    slug: "how-to-play",
    label: "How to play",
    angle: "step-by-step first moves",
    title: (n) => `How to Play the ${n} — Move by Move`,
    description: (n, m) =>
      `Learn the ${n} step by step: the move order ${m}, what each move does, and the plan after the opening. Free interactive board.`,
    h1: (n) => `How to play the ${n}`,
    sections: (o) => [
      {
        heading: "The move order",
        body: `The ${o.name} (${o.eco}) starts with ${o.startingMoves || "the main line shown on the board"}. Play the moves on the board below — every move is legal, so you can also branch off and see what happens when your opponent deviates.`,
      },
      {
        heading: "What you are actually trying to do",
        body: o.description,
        list: firstIdeas(o, 4),
      },
      {
        heading: "The first five games you play with it",
        body: `Openings stick through repetition, not reading. Play five quick games where you always start with this move order, and only after that look up theory — you will remember the lines you personally got punished for.`,
      },
    ],
    faqs: (o) => [
      { q: `How many moves of the ${o.name} do I need to memorise?`, a: `Five to eight moves is enough at club level. Understand the plan behind them and you will find good moves when your opponent leaves theory — which happens almost every game.` },
      ...o.baseFaqs.slice(0, 2),
    ],
  },
  {
    slug: "traps",
    label: "Traps",
    angle: "tricks and common blunders",
    title: (n) => `${n} Traps — Tricks & Blunders to Avoid`,
    description: (n, m) =>
      `The traps that decide ${n} games (${m}): what to set, what to sidestep, and the moves that lose on the spot. Practise them on a live board.`,
    h1: (n) => `${n} traps and the blunders behind them`,
    sections: (o) => [
      {
        heading: "Why traps work in this opening",
        body: `Every trap in the ${o.name} exploits the same thing: a natural-looking developing move that ignores the opening's real tension. Once you know which square is the pressure point, the traps stop being memorisation.`,
        list: firstIdeas(o, 3),
      },
      {
        heading: "How to punish the greedy line",
        body: `When your opponent grabs material early in the ${o.name}, count developing moves instead of pawns. If the capture costs two tempi, open the position immediately — the extra pawn never gets to matter.`,
      },
      {
        heading: "Practise instead of memorise",
        body: `Set up the position on the board and play both sides. Falling into a trap once with your own hands teaches it better than any list.`,
      },
    ],
    faqs: (o) => [
      { q: `What is the most common blunder in the ${o.name}?`, a: `Moving the same piece twice for a small gain while the opponent develops. In ${o.eco} lines that tempo is usually worth more than a pawn.` },
      { q: `Are opening traps good for beginners?`, a: `They are good to know and bad to rely on. Learn them so you don't lose to them; win your games with development and tactics.` },
    ],
  },
  {
    slug: "for-beginners",
    label: "For beginners",
    angle: "beginner-friendly explanation",
    title: (n) => `${n} for Beginners — Simple Plan`,
    description: (n, m) =>
      `${n} explained for beginners: ${m}, in plain language, with the one plan you need and a board you can try it on right now.`,
    h1: (n) => `${n} for beginners`,
    sections: (o) => [
      {
        heading: "The one-sentence version",
        body: o.description,
      },
      {
        heading: "Your plan for the first ten moves",
        body: `Forget variations. Do these four things and you will already play the ${o.name} better than most players at your level.`,
        list: firstIdeas(o, 4),
      },
      {
        heading: "Is it too hard for you?",
        body: `This opening is rated ${o.difficulty}. If that sounds intimidating: difficulty in chess openings means "how much theory the top players know", not "how hard it is to play a decent game with it".`,
      },
    ],
    faqs: (o) => [
      { q: `Can a beginner play the ${o.name}?`, a: `Yes. Play the main move order, follow the plan above, and review your losses. Theory only matters once you meet opponents who know it.` },
      { q: `How long until it feels natural?`, a: `About twenty games. That is a weekend of blitz, not a season of study.` },
    ],
  },
  {
    slug: "best-response",
    label: "Best response",
    angle: "how to answer it",
    title: (n) => `Best Response to the ${n}`,
    description: (n, m) =>
      `What to play against the ${n} (${m}): the reliable answer, the pressure points, and a board to test the line yourself.`,
    h1: (n) => `How to answer the ${n}`,
    sections: (o) => [
      {
        heading: "Play against the plan, not the moves",
        body: `Facing the ${o.name} is easier once you know what the other side wants. Take away these ideas and the opening loses its bite.`,
        list: firstIdeas(o, 4),
      },
      {
        heading: "A setup that always works",
        body: `Control the centre, develop both knights before the queen, and castle by move eight. Against ${o.eco} structures a sound setup beats a clever one — the ${o.name} punishes greed far more than caution.`,
      },
      {
        heading: "Test it against an engine bot",
        body: `Pick a bot at your level and let it open with this line five times in a row. Repetition against the same opening is how you stop fearing it.`,
      },
    ],
    faqs: (o) => [
      { q: `What is the safest answer to the ${o.name}?`, a: `A classical central setup with quick castling. It concedes no early tactics and keeps every plan available.` },
      { q: `Do I need to know the theory to face it?`, a: `No. Knowing the opponent's plan is worth more than ten memorised moves.` },
    ],
  },
  {
    slug: "explained",
    label: "Explained",
    angle: "ideas and structure",
    title: (n) => `${n} Explained — Ideas & Pawn Structure`,
    description: (n, m) =>
      `The ${n} (${m}) explained: pawn structure, typical plans, and why strong players choose it. Interactive board included.`,
    h1: (n) => `${n} explained`,
    sections: (o) => [
      { heading: "What kind of position you get", body: o.description },
      { heading: "The plans that come out of it", body: `The structure decides the plans, and in the ${o.name} they repeat game after game.`, list: firstIdeas(o, 5) },
      {
        heading: "Where it belongs in your repertoire",
        body: `${o.eco} — a ${o.category} line rated ${o.difficulty}. If your other openings lead to quiet positions, this one gives you the sharper alternative for must-win games.`,
      },
    ],
    faqs: (o) => o.baseFaqs.slice(0, 3),
  },
  {
    slug: "vs-1200",
    label: "At 1200",
    angle: "playing it at club level",
    title: (n) => `${n} at 1200 Rating — What Matters`,
    description: (n, m) =>
      `Playing the ${n} (${m}) around 1200: the three things that actually decide these games, and what you can safely ignore.`,
    h1: (n) => `${n} around 1200 rating`,
    sections: (o) => [
      {
        heading: "What decides your games at this level",
        body: `At 1200 nobody punishes a slightly inaccurate seventh move — they punish undefended pieces. Play the ${o.name} for the structure, then win the game on tactics.`,
        list: firstIdeas(o, 3),
      },
      {
        heading: "What you can ignore for now",
        body: `Deep ${o.eco} theory, engine novelties, and anything past move ten. You will meet those lines maybe once in fifty games.`,
      },
      {
        heading: "The fastest way to gain rating with it",
        body: `Play the same opening every game for two weeks and review each loss for one minute. Familiarity beats breadth at every level below master.`,
      },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good at 1200?`, a: `Yes — it gives you a position you recognise, which is worth more than opening choice at this level.` },
      { q: `Should I switch openings if I keep losing?`, a: `Almost never. Check whether you lost in the opening or on move 25; usually it is move 25.` },
    ],
  },
  {
    slug: "vs-1600",
    label: "At 1600",
    angle: "intermediate refinement",
    title: (n) => `${n} at 1600 — Plans That Win`,
    description: (n, m) =>
      `${n} (${m}) at 1600 rating: the middlegame plans, the move-order tricks worth knowing, and where opponents go wrong.`,
    h1: (n) => `${n} at 1600 rating`,
    sections: (o) => [
      { heading: "Now the plans matter", body: `At 1600 your opponents develop properly, so games are decided by the plan after the opening.`, list: firstIdeas(o, 4) },
      {
        heading: "Move-order details worth learning",
        body: `This is the level where knowing the exact ${o.eco} move order pays off: the same position reached one tempo later is often a different game.`,
      },
      { heading: "Study loop", body: `Play it, save the game, replay your own moves without the engine, then check. Twenty reviewed games move you more than a hundred unreviewed ones.` },
    ],
    faqs: (o) => [
      { q: `How much theory do I need at 1600?`, a: `Eight to twelve moves in your main line, plus the plan. That is a realistic evening of work.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "vs-2000",
    label: "At 2000",
    angle: "advanced preparation",
    title: (n) => `${n} at 2000+ — Sharp Lines`,
    description: (n, m) =>
      `${n} (${m}) for 2000+ players: critical lines, structural nuance, and preparation that survives contact with strong opposition.`,
    h1: (n) => `${n} at 2000 and above`,
    sections: (o) => [
      { heading: "Critical lines only", body: `At this level the ${o.name} lives or dies on precise ${o.eco} theory in the sharpest branches. Everything else is transposition.`, list: firstIdeas(o, 5) },
      {
        heading: "Preparation that holds up",
        body: `Prepare structures, not move lists: one well-understood pawn formation covers a dozen move orders that a memorised line does not.`,
      },
      { heading: "Endgame consequence", body: `Every opening choice is an endgame choice. Know which endings this structure produces before you commit a repertoire to it.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} sound at master level?`, a: `Yes — ${o.eco} lines appear in top-level practice. The question is never soundness but whether it suits your style.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "as-black",
    label: "As Black",
    angle: "playing it with black pieces",
    title: (n) => `${n} as Black — Complete Guide`,
    description: (n, m) =>
      `Playing the ${n} (${m}) as Black: move order, counterplay, and the plans that give Black the initiative. Free board included.`,
    h1: (n) => `${n} as Black`,
    sections: (o) => [
      { heading: "Black's job in this opening", body: `Black's aim is not to survive but to create an imbalance worth playing for. In the ${o.name} that imbalance is structural.`, list: firstIdeas(o, 4) },
      { heading: "When to counter-attack", body: `Counterplay comes after development, not before it. Finish your kingside first, then strike where your pawns point.` },
      { heading: "Common Black mistakes", body: `Delaying castling for one more pawn move, and answering a flank attack in the centre with a flank move of your own.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good for Black?`, a: `It is one of the practical ways to unbalance the game as Black instead of playing for equality only.` },
      { q: `Can Black play for a win with it?`, a: `Yes — that is the point of an asymmetric structure. It also means passive play loses faster.` },
    ],
  },
  {
    slug: "as-white",
    label: "As White",
    angle: "playing it with white pieces",
    title: (n) => `${n} as White — Plans & Setups`,
    description: (n, m) =>
      `Playing the ${n} (${m}) as White: the setups, the initiative, and how to convert the first-move advantage into pressure.`,
    h1: (n) => `${n} as White`,
    sections: (o) => [
      { heading: "White's advantage, concretely", body: `A tempo is only an advantage while it is spent on development. In the ${o.name} White's edge is speed, so every move must add pressure.`, list: firstIdeas(o, 4) },
      { heading: "Setups that need no memorisation", body: `Two knights out, bishops on their natural diagonals, castle by move eight, then choose a side to attack based on your pawn chain.` },
      { heading: "Turning pressure into a win", body: `Trade when you are ahead in space, keep pieces on when you are ahead in development. Both mistakes throw away the opening edge.` },
    ],
    faqs: (o) => [
      { q: `Does White keep an advantage in the ${o.name}?`, a: `A small, playable one — enough to set problems, not enough to win by itself.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "practice",
    label: "Practice",
    angle: "drill it against a bot",
    title: (n) => `Practise the ${n} Free — Live Board`,
    description: (n, m) =>
      `Practise the ${n} (${m}) for free: step through the line, then play it out against a bot at your level. No account needed.`,
    h1: (n) => `Practise the ${n}`,
    sections: (o) => [
      { heading: "Drill the line first", body: `Step through the ${o.startingMoves || "main line"} on the board until you can play it without looking. Two minutes, not two hours.` },
      { heading: "Then play it for real", body: `Start a free game and open with this line. Losing with it is the fastest way to learn it — as long as you look at why.`, list: firstIdeas(o, 3) },
      { heading: "Track what you learn", body: `Create a free account and your games are saved, so you can replay the exact moment the opening went wrong.` },
    ],
    faqs: (o) => [
      { q: `Can I practise the ${o.name} without an account?`, a: `Yes — the board on this page and a free bot game need no signup. An account only adds saved games and progress.` },
      { q: `Which bot level should I pick?`, a: `One that beats you about half the time. Easier teaches nothing, harder teaches panic.` },
    ],
  },
  {
    slug: "pgn",
    label: "Moves & PGN",
    angle: "move list and notation",
    title: (n) => `${n} Moves & PGN — Main Line`,
    description: (n, m) =>
      `${n} main line in PGN and algebraic notation: ${m}. Copy the moves, replay them on the board, learn the plan.`,
    h1: (n) => `${n} — moves and notation`,
    sections: (o) => [
      { heading: "Main line", body: `${o.startingMoves || "See the board below for the main move order."} (${o.eco})` },
      { heading: "Reading the notation", body: `Each move pair is one full move: White's move, then Black's. The board below plays the same sequence so you can match notation to position while you learn it.` },
      { heading: "What comes after theory ends", body: o.description, list: firstIdeas(o, 3) },
    ],
    faqs: (o) => [
      { q: `What is the ECO code of the ${o.name}?`, a: `${o.eco}.` },
      { q: `Can I import this line into a study?`, a: `Yes — the move list on this page is standard algebraic notation, readable by any chess software.` },
    ],
  },
  {
    slug: "cheat-sheet",
    label: "Cheat sheet",
    angle: "one-page summary to memorise",
    title: (n) => `${n} Cheat Sheet — One Page Summary`,
    description: (n, m) =>
      `${n} cheat sheet: the move order ${m}, the plan, the key squares and the three moves that lose. Everything on one page.`,
    h1: (n) => `${n} cheat sheet`,
    sections: (o) => [
      { heading: "The 20-second version", body: `${o.startingMoves || "Main line on the board below"} — ${o.eco}, a ${o.category} line rated ${o.difficulty}. ${o.description}` },
      { heading: "Remember these, forget the rest", body: `If you only keep four things from this opening, keep these.`, list: firstIdeas(o, 4) },
      { heading: "Three ways players lose it", body: `Moving the queen out early, delaying castling past move ten, and trading a developed piece for an undeveloped one. All three lose more ${o.name} games than any theoretical novelty.` },
    ],
    faqs: (o) => [
      { q: `What is the fastest way to learn the ${o.name}?`, a: `Learn the move order and the single main plan, then play ten games with it. Reading more theory before that is wasted time.` },
      { q: `Can I print this cheat sheet?`, a: `Yes — the page is plain text and a board; printing keeps the move order and the plan list.` },
    ],
  },
  {
    slug: "pawn-structure",
    label: "Pawn structure",
    angle: "the structure and what it dictates",
    title: (n) => `${n} Pawn Structure — Plans It Creates`,
    description: (n, m) =>
      `The ${n} pawn structure (${m}): which files open, where to attack, and which pieces become good or bad in it.`,
    h1: (n) => `${n} pawn structure`,
    sections: (o) => [
      { heading: "The structure decides everything else", body: `Pieces come and go, pawns stay. In the ${o.name} the pawn skeleton tells you which side of the board is yours and which piece belongs on which square.`, list: firstIdeas(o, 4) },
      { heading: "Attack where your pawns point", body: `Your pawn chain points at the side you should attack. That single rule replaces most of the ${o.eco} theory at club level.` },
      { heading: "Good pieces, bad pieces", body: `A bishop blocked by your own pawn chain is not a bad piece if you can open the file it looks down. Before trading it, ask whether a pawn move can free it — in the ${o.name} it usually can.` },
    ],
    faqs: (o) => [
      { q: `What pawn structure comes out of the ${o.name}?`, a: `${o.description}` },
      { q: `Should I break in the centre or on the wing?`, a: `Break where you have more space. Central breaks are for when your opponent commits to a wing attack.` },
    ],
  },
  {
    slug: "middlegame-plans",
    label: "Middlegame plans",
    angle: "what to do after the theory ends",
    title: (n) => `${n} Middlegame Plans — After the Theory`,
    description: (n, m) =>
      `What to play after the ${n} (${m}): the standard middlegame plans, the piece placement, and how these positions are actually won.`,
    h1: (n) => `${n} middlegame plans`,
    sections: (o) => [
      { heading: "Theory ends around move eight", body: `Almost nobody loses a ${o.name} game in the opening. Games are lost on move fifteen, when a player has no plan and starts shuffling pieces.` },
      { heading: "The plans that repeat every game", body: `These are the plans that come out of this structure again and again.`, list: firstIdeas(o, 5) },
      { heading: "Choosing between two plans", body: `Count which side of the board you have more pieces aimed at, and play there. If it is even, improve your worst-placed piece — a free move is better than a random plan.` },
    ],
    faqs: (o) => [
      { q: `What do I play after the ${o.name} opening moves?`, a: `Finish development, then pick the plan the pawn structure points to. The list above covers the plans that occur in almost every game of this line.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "common-mistakes",
    label: "Common mistakes",
    angle: "the mistakes that lose these games",
    title: (n) => `${n} Common Mistakes — And the Fixes`,
    description: (n, m) =>
      `The mistakes that lose ${n} games (${m}): what club players do wrong, why it loses, and the concrete fix for each one.`,
    h1: (n) => `${n} — the mistakes that lose games`,
    sections: (o) => [
      { heading: "Mistake one: playing moves, not plans", body: `Knowing ${o.startingMoves || "the main line"} is worthless without knowing why. Fix: after every opening move, name the plan out loud before you touch the next piece.`, list: firstIdeas(o, 3) },
      { heading: "Mistake two: reacting to threats only", body: `In the ${o.name} the side that keeps making its own threats wins. Fix: before answering a threat, check whether a bigger threat of your own solves it.` },
      { heading: "Mistake three: memorising instead of reviewing", body: `Reviewing three of your own losses in this opening teaches more than thirty pages of ${o.eco} theory. Fix: replay your last loss and stop at the first move you cannot explain.` },
    ],
    faqs: (o) => [
      { q: `Why do I keep losing with the ${o.name}?`, a: `Almost always for one of the three reasons above — not because the opening is wrong for you. Review one lost game and the pattern shows immediately.` },
      { q: `Is the ${o.name} a bad opening for club level?`, a: `No. Rated ${o.difficulty}, it is fully playable at any level as long as you follow the plan rather than the move list.` },
    ],
  },
  {
    slug: "for-blitz",
    label: "For blitz",
    angle: "playing it fast online",
    title: (n) => `${n} in Blitz — Fast, Practical Lines`,
    description: (n, m) =>
      `The ${n} (${m}) in blitz and bullet: what to play on instinct, which lines cost too much time, and how to win on the clock.`,
    h1: (n) => `${n} in blitz`,
    sections: (o) => [
      { heading: "Blitz rewards structure, not theory", body: `In a 3+0 game you get about four seconds per move. The ${o.name} works in blitz because the same structure appears every time — you recognise instead of calculate.`, list: firstIdeas(o, 4) },
      { heading: "Lines to avoid when the clock is short", body: `Skip anything that needs a long forced sequence. If a line demands six accurate moves in a row, keep it for rapid and play the solid setup in blitz.` },
      { heading: "Winning on the clock, honestly", body: `Play the moves you know fast, and spend your saved time at the first unfamiliar position. Most blitz games are decided by who thinks in the right moment, not who thinks less.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good for blitz?`, a: `Yes, once the move order is automatic. Repeating one opening across many blitz games is the cheapest rating gain available.` },
      { q: `Which time control should I practise it in?`, a: `Learn it in 10+0, then move it into 3+0 once you stop thinking about the first eight moves.` },
    ],
  },
  {
    slug: "for-kids",
    label: "For kids",
    angle: "explained simply for young players",
    title: (n) => `${n} for Kids — Simple Explanation`,
    description: (n, m) =>
      `The ${n} (${m}) explained simply for kids and new players: short sentences, one plan, and a board to try it on straight away.`,
    h1: (n) => `${n} for kids and new players`,
    sections: (o) => [
      { heading: "What this opening does", body: `${o.description} That is the whole idea — everything else is detail.` },
      { heading: "Four easy rules", body: `Follow these four and the opening plays itself.`, list: firstIdeas(o, 4) },
      { heading: "Try it on the board", body: `Click through the moves above, then play a free game against a friendly bot and use the same first moves. Getting it wrong on the board is part of learning it.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} suitable for children?`, a: `Yes — the move order is short and the plan is easy to say in one sentence, which is exactly what young players need.` },
      { q: `What age can start learning openings?`, a: `As soon as a player knows how the pieces move and what checkmate is. Openings are just the first plan of the game.` },
    ],
  },
  {
    slug: "aggressive-lines",
    label: "Aggressive lines",
    angle: "sharp, attacking variations",
    title: (n) => `Aggressive ${n} Lines — Attacking Setups`,
    description: (n, m) =>
      `The sharpest ${n} lines (${m}): attacking setups, sacrifices that work, and how to keep the initiative from move one.`,
    h1: (n) => `Aggressive lines in the ${n}`,
    sections: (o) => [
      { heading: "Where the sharpness comes from", body: `Attacks in the ${o.name} are not random — they come from the same structural tension every game. Find that tension and the aggressive lines make sense.`, list: firstIdeas(o, 4) },
      { heading: "Sacrifices worth making", body: `A pawn for two tempi and an open file is a good deal. A piece for "an attack" without a concrete follow-up is how attacking players lose rating.` },
      { heading: "Keeping the initiative", body: `Every move must create a new problem. The moment you make a neutral move in a sharp ${o.eco} line, the extra material on the other side starts counting.` },
    ],
    faqs: (o) => [
      { q: `What is the most aggressive line in the ${o.name}?`, a: `The lines that break in the centre early — they open files before the opponent castles, which is where the attack comes from.` },
      { q: `Is aggressive play good at club level?`, a: `Very. Most club opponents defend worse than they attack, so pressure wins more games than accuracy does.` },
    ],
  },
  {
    slug: "famous-games",
    label: "Famous games",
    angle: "how strong players handled it",
    title: (n) => `${n} in Master Games — What to Copy`,
    description: (n, m) =>
      `How strong players handle the ${n} (${m}): the recurring ideas from master practice and which of them belong in your own games.`,
    h1: (n) => `The ${n} in master practice`,
    sections: (o) => [
      { heading: "What masters do differently here", body: `The move order is the same as yours. The difference is that a master decides the plan before the opening ends, and never spends a move without one.`, list: firstIdeas(o, 4) },
      { heading: "What to copy and what to skip", body: `Copy the piece placement and the timing of the central break. Skip the deep ${o.eco} preparation — it only matters against opponents who also prepare.` },
      { heading: "Study it the useful way", body: `Take one game in this opening, cover the moves, and guess each one. You learn more from twenty guessed moves than from a hundred watched ones.` },
    ],
    faqs: (o) => [
      { q: `Which players use the ${o.name}?`, a: `It appears regularly in ${o.category} practice at every level, from club play to elite tournaments — the plans scale, only the preparation depth changes.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "for-beginners",
    label: "For beginners",
    angle: "first-time explanations",
    title: (n) => `${n} for Beginners — Simple Explanation`,
    description: (n, m) =>
      `The ${n} explained for beginners: what ${m} does in plain words, the three rules to follow, and a free board to try it right now.`,
    h1: (n) => `${n} for complete beginners`,
    sections: (o) => [
      { heading: "In one sentence", body: `The ${o.name} (${o.eco}) is an opening where ${o.description.toLowerCase()}` },
      { heading: "Three rules that are enough at first", body: `You do not need theory to play it well at club level. Follow these and you will be fine:`, list: firstIdeas(o, 3) },
      { heading: "Try it against a bot first", body: `Play the position on the board below, then take it into a real game against a low-rated bot before you use it against a human.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good for beginners?`, a: `Yes — the moves are natural and the plans are easy to remember, which is exactly what a beginner needs from an opening.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "in-blitz",
    label: "In blitz",
    angle: "fast time controls",
    title: (n) => `${n} in Blitz — Fast, Practical Plans`,
    description: (n, m) =>
      `How the ${n} (${m}) behaves in blitz and bullet: which moves are automatic, where people lose on time, and the traps that score fastest.`,
    h1: (n) => `The ${n} in blitz`,
    sections: (o) => [
      { heading: "Why it works with a short clock", body: `In blitz you win with familiar patterns, not calculation. The ${o.name} gives you the same structures every game, so your first ten moves cost seconds.` },
      { heading: "The automatic moves", body: `Learn these as reflexes and save your clock for the middlegame:`, list: firstIdeas(o, 4) },
      { heading: "Where blitz games are lost", body: `Almost always by drifting after the opening. Decide the plan while the moves are still automatic.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good in blitz?`, a: `Yes. The move order is short and the plans repeat, which is exactly what you want when you have three minutes.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "best-response",
    label: "Best response",
    angle: "what to answer with",
    title: (n) => `Best Response to the ${n}`,
    description: (n, m) =>
      `The most practical answers to the ${n} (${m}): solid setups, sharp punishments, and how to choose between them.`,
    h1: (n) => `The best response to the ${n}`,
    sections: (o) => [
      { heading: "The solid answer", body: `Meet the ${o.name} by completing development and refusing to weaken your structure. Solid play beats preparation because your opponent's theory stops mattering.` },
      { heading: "The sharp answer", body: `If you want the initiative, strike at the centre early and accept the imbalance. This is where knowing ${o.eco} pays off.`, list: firstIdeas(o, 3) },
      { heading: "How to choose", body: `Choose by opponent: solid against stronger players, sharp against opponents who play fast and superficially.` },
    ],
    faqs: (o) => [
      { q: `What is the best answer to the ${o.name}?`, a: `There is no single refutation — the practical answers are a solid developing setup or an early central strike, both shown on this page.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "middlegame-plans",
    label: "Middlegame plans",
    angle: "what to do after the opening",
    title: (n) => `${n} Middlegame Plans — What to Do Next`,
    description: (n, m) =>
      `What to actually play after the ${n} (${m}): pawn breaks, piece routes, and the plan for each typical structure.`,
    h1: (n) => `Middlegame plans in the ${n}`,
    sections: (o) => [
      { heading: "The structure decides the plan", body: `After the ${o.name} you get recurring pawn structures. Read the structure, then pick the break that fits it.`, list: firstIdeas(o, 4) },
      { heading: "Piece routes worth memorising", body: `Most of the work is putting pieces on their best squares. In this opening those squares repeat game after game.` },
      { heading: "When to trade", body: `Trade when it removes your opponent's active piece or opens the file you already control — never just to simplify.` },
    ],
    faqs: (o) => [
      { q: `What is the plan after the ${o.name}?`, a: `Play the pawn break that matches your structure and route your worst piece to its best square — the two ideas cover most positions.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "endgames",
    label: "Endgames",
    angle: "typical endings",
    title: (n) => `${n} Endgames — The Endings It Leads To`,
    description: (n, m) =>
      `The endgames that come out of the ${n} (${m}): which pawn structures you inherit, and the technique that converts them.`,
    h1: (n) => `Typical endgames from the ${n}`,
    sections: (o) => [
      { heading: "What you inherit", body: `Openings choose your endgames. The ${o.name} (${o.eco}) tends to leave the same structures, so learning two or three endings covers most of your games.` },
      { heading: "The technique that matters", body: `Activate the king, push the pawn majority, and keep the rook behind your passed pawn. Simple rules win these positions.`, list: firstIdeas(o, 3) },
    ],
    faqs: (o) => [
      { q: `Which endgames come from the ${o.name}?`, a: `Mostly the endings dictated by its typical pawn structure — learn those few and you convert far more of your good positions.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "as-white",
    label: "As white",
    angle: "playing it with white",
    title: (n) => `How to Play the ${n} as White`,
    description: (n, m) =>
      `The ${n} from white's side (${m}): move order, the plan, and the mistakes that cost white the initiative.`,
    h1: (n) => `The ${n} as white`,
    sections: (o) => [
      { heading: "White's move order", body: `Start with ${o.startingMoves || "the main line on the board below"} and keep the extra tempo doing something useful.` },
      { heading: "White's plan", body: o.description, list: firstIdeas(o, 4) },
      { heading: "How white goes wrong", body: `By grabbing space without support. Every advance should be backed by a piece that already has a job.` },
    ],
    faqs: (o) => [
      { q: `Is the ${o.name} good for white?`, a: `It gives white a clear plan from move one, which is worth more in practical play than any small theoretical edge.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "as-black",
    label: "As black",
    angle: "playing it with black",
    title: (n) => `How to Play the ${n} as Black`,
    description: (n, m) =>
      `The ${n} from black's side (${m}): equalising ideas, counterattacks, and the practical setup that is easiest to remember.`,
    h1: (n) => `The ${n} as black`,
    sections: (o) => [
      { heading: "Black's job", body: `Black wants a safe king and one active idea. In the ${o.name} that idea is usually the central or flank counter-strike.`, list: firstIdeas(o, 3) },
      { heading: "The easiest setup to remember", body: o.description },
      { heading: "The moment to counterattack", body: `Counter when white's pieces are committed. Waiting one move too long is the most common mistake here.` },
    ],
    faqs: (o) => [
      { q: `Can black equalise in the ${o.name}?`, a: `Yes — with accurate development and a timely counter-strike, black gets a fully playable game.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "practice-online",
    label: "Practice online",
    angle: "where to train it",
    title: (n) => `Practice the ${n} Online — Free Board & Bots`,
    description: (n, m) =>
      `Train the ${n} (${m}) for free: play the moves on an interactive board, then test them against bots from 400 to 3500 rating.`,
    h1: (n) => `Practice the ${n} online`,
    sections: (o) => [
      { heading: "Train it in three steps", body: `Play the moves, then repeat them against a bot, then use it in a live game. Nothing sticks until step three.`, list: firstIdeas(o, 3) },
      { heading: "Which bot to use", body: `Start 200 points below your rating so you can focus on the plan, then move up until the ${o.name} still feels automatic under pressure.` },
    ],
    faqs: (o) => [
      { q: `Where can I practise the ${o.name} for free?`, a: `On this page — the board is interactive, and you can carry the position straight into a free game against a bot or a live opponent.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "cheat-sheet",
    label: "Cheat sheet",
    angle: "quick reference",
    title: (n) => `${n} Cheat Sheet — Moves, Plans, Traps`,
    description: (n, m) =>
      `A one-page ${n} cheat sheet: the move order ${m}, the main plans, the traps to know, and the mistakes to avoid.`,
    h1: (n) => `${n} cheat sheet`,
    sections: (o) => [
      { heading: "Move order", body: `${o.startingMoves || "See the board below"} — ${o.eco}, ${o.difficulty} level, ${o.category}.` },
      { heading: "Plans in five lines", body: `Everything that matters, short enough to remember before a game:`, list: firstIdeas(o, 5) },
      { heading: "Avoid these", body: `Moving the same piece twice without reason, delaying castling, and pushing pawns you cannot support.` },
    ],
    faqs: (o) => [
      { q: `What should I remember about the ${o.name}?`, a: `The move order, one pawn break, and one piece route. That is enough to play it well up to club level.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
  {
    slug: "explained",
    label: "Explained",
    angle: "plain-language explanation",
    title: (n) => `${n} Explained — Why the Moves Make Sense`,
    description: (n, m) =>
      `The ${n} (${m}) explained in plain language: the idea behind every move, why it is played, and what happens if you ignore it.`,
    h1: (n) => `The ${n}, explained`,
    sections: (o) => [
      { heading: "The idea", body: o.description },
      { heading: "Why each move is there", body: `Every move in the ${o.name} pays for itself — space, a developed piece, or control of a key square.`, list: firstIdeas(o, 4) },
      { heading: "What happens if you ignore it", body: `Skip the plan and the opening collapses into a random middlegame, which is where most rating points are lost.` },
    ],
    faqs: (o) => [
      { q: `Why is the ${o.name} played?`, a: `Because it converts the first moves into something concrete: development, central control, and a plan that carries into the middlegame.` },
      ...o.baseFaqs.slice(0, 1),
    ],
  },
];


export const MATRIX_INTENT_SLUGS = MATRIX_INTENTS.map((i) => i.slug);

export function getMatrixIntent(slug: string): MatrixIntent | null {
  return MATRIX_INTENTS.find((i) => i.slug === slug) ?? null;
}

/** Every generated URL — used by the sitemap generator and the index page. */
export function listMatrixPaths(): string[] {
  const out: string[] = [];
  for (const slug of ALL_OPENING_SLUGS) {
    for (const intent of MATRIX_INTENT_SLUGS) {
      out.push(`/openings/${slug}/${intent}`);
    }
  }
  return out;
}

export const MATRIX_OPENING_SLUGS = ALL_OPENING_SLUGS;
export { sideOf };
