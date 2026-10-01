// Endgame drills — the single, focused product of MasterChess.
// Each drill is a real, solvable endgame. The player always moves first (white),
// a bot defends. Winning condition is checkmate (or promotion where noted).
//
// Each drill also carries written teaching content so /endgames/:id is a real
// page Google can rank: the method step by step, common mistakes, and FAQs.

export type EndgameDrill = {
  id: string;
  title: string;
  /** Short promise: what the player learns. */
  goal: string;
  fen: string;
  /** Difficulty band for grouping. */
  level: "basic" | "core" | "hard";
  /** Rating of the defending bot (used to pick engine strength). */
  defenderRating: number;
  /** Move budget — drills must be won efficiently, like a real technique test. */
  moveLimit: number;
  /** One-line technique hint shown on request. */
  hint: string;
  /** Primary search phrase this page targets. */
  keyword: string;
  /** 1-2 sentence written intro shown above the method. */
  intro: string;
  /** The technique, step by step. */
  method: string[];
  /** What players get wrong here. */
  mistakes: string[];
  /** Question/answer pairs, also emitted as FAQ structured data. */
  faq: { q: string; a: string }[];
};

export const ENDGAME_DRILLS: EndgameDrill[] = [
  {
    id: "king-queen-mate",
    title: "King + Queen vs King",
    goal: "The first mate every player must own.",
    fen: "8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1",
    level: "basic",
    defenderRating: 1200,
    moveLimit: 20,
    hint: "Shrink the box with the queen a knight's move away, then bring your king up.",
    keyword: "queen and king checkmate",
    intro:
      "Queen and king against a lone king is the first mate you have to be able to deliver without thinking. The whole technique is shrinking the box the enemy king lives in, then walking your own king up to finish.",
    method: [
      "Put your queen a knight's move away from the enemy king. From there she takes away almost every square without ever giving stalemate.",
      "Follow the king with that same knight's-move relationship each time it moves. The box it can stand in gets smaller every move.",
      "Once the king is stuck on the edge or in the corner, stop moving the queen and walk your king toward it.",
      "When your king stands a knight's move from the enemy king, deliver mate with the queen on the edge rank or file.",
    ],
    mistakes: [
      "Chasing with the queen alone. Without the king you can only push, never mate.",
      "Stalemate: the enemy king on the edge with no legal move and no check. Always ask what it can play before you move.",
      "Repeating queen checks. Checks feel active but they lose the 50-move race.",
    ],
    faq: [
      {
        q: "How many moves does queen and king mate take?",
        a: "From any starting position it can be done in ten moves or fewer with correct technique. This drill gives you a twenty-move budget.",
      },
      {
        q: "Why do I keep stalemating?",
        a: "Because the queen took the last free square while the king was not in check. Bring your own king closer instead of taking one more square with the queen.",
      },
    ],
  },
  {
    id: "king-rook-mate",
    title: "King + Rook vs King",
    goal: "Master the staircase mate.",
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
    level: "basic",
    defenderRating: 1200,
    moveLimit: 25,
    hint: "Cut the king off with the rook, walk your king in, then deliver mate on the edge.",
    keyword: "king and rook vs king",
    intro:
      "King and rook against a lone king is the mate that separates players who convert from players who draw. It needs both pieces working together and a technique called the staircase.",
    method: [
      "Use the rook to cut the enemy king off, so it is confined to one part of the board.",
      "March your king toward it until the two kings stand face to face with one square between them.",
      "Give a rook check. The enemy king must step back a rank or file.",
      "Repeat: king up, rook check. That is the staircase. It ends with mate on the edge.",
      "If the enemy king refuses to step back, use a waiting rook move along the cutting line to pass the move back.",
    ],
    mistakes: [
      "Checking with the rook before the kings face each other, which just pushes the king sideways.",
      "Letting the enemy king attack the rook because your own king is too far away.",
      "Forgetting the waiting move. When the king dodges sideways, you need a tempo move, not another check.",
    ],
    faq: [
      {
        q: "Can you mate with only a king and rook?",
        a: "Yes. King and rook against a lone king is a forced mate, usually inside sixteen moves.",
      },
      {
        q: "What is the staircase mate?",
        a: "The repeating pattern of walking your king one square closer, then checking with the rook, until the defending king runs out of ranks.",
      },
    ],
  },
  {
    id: "pawn-promotion-basic",
    title: "King + Pawn vs King",
    goal: "Promote the pawn — key squares decide it.",
    fen: "8/8/3k4/8/3K4/8/3P4/8 w - - 0 1",
    level: "basic",
    defenderRating: 1400,
    moveLimit: 25,
    hint: "The kings face each other. Spend a pawn tempo (d3) so Black must give way — then walk in.",
    keyword: "king and pawn vs king",
    intro:
      "King and pawn against king is the position that decides thousands of games. One extra pawn is a win or a dead draw depending on where the kings stand, and the rule that decides it is key squares.",
    method: [
      "Put your king in front of the pawn, not behind it. The pawn is the last thing to move, not the first.",
      "Aim for the three key squares two ranks ahead of the pawn. If your king reaches one of them, the pawn promotes.",
      "Take the opposition: kings on the same file with one square between them and the opponent to move. Then your king walks forward.",
      "Only push the pawn once your king has already claimed the square in front of it.",
    ],
    mistakes: [
      "Pushing the pawn first. It arrives alone, gets blocked in front of the enemy king and the game is drawn.",
      "Losing the opposition, which lets the defending king sit in front of your pawn forever.",
      "Rook pawns: a king in the corner is a draw no matter what you do, so avoid trading down into one.",
    ],
    faq: [
      {
        q: "What are key squares in king and pawn endgames?",
        a: "The squares where your king guarantees the pawn promotes. For a pawn on the second to fifth rank they sit two ranks in front of the pawn, on the pawn's file and both neighbours.",
      },
      {
        q: "Is king and pawn against king always a win?",
        a: "No. With the defending king in front of the pawn and the opposition, it is a draw. With a rook pawn and the king in the corner it is always a draw.",
      },
    ],
  },
  {
    id: "lucena",
    title: "Lucena Position",
    goal: "The most important rook endgame win.",
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    level: "core",
    defenderRating: 1600,
    moveLimit: 25,
    hint: "Build the bridge: rook to the fourth rank, then shield your king with it.",
    keyword: "lucena position",
    intro:
      "The Lucena position is the single most valuable rook endgame to know: rook and pawn on the seventh against rook, with your king in front of your own pawn. The winning method is called building the bridge.",
    method: [
      "Your king sits on the promotion square and the pawn cannot advance yet, because the defending rook checks from the side.",
      "Play your rook to the fourth rank, in front of your king. That is the bridge.",
      "Step your king out of the corner so the pawn is free to promote.",
      "When the checks start, block them by dropping the rook down onto the fourth rank next to your king.",
      "The pawn promotes with your king safe behind the rook shield.",
    ],
    mistakes: [
      "Pushing the king out before placing the rook on the fourth rank, which hands the defender endless checks.",
      "Putting the rook on the third or fifth rank, where it cannot interpose at the right moment.",
      "Letting the defending rook get behind your pawn instead of beside it.",
    ],
    faq: [
      {
        q: "What is the Lucena position?",
        a: "A rook endgame where the stronger side has a rook and a pawn on the seventh rank with the king in front of the pawn. It is a forced win using the bridge technique.",
      },
      {
        q: "What does building the bridge mean?",
        a: "Placing your rook on the fourth rank so that later you can block the defending rook's side checks by moving the rook beside your king.",
      },
    ],
  },
  {
    id: "two-bishops",
    title: "Two Bishops Mate",
    goal: "Drive the lone king to the corner.",
    fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    level: "core",
    defenderRating: 1500,
    moveLimit: 30,
    hint: "Bishops on adjacent diagonals build a wall; your king pushes the defender back.",
    keyword: "two bishops mate",
    intro:
      "Two bishops and a king mate a lone king, but only with cooperation. The bishops build a wall, the king does the pushing, and the mate happens on the edge or in the corner.",
    method: [
      "Bring both bishops onto adjacent diagonals so they form an unbroken wall the enemy king cannot cross.",
      "Walk your king up. The wall never moves backwards, so every king move steals space.",
      "Push the wall one diagonal forward at a time, always keeping the two bishops next to each other.",
      "Force the king to the edge, then use one bishop to check and the other to cover the escape squares.",
    ],
    mistakes: [
      "Separating the bishops, which leaves a hole the king walks straight through.",
      "Moving a bishop when the king should be moving. The king is the piece that gains ground.",
      "Stalemate in the corner, especially when both bishops cover everything and it is not check.",
    ],
    faq: [
      {
        q: "Can two bishops force checkmate?",
        a: "Yes, two bishops with the king force mate against a lone king, usually within about twenty moves.",
      },
      {
        q: "Are two bishops better than bishop and knight?",
        a: "For mating purposes, far better. Two bishops are a straightforward wall technique; bishop and knight need a much harder, memorised method.",
      },
    ],
  },
  {
    id: "rook-vs-pawn",
    title: "Rook vs Pawn",
    goal: "Stop the runner, then win it.",
    fen: "8/8/8/8/8/1k6/1p6/1K1R4 w - - 0 1",
    level: "core",
    defenderRating: 1600,
    moveLimit: 25,
    hint: "Attack the pawn from behind or cut the king from it — never chase blindly.",
    keyword: "rook vs pawn endgame",
    intro:
      "Rook against a passed pawn looks easy and is lost constantly. Either the rook stops the pawn in time or the pawn promotes, and one careless move decides which.",
    method: [
      "First ask whether your king can help. If it can reach the pawn's path, walk it in.",
      "If not, get the rook behind the pawn or in front of it on the promotion square.",
      "Cut the defending king away from its pawn along a rank or a file. A pawn without king support falls.",
      "Take the pawn only when your rook cannot be traded or your king cannot be cut off in return.",
    ],
    mistakes: [
      "Chasing the pawn sideways with the rook, which gains nothing and loses a move.",
      "Ignoring the defending king, which shelters the pawn and pushes your rook away.",
      "Giving up the rook for the pawn when a simple cut-off would have won it for free.",
    ],
    faq: [
      {
        q: "Does a rook beat a pawn?",
        a: "Usually yes, but only if the rook or the king arrives in time. A far advanced pawn with its own king nearby can hold a draw or even win.",
      },
      {
        q: "Where should the rook go against a passed pawn?",
        a: "Behind the pawn, or onto the promotion square in front of it. Sideways chasing almost never works.",
      },
    ],
  },
  {
    id: "queen-vs-rook",
    title: "Queen vs Rook",
    goal: "The hardest basic win in chess.",
    fen: "8/2r5/8/3k4/8/8/8/4KQ2 w - - 0 1",
    level: "hard",
    defenderRating: 1800,
    moveLimit: 35,
    hint: "Force the rook away from its king with checks, then win it with a fork.",
    keyword: "queen vs rook endgame",
    intro:
      "Queen against rook is a win, and it is the hardest of the basic wins. The rook hides next to its king and you have to force it away before you can take it.",
    method: [
      "Push the defending king toward the edge with your queen, keeping your own king close.",
      "Aim for the third-rank defence position, where the rook must leave its king's side.",
      "Give checks that force the rook to interpose or step away from cover.",
      "Once the rook is loose, win it with a queen fork or a skewer, then mate with queen and king.",
    ],
    mistakes: [
      "Grabbing the rook too early and running into a stalemate trick.",
      "Leaving your own king far away, so the rook checks forever and forces a draw by repetition.",
      "Random checking. Every check has to shrink the defender's options or it wastes the fifty-move count.",
    ],
    faq: [
      {
        q: "Is queen against rook a win?",
        a: "Yes, it is a forced win, but it can take over thirty moves of accurate play, which is why it is the hardest basic endgame.",
      },
      {
        q: "Why is queen vs rook so hard?",
        a: "The rook stays glued to its king, so you cannot simply take it. You must force it away with exact checks first.",
      },
    ],
  },
  {
    id: "philidor-attack",
    title: "Rook vs Pawn on the 2nd Rank",
    goal: "Stop a pawn one step from queening — and win.",
    fen: "8/8/8/8/8/4k3/4p3/4K1R1 w - - 0 1",
    level: "hard",
    defenderRating: 1800,
    moveLimit: 25,
    hint: "Your king blocks the pawn. Use the rook to cut the enemy king away, then collect the pawn.",
    keyword: "rook vs pawn endgame",
    intro:
      "A pawn on the second rank looks scary, but with your king in front of it the rook wins. The trick is to push the enemy king away from its pawn before you take it.",
    method: [
      "Keep your king on the queening square. As long as it stands there, the pawn cannot promote.",
      "Use quiet rook moves along the rank to take squares from the enemy king, not checks for the sake of checks.",
      "When the defending king steps away from the pawn, capture it with king or rook.",
      "Finish with the king and rook staircase mate.",
    ],
    mistakes: [
      "Moving your king off the queening square — the pawn promotes at once.",
      "Checking from close range so the enemy king can attack your rook.",
      "Stalemating the king when it has only pawn moves left. Always leave it a legal move.",
    ],
    faq: [
      {
        q: "Does a rook always beat a pawn?",
        a: "No. If the pawn is far advanced and supported by its king while your king is far away, it is often a draw. With your king in front of the pawn, the rook wins.",
      },
      {
        q: "Is this position checked?",
        a: "Yes. Every MasterChess drill is checked against a perfect-play endgame database: this one is a forced win for White.",
      },
    ],
  },
  {
    id: "queen-vs-pawn",
    title: "Queen vs Pawn on the 7th",
    goal: "Stop a pawn on the 7th with checks, then win it.",
    fen: "Q7/8/8/8/8/8/3pk3/1K6 w - - 0 1",
    level: "core",
    defenderRating: 1500,
    moveLimit: 20,
    hint: "Check, check, check until the king must stand in front of its own pawn. Then bring your king one step closer.",
    keyword: "queen vs pawn endgame",
    intro:
      "A queen against a pawn on the seventh rank is a win against a centre or knight pawn. The method is a staircase of checks that forces the king to block its own pawn.",
    method: [
      "Give checks or pin the pawn so it cannot queen right away.",
      "Keep checking until the enemy king has to step onto the queening square in front of its pawn.",
      "That costs the defender a tempo. Use it to bring your king one step closer.",
      "Repeat until your king arrives, then win the pawn and mate.",
    ],
    mistakes: [
      "Giving a check that lets the pawn promote with check or with tempo.",
      "Forgetting your king. The queen alone cannot win the pawn.",
      "Rook and bishop pawns: those are often drawn because of stalemate tricks, so do not assume every pawn loses.",
    ],
    faq: [
      {
        q: "Does a queen always beat a pawn on the 7th rank?",
        a: "Against a centre or knight pawn, yes. Against a rook pawn or bishop pawn the defender can often reach stalemate and draw.",
      },
      {
        q: "What is the key idea?",
        a: "Force the king in front of its own pawn. Every time it blocks the pawn you win one tempo for your king.",
      },
    ],
  },
  {
    id: "bishop-knight-mate",
    title: "Bishop + Knight Mate",
    goal: "The hardest basic mate — only in the right corner.",
    fen: "8/8/8/8/3k4/8/8/2BNK3 w - - 0 1",
    level: "hard",
    defenderRating: 1800,
    moveLimit: 40,
    hint: "You can only mate in a corner your bishop controls. Drive the king there with the W-manoeuvre of the knight.",
    keyword: "bishop and knight checkmate",
    intro:
      "Bishop and knight against a lone king is a forced mate, but it needs up to 33 accurate moves. Most club players never learn it — this drill fixes that.",
    method: [
      "Bring king, bishop and knight to the centre and push the enemy king to the edge.",
      "Find the right corner: the one the same colour as your bishop. Mate is only possible there.",
      "If the king runs to the wrong corner, use the knight's W-manoeuvre to drive it along the edge to the right one.",
      "Box it in the right corner and deliver mate with the bishop, the knight covering the escape square.",
    ],
    mistakes: [
      "Trying to mate in the wrong-coloured corner. It cannot be done.",
      "Letting the king escape back to the centre while you reorganise.",
      "Running out of the fifty-move limit because the pieces are not coordinated.",
    ],
    faq: [
      {
        q: "How many moves does bishop and knight mate take?",
        a: "At most 33 moves from the worst starting position with perfect play.",
      },
      {
        q: "Which corner do you mate in?",
        a: "The corner the same colour as your bishop. A light-squared bishop mates on h1 or a8, a dark-squared bishop on a1 or h8.",
      },
    ],
  },
];

export const LEVEL_LABEL: Record<EndgameDrill["level"], string> = {
  basic: "Basics",
  core: "Must-know",
  hard: "Advanced",
};

export function getDrill(id: string | undefined) {
  return ENDGAME_DRILLS.find((d) => d.id === id);
}
