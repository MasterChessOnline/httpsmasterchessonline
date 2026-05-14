// Practice-line fallback data for masterclass lessons that don't yet ship a
// `practiceLine` in `courses-data.ts`. The `OpeningTrainerView` looks here
// when a lesson's built-in practiceLine is missing so every Masterkurs
// variation has full move-by-move playback like Jobava London.

type Move = { move: string; explanation?: string };
export type PracticeLineFallback = {
  playerColor: "w" | "b";
  startFen?: string;
  moves: Move[];
  autoResponses: string[];
};

const ck = (
  moves: string[],
  autos: string[],
  expls: Record<number, string> = {},
): PracticeLineFallback => ({
  playerColor: "b",
  moves: moves.map((m, i) => ({ move: m, explanation: expls[i] })),
  autoResponses: autos,
});

const sd = (
  moves: string[],
  autos: string[],
  expls: Record<number, string> = {},
): PracticeLineFallback => ({
  playerColor: "w",
  moves: moves.map((m, i) => ({ move: m, explanation: expls[i] })),
  autoResponses: autos,
});

export const MASTERCLASS_PRACTICE_EXTRAS: Record<string, PracticeLineFallback> = {
  // ────────────────── CARO-KANN (ck-8 .. ck-30) ──────────────────
  "ck-8": ck(
    ["c6","d5","dxe4","Nf6","exf6","Bd6","O-O","Re8","Bg4","Bh5"],
    ["e4","d4","Nc3","Nxe4","Nxf6+","Bc4","Nf3","O-O","Re1","h3"],
    {0:"1...c6 — the Caro-Kann.",4:"5...exf6 — bishop pair, open e-file.",9:"10...Bh5 — keep the pin alive."},
  ),
  "ck-9": ck(
    ["c6","d5","dxe4","Bf5","Bg6","h6","Nd7","Bh7","Bxd3","Qc7","Ngf6"],
    ["e4","d4","Nd2","Nxe4","Ng3","h4","Nf3","h5","Bd3","Qxd3","Bd2"],
    {0:"1...c6 — Classical Caro.",10:"11...Ngf6 — Short tabiya complete."},
  ),
  "ck-10": ck(
    ["c6","d5","Bf5","e6","c5","Nd7","Ne7","Bg6","Be7","O-O"],
    ["e4","d4","e5","Nf3","Be2","Be3","O-O","Nbd2","c3","Re1"],
    {2:"3...Bf5 — get the bishop OUT before ...e6.",7:"8...Bg6 — keep f5 free for the knight."},
  ),
  "ck-11": ck(
    ["c6","d5","Bf5","Bd7","c5","Nc6","Qb6","cxd4","e6","Nge7"],
    ["e4","d4","e5","g4","h4","c3","Nf3","Bg2","cxd4","Nc3"],
    {3:"4...Bd7 — retreat; White's kingside is loose forever."},
  ),
  "ck-12": ck(
    ["c6","d5","Bf5","e6","Nd7","Ne7","c5","Nxd5","Bxc5","O-O"],
    ["e4","d4","e5","Nf3","Be2","O-O","c4","cxd5","dxc5","Nbd2"],
    {6:"7...c5! — the Caro's universal cure."},
  ),
  "ck-13": ck(
    ["d5","c6","Nf6","dxc4","Bf5","e6","Bb4","O-O","Nbd7","Bg6"],
    ["d4","c4","Nf3","Nc3","a4","e3","Bxc4","O-O","Qe2","e4"],
    {1:"2...c6 — the Slav: Caro-Kann ideas vs 1.d4."},
  ),
  "ck-14": ck(
    ["c6","d5","cxd5","Nf6","e6","Bb4","dxc4","O-O","b6","Bb7"],
    ["e4","d4","exd5","c4","Nc3","Nf3","Bd3","Bxc4","O-O","Re1"],
    {9:"10...Bb7 — blockade d5, head to the endgame."},
  ),
  "ck-15": ck(
    ["c6","d5","cxd5","Nc6","Nf6","Bg4","Qd7","e6","Bd6","Qxd6"],
    ["e4","d4","exd5","Bd3","c3","Bf4","Qb3","Nd2","Ngf3","Bxd6"],
    {9:"10...Qxd6 — healthy structure, a Caro endgame edge."},
  ),
  "ck-16": ck(
    ["c6","d5","dxe4","Bf5","Bg6","h6","Nd7","Bh7","Bxd3","e6"],
    ["e4","d4","Nc3","Nxe4","Ng3","h4","Nf3","h5","Bd3","Qxd3"],
    {0:"1...c6 — Karpov's lifelong choice."},
  ),
  "ck-17": ck(
    ["c6","d5","g6","Bg7","Nf6","O-O","Nbd7","dxe4","Nxe4","Nf6"],
    ["e4","d4","Nc3","Nf3","h3","Bd3","O-O","Bf4","Nxe4","Bxe4"],
    {2:"3...g6 — Anand's modern, dynamic Caro."},
  ),
  "ck-18": ck(
    ["c6","d5","g6","Bg7","Nf6","O-O","Nh5","dxe4","Nd7","Nhf6"],
    ["e4","d4","Nc3","h3","Nf3","Bf4","Bd3","Be3","Nxe4","Qd2"],
    {2:"3...g6 — Gurgenidze System."},
  ),
  "ck-19": ck(
    ["c6","d5","dxe4","Nf6","exf6","Bd6","O-O","Re8+","g6","Nd7"],
    ["e4","d4","Nc3","Nxe4","Nxf6+","c3","Bd3","Qc2","Ne2","Bd2"],
    {4:"5...exf6 — bishop pair, e-file pressure."},
  ),
  "ck-20": ck(
    ["c6","d5","Bf5","e6","Bg6","c5","h5","Bh7","cxd4","Nc6"],
    ["e4","d4","e5","Nc3","g4","Nge2","h4","Nf4","Nxh5","Nxd4"],
    {4:"5...Bg6 — Tartakower's bishop tucks away."},
  ),
  "ck-21": ck(
    ["c6","d5","dxe4","Nf6","gxf6","Bf5","e6","Qc7","Nd7","O-O-O"],
    ["e4","d4","Nc3","Nxe4","Nxf6+","c3","Nf3","Be2","O-O","Re1"],
    {4:"5...gxf6 — Bronstein-Larsen: open g-file for attack."},
  ),
  "ck-22": ck(
    ["c6","d5","dxe4","Bf5","Bg6","h6","Bh7","Nd7","Bxd3","e6"],
    ["e4","d4","Nc3","Nxe4","Ng3","h4","h5","Nf3","Bd3","Qxd3"],
    {5:"6...h6 — stop h5 with tempo."},
  ),
  "ck-23": ck(
    ["c6","d5","dxe4","Bf5","Bg6","Nd7","e6","Ngf6","Be7","O-O"],
    ["e4","d4","Nc3","Nxe4","Ng3","Nf3","Bc4","O-O","Re1","c3"],
  ),
  "ck-24": ck(
    ["c6","d5","cxd5","Nf6","Nc6","Bg4","Nxd5","Bxf3","e6","Nxd4"],
    ["e4","d4","exd5","c4","Nc3","Nf3","cxd5","Qb3","gxf3","Qxb7"],
    {9:"10...Nxd4! — the famous Panov tactic."},
  ),
  "ck-25": ck(
    ["c6","d5","Bf5","e6","Ne7","h6","Bh7","c5","Nbc6","g5"],
    ["e4","d4","e5","Nf3","Be2","O-O","Nh4","Nd2","c3","f4"],
    {9:"10...g5! — Black launches a kingside attack."},
  ),
  "ck-26": ck(
    ["c6","d5","dxe4","Bf5","Bg6","Nd7","Bxd3","e6","Ngf6","Qc7"],
    ["e4","d4","Nc3","Nxe4","Ng3","Nf3","Bd3","Qxd3","Bd2","O-O-O"],
    {9:"10...Qc7 — prepare ...O-O-O and ...c5 expansion."},
  ),
  "ck-27": ck(
    ["c6","d5","Bg4","Bxf3","Nf6","e6","Bb4","Nbd7","O-O","Nd5"],
    ["e4","Nc3","Nf3","h3","Qxf3","d3","g3","Bd2","O-O-O","e5"],
    {0:"1...c6 — vs the Anti-Caro 2.Nc3."},
  ),
  "ck-28": ck(
    ["c6","d5","dxe4","Bf5","Bg6","e6","Bd6","hxg6","Nf6","Nbd7"],
    ["e4","d4","Nc3","Nxe4","Ng3","Nh3","Nf4","Nxg6","c3","Bd3"],
    {7:"8...hxg6 — open h-file for the rook!"},
  ),
  "ck-29": ck(
    ["c6","d5","cxd5","Nc6","Nf6","Bg4","e6","Be7","O-O","Bh5"],
    ["e4","d4","exd5","Nf3","c3","Bd3","O-O","Re1","Nbd2","h3"],
    {0:"1...c6 — quick blitz Exchange Caro."},
  ),
  "ck-30": ck(
    ["c6","d5","dxe4","Bf5","Bg6","h6","Nd7","Bh7","Bxd3","Ngf6"],
    ["e4","d4","Nc3","Nxe4","Ng3","h4","Nf3","h5","Bd3","Qxd3"],
    {0:"1...c6 — your complete Caro-Kann repertoire move."},
  ),

  // ────────────────── NAJDORF & SICILIAN (sd-7 .. sd-30) ──────────────────
  "sd-7": sd(
    ["e4","Nf3","d4","Nxd4","Nb5","c4","N1c3","Na3","Be2","O-O"],
    ["c5","Nc6","cxd4","e5","d6","Be7","a6","Nf6","O-O","Be6"],
    {3:"4.Nxd4 — Open Sicilian.",4:"5.Nb5 — punish ...e5.",5:"6.c4 — Maroczy bind."},
  ),
  "sd-8": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","O-O","Be3","Nxc6","Na4"],
    ["c5","e6","cxd4","Nc6","Qc7","a6","Nf6","Bb4","bxc6","Be7"],
    {0:"1.e4 vs the Taimanov.",9:"10.Na4 — pressure the Bb4."},
  ),
  "sd-9": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Bd3","O-O","Nxc6","f4","Be3"],
    ["c5","e6","cxd4","a6","Qc7","Nf6","Nc6","Qxc6","d6","Be7"],
    {0:"1.e4 vs the Kan."},
  ),
  "sd-10": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be3","Bc4","Bb3","f3","Qd2"],
    ["c5","Nc6","cxd4","g6","Bg7","Nf6","O-O","d6","Bd7","Nxd4"],
    {0:"1.e4 vs the Accelerated Dragon.",6:"7.Bc4 — Yugoslav setup."},
  ),
  "sd-11": sd(
    ["e4","Nc3","f4","Nf3","Bc4","f5","fxe6","d3","Bb3","O-O"],
    ["c5","Nc6","g6","Bg7","e6","Nge7","fxe6","d5","O-O","Na5"],
    {2:"3.f4 — the Grand Prix Attack."},
  ),
  "sd-12": sd(
    ["e4","c3","exd5","d4","Nf3","Be2","h3","O-O","Be3","cxd4"],
    ["c5","d5","Qxd5","Nf6","Bg4","e6","Bh5","Nc6","cxd4","Bb4"],
    {1:"2.c3 — the Alapin."},
  ),
  "sd-13": sd(
    ["e4","Nc3","g3","Bg2","d3","Be3","Qd2","Nge2","O-O","Nd1"],
    ["c5","Nc6","g6","Bg7","d6","e5","Nge7","O-O","Nd4","Be6"],
    {1:"2.Nc3 — the Closed Sicilian."},
  ),
  "sd-14": sd(
    ["e4","Nf3","Bb5+","Bxd7+","O-O","c3","Re1","d4","cxd4","e5"],
    ["c5","d6","Bd7","Qxd7","Nc6","Nf6","e6","cxd4","d5","Ne4"],
    {2:"3.Bb5+ — the Moscow Variation."},
  ),
  "sd-15": sd(
    ["e4","Nf3","Bb5","O-O","c3","Re1","d4","cxd4","e5","Bd3"],
    ["c5","Nc6","g6","Bg7","Nf6","O-O","cxd4","d5","Ne4","Nc5"],
    {2:"3.Bb5 — the Rossolimo."},
  ),
  "sd-16": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Bg5","f4","Qf3","O-O-O","g4"],
    ["c5","d6","cxd4","Nf6","a6","e6","Be7","Qc7","Nbd7","b5"],
    {5:"6.Bg5 — the sharpest Najdorf."},
  ),
  "sd-17": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","Nb3","O-O","Be3","Nd5"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be7","O-O","Be6","Nbd7"],
    {5:"6.Be2 — solid Najdorf."},
  ),
  "sd-18": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be3","Nb3","f3","Qd2","O-O-O"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be6","Be7","O-O","Nbd7"],
    {5:"6.Be3 — the English Attack."},
  ),
  "sd-19": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","f3","Nb3","Be3","Qd2","O-O-O"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be6","h5","Nbd7","b5"],
    {5:"6.f3 — modern main line."},
  ),
  "sd-20": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be3","f3","Qd2","Bc4","O-O-O"],
    ["c5","d6","cxd4","Nf6","g6","Bg7","O-O","Nc6","Bd7","Rc8"],
    {8:"9.Bc4 — Yugoslav Attack vs Dragon."},
  ),
  "sd-21": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","O-O","Be3","Nb3","f4"],
    ["c5","d6","cxd4","Nf6","g6","Bg7","O-O","Nc6","Be6","Na5"],
    {5:"6.Be2 — Classical Dragon."},
  ),
  "sd-22": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","O-O","f4","Be3","Kh1"],
    ["c5","d6","cxd4","Nf6","a6","e6","Be7","O-O","Nc6","Bd7"],
    {7:"8.f4 — typical Sicilian Scheveningen pawn."},
  ),
  "sd-23": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","Nb3","O-O","Re1","Bf1"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be7","O-O","Nbd7","b5"],
    {9:"10.Bf1 — preparing g3 to stop ...d5."},
  ),
  "sd-24": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Bg5","f4","Qf3","O-O-O","Bd3"],
    ["c5","d6","cxd4","Nf6","a6","e6","Be7","Qc7","Nbd7","b5"],
    {9:"10.Bd3 — eyeing the ...Rxc3 sacrifice."},
  ),
  "sd-25": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","Nb3","O-O","a4","Be3"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be6","Nbd7","Be7","O-O"],
    {8:"9.a4 — clamp Black's queenside."},
  ),
  "sd-26": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","O-O","a4","Be3","f4"],
    ["c5","d6","cxd4","Nf6","a6","e6","Be7","Nc6","O-O","Bd7"],
    {9:"10.f4 — kingside expansion vs Scheveningen."},
  ),
  "sd-27": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Bc4","Bb3","O-O","Qf3","Qg3"],
    ["c5","d6","cxd4","Nf6","a6","e6","b5","Be7","Qc7","O-O"],
    {5:"6.Bc4 — Fischer's Sozin Attack."},
  ),
  "sd-28": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be2","Nb3","O-O","Be3","Qd2"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be7","O-O","Be6","Nbd7"],
    {0:"1.e4 — Kasparov's lifelong weapon."},
  ),
  "sd-29": sd(
    ["e4","Nc3","Bb5","Nf3","Nxb5","exd5","O-O","d4","Nbxd4","c4"],
    ["c5","Nc6","Nd4","Nxb5","d5","Qxd5","Nf6","cxd4","e6","Qd6"],
    {0:"Anti-Sicilian: 2.Nc3 + Bb5 setup."},
  ),
  "sd-30": sd(
    ["e4","Nf3","d4","Nxd4","Nc3","Be3","Nb3","f3","Qd2","O-O-O"],
    ["c5","d6","cxd4","Nf6","a6","e5","Be6","Be7","Nbd7","O-O"],
    {0:"1.e4 — your complete Najdorf repertoire."},
  ),
};
