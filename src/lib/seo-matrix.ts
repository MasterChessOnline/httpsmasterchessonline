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
