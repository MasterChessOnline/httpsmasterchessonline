// Curated GM-level training positions.
// Each position belongs to a training mode and ships with a "best move" (UCI)
// plus a short, plain-English explanation. No engine integration required.

export type TrainingMode = "best-move" | "find-plan" | "defend" | "convert";

export interface TrainingPosition {
  id: string;
  mode: TrainingMode;
  fen: string;
  // Player to move (matches FEN side-to-move).
  side: "w" | "b";
  // Correct answer in UCI form (e.g. "e2e4"). For "find-plan" we also accept any of `acceptable`.
  bestMove: string;
  acceptable?: string[];
  title: string;
  // Short hint shown if user requests one.
  hint: string;
  // Why the move is correct — shown in feedback.
  explanation: string;
  // Why the most tempting alternative fails — shown when the user picks wrong.
  whyWrong: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const CURATED_POSITIONS: TrainingPosition[] = [
  // ---- Best Move ----
  {
    id: "bm-1",
    mode: "best-move",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4",
    side: "w",
    bestMove: "e1g1",
    title: "Italian Opening — develop with tempo",
    hint: "Your king is exposed in the center; complete development.",
    explanation: "Castling kingside instantly improves king safety and connects the rooks. In open positions like this Italian, delaying castling is one of the most common amateur mistakes.",
    whyWrong: "Pushing pawns or trading pieces here keeps your king in the center, where Black can open lines with ...d5 and gain a serious initiative.",
    difficulty: "beginner",
  },
  {
    id: "bm-2",
    mode: "best-move",
    fen: "r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 1 9",
    side: "w",
    bestMove: "e5f7",
    title: "Fischer's brilliancy — rip open the king",
    hint: "Two pieces are aimed at f7. Sometimes you have to sacrifice for a king hunt.",
    explanation: "Nxf7! shatters Black's king cover. After ...Kxf7, White wins back material with Qf3+ and a devastating attack — a classic king hunt.",
    whyWrong: "Quiet moves let Black untangle with ...Be7 and ...0-0, killing the attack and leaving White worse due to misplaced knights.",
    difficulty: "advanced",
  },
  {
    id: "bm-3",
    mode: "best-move",
    fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 4 4",
    side: "b",
    bestMove: "e8g8",
    title: "Get your king to safety",
    hint: "Symmetrical position; the side that develops faster wins.",
    explanation: "Castling is the simplest and best move. You match White's setup, complete development, and prepare ...d6 to fight for the center.",
    whyWrong: "Pawn moves like ...d6 or ...a6 are too slow — White will castle first and then play d4, getting the better Italian.",
    difficulty: "beginner",
  },
  // ---- Find the Plan ----
  {
    id: "fp-1",
    mode: "find-plan",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 0 8",
    side: "w",
    bestMove: "e3e4",
    acceptable: ["e3e4"],
    title: "Stonewall-ish structure — strike the center",
    hint: "Your pieces are aimed at the kingside; what frees the bishop on c1 and opens lines?",
    explanation: "e4! is the thematic break. It opens lines for the c1-bishop, gains central space, and creates attacking chances on the kingside. Without this break White has no plan.",
    whyWrong: "Drifting with rook moves or h3 lets Black play ...c4 and ...b5, completely freezing the queenside and leaving White without a plan.",
    difficulty: "intermediate",
  },
  {
    id: "fp-2",
    mode: "find-plan",
    fen: "r2q1rk1/1bpnbppp/p3pn2/1p6/3P4/1B2PN2/PPB2PPP/RNBQ1RK1 w - - 0 9",
    side: "w",
    bestMove: "a2a4",
    acceptable: ["a2a4"],
    title: "Queenside minority attack",
    hint: "Black's queenside pawns are advanced. Attack the base.",
    explanation: "a4! starts the minority attack. White wants to play a5 and provoke ...b4 or trade on b5 to leave Black with a weak c-pawn — a long-term positional plan.",
    whyWrong: "Moving the knight or trading pieces lets Black consolidate with ...c5, equalizing the queenside completely.",
    difficulty: "advanced",
  },
  // ---- Defend ----
  {
    id: "df-1",
    mode: "defend",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 4 4",
    side: "b",
    bestMove: "e8g8",
    title: "Italian — neutralize the threats",
    hint: "White's bishop eyes f7. What ends the threats fastest?",
    explanation: "Castling immediately puts your king on g8 behind a wall of pawns and connects rooks. Defense often means simply finishing development.",
    whyWrong: "Moves like ...d6 are passive and allow Ng5 with pressure on f7 that's annoying to defend.",
    difficulty: "beginner",
  },
  {
    id: "df-2",
    mode: "defend",
    fen: "r4rk1/ppp2ppp/2n1bn2/2bqp3/8/2NPBN2/PPPQ1PPP/R3KB1R w KQ - 0 9",
    side: "w",
    bestMove: "e1c1",
    title: "Get the king out of the center",
    hint: "Both sides are developed; your king is the worst-placed piece.",
    explanation: "0-0-0! gets the king to safety on the queenside, where it's protected by pawns, and brings a rook to the central d-file in one move.",
    whyWrong: "Trying to attack with g4 or h4 leaves your king in the center forever — Black opens the e-file with ...exd4 and wins.",
    difficulty: "intermediate",
  },
  // ---- Convert ----
  {
    id: "cv-1",
    mode: "convert",
    fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    side: "w",
    bestMove: "e3d3",
    title: "King and pawn endgame — opposition",
    hint: "Your king must enter Black's camp. Use opposition.",
    explanation: "Kd3! takes the opposition. Black must give way with the king, and you escort the e-pawn home for the win. Without taking opposition, the position is only a draw.",
    whyWrong: "Pushing the pawn (e4) or moving sideways (Kd2/Kf3) lets Black's king block in front of your pawn, drawing easily.",
    difficulty: "intermediate",
  },
  {
    id: "cv-2",
    mode: "convert",
    fen: "8/4k3/4p3/8/4P3/4K3/8/8 w - - 0 1",
    side: "w",
    bestMove: "e3d4",
    title: "Outflank with the king",
    hint: "You have an extra tempo. Walk around your opponent.",
    explanation: "Kd4! sidesteps the opposition. After ...Kd6, you continue Kd3 (or Kc4) and infiltrate the queenside, winning the e6-pawn.",
    whyWrong: "Pawn pushes only liquidate the position into a king-and-pawn race that Black holds.",
    difficulty: "advanced",
  },
];

export function getCuratedByMode(mode: TrainingMode): TrainingPosition[] {
  return CURATED_POSITIONS.filter(p => p.mode === mode);
}

export const TRAINING_MODES: { key: TrainingMode; label: string; description: string; icon: string }[] = [
  { key: "best-move", label: "Find the Best Move", description: "Pick the strongest move in the position", icon: "🎯" },
  { key: "find-plan", label: "Find the Plan", description: "Choose the move that fits the long-term plan", icon: "🧠" },
  { key: "defend", label: "Defend the Position", description: "Find the move that holds the position", icon: "🛡️" },
  { key: "convert", label: "Convert Winning Position", description: "Bring home the advantage cleanly", icon: "👑" },
];
