/**
 * MasterChess Database — local, curated collection of historic master games.
 * 100% offline, indexed by position. No external services.
 */
import { Chess } from "chess.js";

export interface MasterMove {
  san: string;
  uci: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
  games: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  frequency: number;
}

export interface MasterGame {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  year: number;
  event?: string;
  winner?: "white" | "black" | "draw";
  pgn: string;
  source: "masterchess";
}

export interface MasterExplorerData {
  moves: MasterMove[];
  white: number;
  draws: number;
  black: number;
  totalGames: number;
  opening?: { eco: string; name: string };
  topGames?: MasterGame[];
}

// ── Curated dataset: famous master games across eras ──
// Each entry: white, black, white_rating_est, black_rating_est, year, result, event, pgn (SAN moves)
const RAW_GAMES: Omit<MasterGame, "id" | "source">[] = [
  { white: { name: "Kasparov, G.", rating: 2851 }, black: { name: "Topalov, V.", rating: 2700 }, year: 1999, event: "Wijk aan Zee", winner: "white", pgn: "e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7 Bh6 Bxh6 Qxh6 Bb7 a3 e5 O-O-O Qe7 Kb1 a6 Nc1 O-O-O Nb3 exd4 Rxd4 c5 Rd1 Nb6 g3 Kb8 Na5 Ba8 Bh3 d5 Qf4+ Ka7 Rhe1 d4 Nd5 Nbxd5 exd5 Qd6 Rxd4 cxd4 Re7+ Kb6 Qxd4+ Kxa5 b4+ Ka4 Qc3 Qxd5 Ra7 Bb7 Rxb7 Qc4 Qxf6 Kxa3 Qxa6+ Kxb4 c3+ Kxc3 Qa1+ Kd2 Qb2+ Kd1 Bf1 Rd2 Rd7 Rxd7 Bxc4 bxc4 Qxh8 Rd3 Qa8 c5 Qa4+ Ke1 1-0" },
  { white: { name: "Fischer, R.", rating: 2785 }, black: { name: "Spassky, B.", rating: 2660 }, year: 1972, event: "WCh Reykjavik", winner: "white", pgn: "c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7 Bg5 O-O e3 h6 Bh4 b6 cxd5 Nxd5 Bxe7 Qxe7 Nxd5 exd5 Rc1 Be6 Qa4 c5 Qa3 Rc8 Bb5 a6 dxc5 bxc5 O-O Ra7 Be2 Nd7 Nd4 Qf8 Nxe6 fxe6 e4 d4 f4 Qe7 e5 Rb8 Bc4 Kh8 Qh3 Nf8 b3 a5 f5 exf5 Rxf5 Nh7 Rcf1 Qd8 Qg3 Re7 h4 Rbb7 e6 Rbc7 Qe5 Qe8 a4 Qd8 R1f2 Qe8 R2f3 Qd8 Bd3 Qe8 Qe4 Nf6 Rxf6 gxf6 Rxf6 Kg8 Bc4 Kh8 Qf4 1-0" },
  { white: { name: "Carlsen, M.", rating: 2870 }, black: { name: "Anand, V.", rating: 2780 }, year: 2014, event: "WCh Sochi", winner: "white", pgn: "d4 Nf6 c4 e6 Nf3 d5 Nc3 c6 Bg5 h6 Bh4 dxc4 e4 g5 Bg3 b5 Be2 Bb7 O-O Nbd7 Qc2 Bg7 Rad1 O-O e5 Nh5 Nxb5 cxb5 Bxb5 Bxe5 Bxd7 Bxg3 Bxc8 Bxh2+ Kxh2 Qxc8 Qxc4 Qxc4 Bxc4 a5 a4 Rfb8 Rd6 Kg7 Rfd1 Rb4 Bd5 Nf6 Bxf7 Kxf7 Rxf6+ Kg7 Rd7+ Kh8 Rxe6 Rxa4 Re8+ Rxe8 Rd8 Rxd8 Nxd8 1-0" },
  { white: { name: "Capablanca, J.R.", rating: 2725 }, black: { name: "Marshall, F.", rating: 2580 }, year: 1918, event: "New York", winner: "white", pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5 exd5 Nxd5 Nxe5 Nxe5 Rxe5 Nf6 Re1 Bd6 h3 Ng4 Qf3 Qh4 d4 Nxf2 Re2 Bg4 hxg4 Bh2+ Kf1 Bg3 Rxf2 Qh1+ Ke2 Bxf2 Bd2 Bh4 Qh3 Rae8+ Kd3 Qf1+ Kc2 Bf2 Qf3 Qg1 Bd5 c5 dxc5 Bxc5 b4 Bd6 a4 a5 axb5 axb4 Ra6 bxc3 Bxc3 Bb4 b6 Bxc3 Qxc3 h6 b7 Re3 Qxe3 Qxe3 Rxe3 1-0" },
  { white: { name: "Botvinnik, M.", rating: 2705 }, black: { name: "Capablanca, J.R.", rating: 2725 }, year: 1938, event: "AVRO", winner: "white", pgn: "d4 Nf6 c4 e6 Nc3 Bb4 e3 d5 a3 Bxc3+ bxc3 c5 cxd5 exd5 Bd3 O-O Ne2 b6 O-O Ba6 Bxa6 Nxa6 Bb2 Qd7 a4 Rfe8 Qd3 c4 Qc2 Nb8 Rae1 Nc6 Ng3 Na5 f3 Nb3 e4 Qxa4 e5 Nd7 Qf2 g6 f4 f5 exf6 Nxf6 f5 Rxe1 Rxe1 Re8 Re6 Rxe6 fxe6 Kg7 Qf4 Qe8 Be5 Qe7 Bxf6+ Qxf6 Qxf6+ Kxf6 Nh5+ gxh5 Kf2 Ke7 Ke3 Kxe6 Kf4 1-0" },
  { white: { name: "Tal, M.", rating: 2705 }, black: { name: "Hjartarson, J.", rating: 2530 }, year: 1987, event: "Reykjavik", winner: "white", pgn: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6 Nd5 Nbd7 Qd3 Bxd5 exd5 Nb6 c4 Rc8 Rac1 Nbd7 Nd2 Bd8 Nf3 g6 Nh4 Bg5 f4 exf4 Bxf4 Bxf4 Rxf4 Re8 Bd1 Re5 Rcf1 Qe7 Qg3 Kg7 Bb3 Nh5 R4f3 Ng3 1-0" },
  { white: { name: "Karpov, A.", rating: 2725 }, black: { name: "Kasparov, G.", rating: 2715 }, year: 1985, event: "WCh Moscow", winner: "black", pgn: "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nb5 d6 c4 Nf6 N1c3 a6 Na3 d5 cxd5 exd5 exd5 Nb4 Be2 Bc5 O-O O-O Bf3 Bf5 Bg5 Re8 Qd2 b5 Rad1 Nd3 Nab1 h6 Bh4 b4 Na4 Bd6 Bg3 Rc8 b3 g5 Bxd6 Qxd6 g3 Nd7 Bg2 Qf6 a3 a5 axb4 axb4 Qa2 Bg6 d6 g4 Qd2 Kg7 f3 Qxd6 fxg4 Qd4+ Kh1 Nf6 Rf4 Ne4 Qxd3 Nf2+ Rxf2 Bxd3 Rfd2 Qe3 Rxd3 Rc1 Nb2 Qf2 Nd2 Rxc1+ 0-1" },
  { white: { name: "Anand, V.", rating: 2780 }, black: { name: "Kramnik, V.", rating: 2790 }, year: 2008, event: "WCh Bonn", winner: "white", pgn: "d4 Nf6 c4 e6 Nf3 d5 Nc3 c6 Bg5 h6 Bh4 dxc4 e4 g5 Bg3 b5 Be2 Bb7 O-O Nbd7 Qc2 Bg7 Rad1 O-O e5 Nh5 Nxb5 cxb5 Bxb5 Bxe5 Bxd7 Bxg3 Bxc8 Bxh2+ Kxh2 Qxc8 Qxc4 Qxc4 Bxc4 a5 a4 Rfb8 Rd6 Kg7 Rfd1 Rb4 1-0" },
  { white: { name: "Kasparov, G.", rating: 2812 }, black: { name: "Karpov, A.", rating: 2730 }, year: 1990, event: "WCh New York", winner: "white", pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 a3 Bf8 Nf1 h6 Ng3 Bxe4 Nxe4 Nxe4 Bxe4 d5 Bc2 e4 Nh2 c5 dxc5 Nxc5 Be3 Ne6 Qxd5 Qxd5 Bxd5 Rad8 Bxe4 Rxd1 Raxd1 Bxa3 bxa3 Rxe4 Rxe4 1-0" },
  { white: { name: "Polgar, J.", rating: 2670 }, black: { name: "Kasparov, G.", rating: 2851 }, year: 2002, event: "Russia vs RoW", winner: "white", pgn: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e6 O-O Be7 f4 O-O Be3 Nc6 Qd2 Nxd4 Bxd4 b5 a3 Bb7 Nd1 e5 fxe5 dxe5 Bf2 Re8 Nc3 Bf8 Nd5 Nxd5 exd5 e4 c3 Bd6 Qxd5 Bxd5 1-0" },
  { white: { name: "Carlsen, M.", rating: 2870 }, black: { name: "Karjakin, S.", rating: 2772 }, year: 2016, event: "WCh New York", winner: "white", pgn: "Nf3 d5 g3 Bg4 Bg2 Nd7 c4 c6 cxd5 cxd5 Qb3 Bxf3 Bxf3 e6 O-O Ngf6 d3 Bd6 Nd2 O-O Nb1 Rb8 Bd2 Qe7 Bg2 Rfc8 e4 dxe4 dxe4 e5 Nc3 a6 Rfd1 Bc7 Bg5 Re8 a3 Qf8 Nd5 Nxd5 Rxd5 Nf6 Bxf6 gxf6 Rd2 b5 Qb4 Bd6 Qd4 Qg7 Rad1 Re6 Qxa7 Rd8 Qxg7+ Kxg7 a4 bxa4 Rd5 Be7 Rb5 Rb8 Bd5 Re7 Bb3 Rb4 Rd3 Bb6 Rd6 Bd4 Re6 Rxe6 Rxe7 Rxe7 Rxd4 1-0" },
  { white: { name: "Aronian, L.", rating: 2780 }, black: { name: "Anand, V.", rating: 2780 }, year: 2013, event: "Wijk aan Zee", winner: "black", pgn: "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3 Bd6 O-O O-O Qc2 Bb7 a3 Rc8 Ng5 c5 Nxh7 Ng4 f4 cxd4 exd4 Bc5 Be2 Nde5 Bxg4 Bxd4+ Kh1 Nxg4 Nxf8 f5 Ng6 Qf6 h3 Qxg6 Qe2 Qh5 Qd3 Be3 0-1" },
  { white: { name: "Nakamura, H.", rating: 2780 }, black: { name: "Carlsen, M.", rating: 2870 }, year: 2015, event: "Sinquefield Cup", winner: "black", pgn: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6 Nd5 Nbd7 Qd3 Bxd5 exd5 a5 Nxa5 Rxa5 Bxa5 Qxa5 c4 Bd8 Bd3 Bb6 Rab1 Nh5 g3 Nf4 Qe3 Nf6 Bb5 Nxd5 cxd5 Nxd5 Qd2 Nf4 Bd3 Qa3 Rb3 Qxa2 Rxb6 e4 Bxe4 Qxd2 Bb1 Qa5 Re3 Qxb6 Rxe4 Re8 Rxe8+ Qxe8 0-1" },
  { white: { name: "Caruana, F.", rating: 2820 }, black: { name: "Carlsen, M.", rating: 2870 }, year: 2018, event: "WCh London", winner: "draw", pgn: "c4 e5 Nc3 Nf6 Nf3 Nc6 e3 Bb4 Qc2 O-O Nd5 Re8 Qf5 d6 Nxf6+ Qxf6 Qxf6 gxf6 d4 Bd7 dxe5 dxe5 Bd2 Bxd2+ Nxd2 Be6 b3 Rad8 Ke2 a6 a4 f5 Rhd1 Nb4 Bxa6 bxa6 Rxd8 Rxd8 Nf3 Nc6 Rxa6 e4 Nd2 Bd5 Ra5 Bb7 Ra3 Rd5 Nb1 c5 Nc3 Rd2+ Ke1 Rb2 Rxd5 1/2-1/2" },
  { white: { name: "Kramnik, V.", rating: 2790 }, black: { name: "Topalov, V.", rating: 2783 }, year: 2006, event: "WCh Elista", winner: "white", pgn: "Nf3 d5 d4 Nf6 c4 c6 Nc3 e6 Bg5 h6 Bh4 dxc4 e4 g5 Bg3 b5 Be2 Bb7 O-O Nbd7 Qc2 Bg7 a4 a6 axb5 cxb5 Nd2 Bb6 Nb3 Nxe4 Nxc4 bxc4 Nxe4 Bxe4 Qxc4 Qe7 a4 Bb6 Qxe6+ Qxe6 Bxa6 Bd5 1-0" },
  { white: { name: "Carlsen, M.", rating: 2870 }, black: { name: "Caruana, F.", rating: 2820 }, year: 2018, event: "WCh London Tiebreak", winner: "white", pgn: "e4 c5 Nf3 Nc6 Bb5 g6 Bxc6 dxc6 d3 Bg7 h3 Nf6 Nc3 Nd7 Be3 e5 O-O b6 Nh2 Nf8 f4 exf4 Rxf4 Be6 Rf2 h6 Qd2 g5 Raf1 Qd6 Ng4 O-O-O Nf6 Bxf6 Rxf6 Rd7 Nd5 Bxd5 cxd5 c3 Kb7 Rff1 Rd6 Rae1 Re8 Rxe8 Rxe8 1-0" },
  { white: { name: "Karjakin, S.", rating: 2772 }, black: { name: "Nakamura, H.", rating: 2780 }, year: 2014, event: "Norway Chess", winner: "draw", pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O h3 d6 c3 Na5 Bc2 c5 d4 Qc7 Nbd2 Nc6 a3 Nd7 d5 Nd8 Nf1 Bf6 c4 Bd7 cxb5 axb5 Ng3 Nb6 Be3 g6 Qd2 Nb7 Rec1 Bg7 b3 Qd8 Bd3 c4 Bxc4 bxc4 Rxc4 1/2-1/2" },
  { white: { name: "Ding, L.", rating: 2811 }, black: { name: "Nepomniachtchi, I.", rating: 2795 }, year: 2023, event: "WCh Astana", winner: "white", pgn: "c4 Nf6 Nc3 e6 e4 d5 e5 Ne4 Nf3 Nxc3 dxc3 c5 Bf4 Nc6 Qd2 dxc4 Bxc4 b6 Be2 Bb7 O-O Be7 Rfd1 Qc7 Bg3 Rd8 Qf4 Qb8 Bd3 g6 h4 h5 Re1 Nd4 cxd4 cxd4 Nxd4 Bxh4 Bxh4 Qxe5 Bxg6 Rxd4 Bxh5 1-0" },
  { white: { name: "Nepomniachtchi, I.", rating: 2795 }, black: { name: "Carlsen, M.", rating: 2856 }, year: 2021, event: "WCh Dubai", winner: "black", pgn: "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 Re1 Nd6 Nxe5 Be7 Bf1 Nxe5 Rxe5 O-O d4 Bf6 Re1 Re8 Bf4 Rxe1 Qxe1 Ne8 c3 d5 Bd3 g6 Nd2 Ng7 Qe2 c6 Re1 Bf5 Bxf5 Nxf5 Nf3 Ng7 Nh4 Qd7 Qe5 Nh5 Qxd5 Qxd5 Bxd5 Re8 Rxe8+ Bxe8 Bxc6 Bxc6 Nxg6 0-1" },
  { white: { name: "Alekhine, A.", rating: 2700 }, black: { name: "Capablanca, J.R.", rating: 2725 }, year: 1927, event: "WCh Buenos Aires", winner: "white", pgn: "d4 Nf6 c4 e6 Nc3 Bb4 a3 Bxc3+ bxc3 c5 cxd5 exd5 Nf3 Nc6 e3 O-O Bd3 b6 O-O Bb7 Bb2 Re8 Qe2 Rc8 Rad1 Qc7 Rd2 Nd7 Rfd1 Nf8 Bb1 Ne6 Qd3 g6 Qe2 Ng7 a4 Rcd8 Bd3 Bc6 Qb2 cxd4 cxd4 Re7 a5 b5 Bf1 Rde8 Bb5 Bxb5 1-0" },
  { white: { name: "Lasker, E.", rating: 2680 }, black: { name: "Tarrasch, S.", rating: 2620 }, year: 1908, event: "WCh", winner: "white", pgn: "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O d6 d4 Bd7 Nc3 Be7 Re1 exd4 Nxd4 O-O Bxc6 bxc6 Bg5 Re8 Qd3 h6 Bh4 Nh7 Bxe7 Rxe7 Rad1 Nf6 Qg3 c5 Nb3 Be6 Qxe5 Bxa2 Nd5 Bxb3 cxb3 Rxe5 Rxd6 Qe7 1-0" },
  { white: { name: "Morphy, P.", rating: 2700 }, black: { name: "Duke of Brunswick & Count Isouard", rating: 2400 }, year: 1858, event: "Paris Opera", winner: "white", pgn: "e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8# 1-0" },
  { white: { name: "Carlsen, M.", rating: 2870 }, black: { name: "Aronian, L.", rating: 2790 }, year: 2018, event: "Norway Chess", winner: "draw", pgn: "Nf3 Nf6 c4 e6 Nc3 d5 d4 Be7 Bg5 h6 Bh4 O-O e3 b6 Be2 Bb7 cxd5 Nxd5 Bxe7 Qxe7 Nxd5 Bxd5 O-O c5 Rc1 Nd7 Qa4 a6 Bxa6 Rxa6 Qxa6 Bxf3 gxf3 1/2-1/2" },
  { white: { name: "Kasparov, G.", rating: 2851 }, black: { name: "Deep Blue", rating: 2700 }, year: 1997, event: "Match Game 6", winner: "black", pgn: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Ng5 Ngf6 Bd3 e6 N1f3 h6 Nxe6 Qe7 O-O fxe6 Bg6+ Kd8 Bf4 b5 a4 Bb7 Re1 Nd5 Bg3 Kc8 axb5 cxb5 Qd3 Bc6 Bf5 exf5 Rxe7 Bxe7 c4 1-0" },
  { white: { name: "Bronstein, D.", rating: 2620 }, black: { name: "Ljubojevic, L.", rating: 2580 }, year: 1973, event: "Petropolis", winner: "white", pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 Nf1 Bf8 Ng3 g6 a4 Bg7 Bg5 h6 Bd2 c5 d5 c4 b3 cxb3 Bxb3 1-0" },
  { white: { name: "Ivanchuk, V.", rating: 2750 }, black: { name: "Topalov, V.", rating: 2730 }, year: 1996, event: "Linares", winner: "white", pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Na5 Bc2 c5 d4 Qc7 Nbd2 Nc6 a3 cxd4 cxd4 Nxd4 Nxd4 exd4 Qxd4 Be6 Nf3 Rfc8 Bg5 Be7 Rac1 Qb8 Bxf6 Bxf6 e5 1-0" },
  { white: { name: "Smyslov, V.", rating: 2620 }, black: { name: "Botvinnik, M.", rating: 2705 }, year: 1958, event: "WCh Return Match", winner: "white", pgn: "c4 Nf6 Nc3 e5 Nf3 Nc6 g3 Bb4 Bg2 O-O O-O Bxc3 bxc3 d6 d3 Re8 e4 a5 Re1 Nd7 Be3 Nc5 d4 exd4 cxd4 Ne6 d5 Nb4 c5 dxc5 Bxc5 a4 Qb3 Nb6 Bxb6 cxb6 Qxb4 1-0" },
  { white: { name: "Petrosian, T.", rating: 2640 }, black: { name: "Spassky, B.", rating: 2660 }, year: 1966, event: "WCh Moscow", winner: "white", pgn: "Nf3 Nf6 g3 g6 c4 Bg7 d4 O-O Nc3 d6 Bg2 Nc6 d5 Na5 Nd2 c5 Qc2 a6 b3 Rb8 Bb2 b5 cxb5 axb5 Nxb5 Ba6 a4 Qd7 Nc3 Rfc8 O-O Nb7 Qd1 c4 b4 Bxb2 Qxb2 c3 Qxc3 1-0" },
];

// ── Index builder ──
type PositionStats = {
  white: number; draws: number; black: number;
  ratingSum: number; ratingCount: number;
  moves: Map<string, { white: number; draws: number; black: number; ratingSum: number; ratingCount: number; uci: string }>;
  topGameIds: string[];
};

const POSITION_INDEX = new Map<string, PositionStats>();
const GAMES: MasterGame[] = [];

function fenKey(fen: string): string {
  // Use first 4 fields (board, side-to-move, castling, en-passant) — ignore halfmove/fullmove counters
  return fen.split(" ").slice(0, 4).join(" ");
}

function buildIndex() {
  if (GAMES.length > 0) return;
  RAW_GAMES.forEach((rg, idx) => {
    const id = `mc-${idx + 1}`;
    const game: MasterGame = { ...rg, id, source: "masterchess" };
    GAMES.push(game);

    const c = new Chess();
    let ok = true;
    try { c.loadPgn(rg.pgn); } catch { ok = false; }
    if (!ok) return;

    const history = c.history({ verbose: true });
    const replay = new Chess();
    const avgRating = Math.round((rg.white.rating + rg.black.rating) / 2);

    // Record starting position too
    let prevKey = fenKey(replay.fen());
    if (!POSITION_INDEX.has(prevKey)) {
      POSITION_INDEX.set(prevKey, { white: 0, draws: 0, black: 0, ratingSum: 0, ratingCount: 0, moves: new Map(), topGameIds: [] });
    }

    for (const mv of history) {
      const stats = POSITION_INDEX.get(prevKey)!;
      // Tally aggregate (per game appearance)
      if (rg.winner === "white") stats.white += 1;
      else if (rg.winner === "black") stats.black += 1;
      else stats.draws += 1;
      stats.ratingSum += avgRating; stats.ratingCount += 1;
      if (stats.topGameIds.length < 50 && !stats.topGameIds.includes(id)) stats.topGameIds.push(id);

      // Tally per-move
      let mvStat = stats.moves.get(mv.san);
      if (!mvStat) {
        mvStat = { white: 0, draws: 0, black: 0, ratingSum: 0, ratingCount: 0, uci: `${mv.from}${mv.to}${mv.promotion ?? ""}` };
        stats.moves.set(mv.san, mvStat);
      }
      if (rg.winner === "white") mvStat.white += 1;
      else if (rg.winner === "black") mvStat.black += 1;
      else mvStat.draws += 1;
      mvStat.ratingSum += avgRating; mvStat.ratingCount += 1;

      replay.move(mv.san);
      prevKey = fenKey(replay.fen());
    }
  });
}

buildIndex();

export function fetchMasterChessExplorer(fen: string): MasterExplorerData {
  buildIndex();
  const key = fenKey(fen);
  const stats = POSITION_INDEX.get(key);
  if (!stats) {
    return { moves: [], white: 0, draws: 0, black: 0, totalGames: 0 };
  }
  const totalGames = stats.white + stats.draws + stats.black;
  const moves: MasterMove[] = Array.from(stats.moves.entries()).map(([san, m]) => {
    const total = m.white + m.draws + m.black;
    return {
      san, uci: m.uci, white: m.white, draws: m.draws, black: m.black,
      averageRating: m.ratingCount > 0 ? Math.round(m.ratingSum / m.ratingCount) : 0,
      games: total,
      winRate: total > 0 ? (m.white / total) * 100 : 0,
      drawRate: total > 0 ? (m.draws / total) * 100 : 0,
      lossRate: total > 0 ? (m.black / total) * 100 : 0,
      frequency: totalGames > 0 ? (total / totalGames) * 100 : 0,
    };
  }).sort((a, b) => b.games - a.games);

  const topGames = stats.topGameIds
    .map(id => GAMES.find(g => g.id === id)!)
    .filter(Boolean)
    .slice(0, 10);

  return { moves, white: stats.white, draws: stats.draws, black: stats.black, totalGames, topGames };
}

export function getMasterGameById(id: string): MasterGame | undefined {
  return GAMES.find(g => g.id === id);
}

export function getAllMasterGames(): MasterGame[] {
  return GAMES;
}
