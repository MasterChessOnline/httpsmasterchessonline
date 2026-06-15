import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Daily Note from Nikola — rotates content deterministically per day */
/* ------------------------------------------------------------------ */

interface DailyEntry {
  title: string;
  body: string;          // 2-3 sentences, first-person, kid-of-13 voice
  takeaway: string;      // single-line moral
  // FEN that the user can jump straight into Analysis with.
  fen: string;
  illustration: "knight" | "king" | "pawn" | "queen" | "rook" | "bishop";
}

// A small library — enough to rotate for ~3 weeks. Each entry is hand-written
// in the same voice as the FounderNote so the site feels like one person, not
// a content farm. Days cycle deterministically.
const ENTRIES: DailyEntry[] = [
  {
    title: "the move I was scared to play",
    body: "Last weekend I had Nxf7 on the board and I sat there for four whole minutes. My hand was literally shaking. Turns out it was the best move — but more importantly, even if it wasn't, the position was so good I would've been fine anyway.",
    takeaway: "fear is usually louder than the position.",
    fen: "r1bqk2r/pppp1Bpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    illustration: "knight",
  },
  {
    title: "why I stopped reading openings",
    body: "I used to memorize 20 moves of the Italian. Then I'd play someone who deviated on move 4 and I was completely lost. I still know main lines, but now I spend 80% of my time on middlegames instead. My rating jumped 200 points.",
    takeaway: "openings get you to move 10. middlegames win the game.",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    illustration: "bishop",
  },
  {
    title: "the endgame nobody teaches",
    body: "King and pawn versus king. Sounds boring, right? It's not. The whole game can come down to one tempo. I lost a winning rapid game last month because I didn't know about 'opposition'. So I learned it. Now I win those.",
    takeaway: "one endgame can change your whole rating.",
    fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    illustration: "king",
  },
  {
    title: "blunder of the week (mine)",
    body: "I dropped my queen in a 5+0 blitz because I was checking the chat. The opponent typed 'thanks' and I almost cried. But — I watched the game back, found the exact second I got distracted, and turned off chat for blitz. Haven't blundered like that since.",
    takeaway: "every blunder is just data if you actually look at it.",
    fen: "rnb1kbnr/pp1ppppp/8/q1p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
    illustration: "queen",
  },
  {
    title: "pawn play feels like math",
    body: "Pawn structures used to confuse me. Then someone showed me that pawn chains point in a direction — you attack where they point. Suddenly French, Caro-Kann, Sicilian — they all made sense.",
    takeaway: "follow the arrows your pawns are pointing.",
    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    illustration: "pawn",
  },
  {
    title: "the rook on the 7th",
    body: "My coach once told me: 'a rook on the 7th rank is worth almost a pawn'. I didn't believe him. Then I started looking for 7th-rank rooks every game. Now I win endgames I used to draw.",
    takeaway: "the 7th rank is a free promotion most of the time.",
    fen: "8/2R2pkp/6p1/8/8/6P1/5PKP/8 w - - 0 1",
    illustration: "rook",
  },
  {
    title: "I'm 13 and I built this",
    body: "Sometimes I get nervous that the site has bugs. Then I remember — every big site was buggy at the start. Every weekend I fix something. If you find something broken, tell me, I genuinely fix it that night.",
    takeaway: "shipping > perfect.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    illustration: "knight",
  },
];

/** UTC-day index → deterministic entry. */
function todaysEntry(): DailyEntry {
  const now = new Date();
  const dayNum = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      (1000 * 60 * 60 * 24),
  );
  return ENTRIES[dayNum % ENTRIES.length];
}

function PieceDoodle({ kind }: { kind: DailyEntry["illustration"] }) {
  // Tiny SVG doodles — same gold ink, slightly imperfect, on a soft card.
  const stroke = "hsl(var(--primary))";
  const sw = 1.4;
  const common = { fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const inner: Record<DailyEntry["illustration"], JSX.Element> = {
    knight: (
      <g {...common}>
        <path d="M22 60 L22 50 Q22 30 36 24 Q30 18 36 12 Q44 18 50 26 Q60 36 56 50 L56 60 Z" />
        <circle cx="40" cy="22" r="1.5" fill={stroke} stroke="none" />
        <path d="M18 64 L60 64" strokeWidth={2} />
      </g>
    ),
    king: (
      <g {...common}>
        <path d="M36 8 L36 18 M30 13 L42 13" />
        <path d="M22 32 Q36 20 50 32 L52 56 L20 56 Z" />
        <path d="M20 60 L52 60" strokeWidth={2} />
      </g>
    ),
    queen: (
      <g {...common}>
        <path d="M20 22 L26 14 L30 26 L36 12 L42 26 L46 14 L52 22 L48 50 L24 50 Z" />
        <circle cx="20" cy="22" r="2" fill={stroke} stroke="none" />
        <circle cx="52" cy="22" r="2" fill={stroke} stroke="none" />
        <path d="M20 54 L52 54" strokeWidth={2} />
      </g>
    ),
    rook: (
      <g {...common}>
        <path d="M22 18 L22 26 L28 26 L28 20 L36 20 L36 26 L44 26 L44 20 L52 20 L52 26 L58 26 L58 18 Z" />
        <path d="M26 30 L54 30 L54 52 L26 52 Z" />
        <path d="M22 56 L58 56" strokeWidth={2} />
      </g>
    ),
    bishop: (
      <g {...common}>
        <circle cx="36" cy="14" r="3" />
        <path d="M36 18 Q22 30 26 50 L46 50 Q50 30 36 18 Z" />
        <path d="M30 38 L42 38" />
        <path d="M22 54 L50 54" strokeWidth={2} />
      </g>
    ),
    pawn: (
      <g {...common}>
        <circle cx="36" cy="20" r="6" />
        <path d="M26 50 Q36 30 46 50 Z" />
        <path d="M22 54 L50 54" strokeWidth={2} />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-[0_0_8px_hsl(var(--primary)/0.35)]">
      {inner[kind]}
    </svg>
  );
}

export default function DailyNote() {
  const entry = todaysEntry();
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-10 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/12 via-background/40 to-amber-400/8 p-5 sm:p-7"
    >
      {/* corner stamp */}
      <div className="absolute -top-2 -right-2 rotate-6 select-none rounded-md border border-primary/40 bg-card/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">
        new today
      </div>

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary/90 mb-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Note from Nikola · {dateLabel}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="shrink-0 rounded-xl border border-border/50 bg-card/50 p-2">
          <PieceDoodle kind={entry.illustration} />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight"
            style={{ fontFamily: "Caveat, ui-sans-serif, system-ui" }}
          >
            {entry.title}
          </h2>
          <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-3">
            {entry.body}
          </p>
          <p
            className="text-base text-primary mb-4"
            style={{ fontFamily: "Caveat, ui-sans-serif, system-ui" }}
          >
            — {entry.takeaway}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/analysis?fen=${encodeURIComponent(entry.fen)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-md shadow-primary/30 hover:shadow-primary/60 hover:scale-[1.03] transition-all"
            >
              Try this position
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              more notes
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
