import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { getCachedStockfishEvals, saveCachedStockfishEval } from "@/lib/stockfish-eval-cache";
import { fetchMasterChessExplorer, MasterMove, MasterExplorerData } from "@/lib/masterchess-db";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, Trash2, Download, MousePointerClick, RotateCcw,
  Database, Trophy, FlipVertical, Swords, Calendar, Sparkles, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EvalGraph from "@/components/chess/EvalGraph";
import type { MultiPvLine } from "@/lib/stockfish-engine";
import { classifyMove, computeAccuracy, CLASS_META, type MoveClass } from "@/lib/game-review";

// ── Types ──
interface MoveEval {
  san: string; fen: string; fenBefore: string; from: string; to: string;
  color: "w" | "b"; moveNumber: number; eval: number; mate: number | null;
}

interface PlayerInfo {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  country_flag: string | null;
}

interface GameMeta {
  white: PlayerInfo | null;
  black: PlayerInfo | null;
  result: string | null;
  time_control_label: string;
  created_at: string;
}

// ── Helpers ──

function scoreToWhitePov(fen: string, evaluation: number, mate: number | null): number {
  const raw = mate !== null ? (mate > 0 ? 10000 : -10000) : evaluation;
  return new Chess(fen).turn() === "w" ? raw : -raw;
}

// Convert engine's side-to-move mate distance to a white-POV signed mate value.
// e.g. white-to-move with M5 → +5; black-to-move with M5 → -5.
function mateToWhitePov(fen: string, mate: number | null): number | null {
  if (mate === null) return null;
  return new Chess(fen).turn() === "w" ? mate : -mate;
}

function formatEval(cp: number, mateWhitePov: number | null): string {
  if (mateWhitePov !== null) {
    if (mateWhitePov === 0) return cp >= 0 ? "1-0" : "0-1";
    return mateWhitePov > 0 ? `M${mateWhitePov}` : `-M${Math.abs(mateWhitePov)}`;
  }
  const val = cp / 100;
  return val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1);
}

function evalToBarPct(cp: number, mateWhitePov: number | null): number {
  // Lock 100% (or 0%) on forced mate so the bar never wobbles during a mating sequence.
  if (mateWhitePov !== null) return mateWhitePov >= 0 ? 100 : 0;
  // Hard pin on extreme cp (e.g. cached mate stored as ±10000)
  if (cp >= 9000) return 100;
  if (cp <= -9000) return 0;
  const x = cp / 100;
  return Math.max(2, Math.min(98, 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1)));
}

function formatGames(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Robust PGN/move-list loader that respects [FEN "..."] start positions.
function loadPgnRobust(input: string): Chess | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Try chess.js loadPgn first (handles tags + FEN)
  try {
    const g = new Chess();
    g.loadPgn(trimmed);
    if (g.history().length > 0) return g;
  } catch { /* fall through */ }
  // Extract optional [FEN "..."] header
  const fenMatch = trimmed.match(/\[FEN\s+"([^"]+)"\]/i);
  const startFen = fenMatch ? fenMatch[1] : undefined;
  // Strip headers and comments
  const body = trimmed
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/(1-0|0-1|1\/2-1\/2|\*)/g, " ")
    .trim();
  const tokens = body.split(/\s+/).filter(Boolean);
  let g: Chess;
  try { g = startFen ? new Chess(startFen) : new Chess(); }
  catch { g = new Chess(); }
  for (const tok of tokens) {
    try {
      const mv = g.move(tok, { strict: false } as never);
      if (!mv) return null;
    } catch { return null; }
  }
  return g.history().length > 0 ? g : null;
}


type SidebarTab = "analysis" | "explorer" | "pgn";

// ── Component ──
export default function Analysis() {
  // sidebar is always analysis now
  const [depth, setDepth] = useState(8);
  const [flipped, setFlipped] = useState(false);
  const [bottomTab, setBottomTab] = useState<"explorer" | "import" | "my-games">("explorer");
  const { user } = useAuth();
  const [myGames, setMyGames] = useState<Array<{ id: string; pgn: string; result: string | null; created_at: string; time_control_label: string; white_player_id: string; black_player_id: string }>>([]);
  const [myBotGames, setMyBotGames] = useState<Array<{ id: string; pgn: string; result: string; outcome: "win" | "loss" | "draw"; bot_name: string; bot_rating: number; player_color: "w" | "b"; created_at: string; time_control_label: string; move_count: number }>>([]);
  const [myGamesLoading, setMyGamesLoading] = useState(false);
  const [myGamesSource, setMyGamesSource] = useState<"online" | "bot">("online");
  const moveListRef = useRef<HTMLDivElement>(null);
  const stockfishReady = useRef(false);

  // PGN mode
  const [pgnInput, setPgnInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pgnMoveEvals, setPgnMoveEvals] = useState<MoveEval[]>([]);
  const [pgnCurrentIdx, setPgnCurrentIdx] = useState(-1);
  const [pgnComplete, setPgnComplete] = useState(false);
  const [error, setError] = useState("");
  const pgnDisplayGame = useRef(new Chess());
  const [pgnDisplayFen, setPgnDisplayFen] = useState("start");
  const [gameMeta, setGameMeta] = useState<GameMeta | null>(null);

  // Interactive mode
  const [liveGame, setLiveGame] = useState(new Chess());
  const [liveFen, setLiveFen] = useState("start");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [liveMoveHistory, setLiveMoveHistory] = useState<MoveEval[]>([]);
  const [liveLastMove, setLiveLastMove] = useState<{ from: string; to: string } | null>(null);
  const [liveEvaluating, setLiveEvaluating] = useState(false);
  const [liveCurrentEval, setLiveCurrentEval] = useState<{ cp: number; mate: number | null }>({ cp: 0, mate: null });
  const [liveViewIdx, setLiveViewIdx] = useState(-1);
  const prevEvalRef = useRef(0);

  // Variation builder (PGN review mode): allow alternative moves at any position,
  // displayed inline as (sanA sanB ...) with a Promote-to-mainline button.
  // Multiple variations can coexist — each anchored at its own `fromIdx`.
  // `fromIdx === -1` means "before the first move" (starting position).
  type VariationMove = { san: string; from: string; to: string; fen: string; color: "w" | "b"; moveNumber: number };
  type VariationT = { fromIdx: number; moves: VariationMove[] };
  const [variations, setVariations] = useState<VariationT[]>([]);
  const variationGameRef = useRef<Chess | null>(null);

  // Active variation = the one anchored at the current PGN index, if any.
  const variation = variations.find(v => v.fromIdx === pgnCurrentIdx) ?? null;

  // Explorer state
  const [explorerData, setExplorerData] = useState<MasterExplorerData | null>(null);
  const [explorerLoading, setExplorerLoading] = useState(false);

  // MultiPV (top lines suggestions) state
  const [multiPvCount, setMultiPvCount] = useState<number>(3);
  const [topLines, setTopLines] = useState<MultiPvLine[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);

  // Current FEN for explorer
  const currentFen = useMemo(() => {
    if (pgnComplete && pgnCurrentIdx >= 0 && pgnCurrentIdx < pgnMoveEvals.length) {
      return pgnMoveEvals[pgnCurrentIdx].fen;
    }
    if (liveViewIdx >= 0 && liveViewIdx < liveMoveHistory.length) {
      return liveMoveHistory[liveViewIdx].fen;
    }
    return liveGame.fen();
  }, [pgnComplete, pgnCurrentIdx, pgnMoveEvals, liveViewIdx, liveMoveHistory, liveGame]);

  // SAN move sequence up to the current view position (used to deep-link to ChessBase DB)
  const currentMovesSan = useMemo(() => {
    try {
      const g = new Chess();
      g.load(currentFen);
      // load() doesn't replay moves; we instead reconstruct from PGN/live history
      const moves: string[] = [];
      if (pgnComplete) {
        for (let i = 0; i <= pgnCurrentIdx && i < pgnMoveEvals.length; i++) moves.push(pgnMoveEvals[i].san);
      } else {
        const limit = liveViewIdx >= 0 ? liveViewIdx + 1 : liveMoveHistory.length;
        for (let i = 0; i < limit; i++) moves.push(liveMoveHistory[i].san);
      }
      return moves.join(" ");
    } catch { return ""; }
  }, [currentFen, pgnComplete, pgnCurrentIdx, pgnMoveEvals, liveViewIdx, liveMoveHistory]);

  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => { stockfishReady.current = true; }).catch(() => setError("Failed to load analysis engine"));
  }, []);

  // ── Game Review: classify each PGN move and compute accuracy ──
  const reviewClassifications = useMemo<MoveClass[]>(() => {
    if (!pgnComplete || pgnMoveEvals.length === 0) return [];
    const out: MoveClass[] = [];
    for (let i = 0; i < pgnMoveEvals.length; i++) {
      const cur = pgnMoveEvals[i];
      const prev = i === 0 ? { eval: 0, mate: null as number | null } : pgnMoveEvals[i - 1];
      // First ~12 plies treated as book (rough heuristic — replaces network book lookup)
      const isBookMove = i < 12;
      out.push(classifyMove({
        beforeEval: { cp: prev.eval, mate: prev.mate },
        afterEval: { cp: cur.eval, mate: cur.mate },
        color: cur.color,
        isBookMove,
      }).classification);
    }
    return out;
  }, [pgnComplete, pgnMoveEvals]);

  const reviewAccuracy = useMemo(() => {
    if (!pgnComplete || pgnMoveEvals.length === 0) return { white: 0, black: 0 };
    return computeAccuracy(pgnMoveEvals.map((m, i) => ({
      color: m.color,
      before: { cp: i === 0 ? 0 : pgnMoveEvals[i - 1].eval, mate: i === 0 ? null : pgnMoveEvals[i - 1].mate },
      after: { cp: m.eval, mate: m.mate },
    })));
  }, [pgnComplete, pgnMoveEvals]);

  const reviewSummary = useMemo(() => {
    const counts: Record<MoveClass, { w: number; b: number }> = {
      brilliant: { w: 0, b: 0 }, great: { w: 0, b: 0 }, best: { w: 0, b: 0 },
      book: { w: 0, b: 0 }, good: { w: 0, b: 0 }, inaccuracy: { w: 0, b: 0 },
      mistake: { w: 0, b: 0 }, blunder: { w: 0, b: 0 },
    };
    reviewClassifications.forEach((c, i) => {
      const color = pgnMoveEvals[i].color;
      counts[c][color === "w" ? "w" : "b"]++;
    });
    return counts;
  }, [reviewClassifications, pgnMoveEvals]);

  // Deep-link support:
  //  • ?game=<id>   → fetch PGN of an online game and auto-analyze it
  //  • ?pgn=<text>  → load a raw PGN (used by bot/local games where no game row exists)
  // Both flows switch the bottom tab to "Import PGN" so the user lands directly
  // on their game in the Learn → Analysis area.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");
    const pgnParam = params.get("pgn");

    if (pgnParam && pgnParam.trim()) {
      const pgn = pgnParam;
      setPgnInput(pgn);
      setBottomTab("import");
      const tryRun = () => {
        if (stockfishReady.current) { void runAnalysisFromText(pgn); }
        else setTimeout(tryRun, 200);
      };
      tryRun();
      return;
    }

    if (!gameId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("online_games")
        .select("pgn, result, time_control_label, created_at, white_player_id, black_player_id")
        .eq("id", gameId)
        .maybeSingle();
      if (cancelled) return;
      const row = data as any;
      const pgn = row?.pgn as string | undefined;

      // Fetch both player profiles for the header banner
      if (row?.white_player_id && row?.black_player_id) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, rating, country_flag")
          .in("user_id", [row.white_player_id, row.black_player_id]);
        const map: Record<string, PlayerInfo> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p; });
        if (!cancelled) {
          setGameMeta({
            white: map[row.white_player_id] || null,
            black: map[row.black_player_id] || null,
            result: row.result || null,
            time_control_label: row.time_control_label || "—",
            created_at: row.created_at,
          });
        }
      }

      if (pgn && pgn.trim()) {
        setPgnInput(pgn);
        setBottomTab("import");
        const tryRun = () => {
          if (stockfishReady.current) { void runAnalysisFromText(pgn); }
          else setTimeout(tryRun, 200);
        };
        tryRun();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch MasterChess DB data when position changes
  useEffect(() => {
    if (bottomTab !== "explorer") return;
    let cancelled = false;
    setExplorerLoading(true);
    fetchMasterChessExplorer(currentFen).then(data => {
      if (cancelled) return;
      setExplorerData(data);
      setExplorerLoading(false);
    }).catch(() => { if (!cancelled) setExplorerLoading(false); });
    return () => { cancelled = true; };
  }, [currentFen, bottomTab]);

  // Compute top engine variations (MultiPV) for the current position.
  // Re-runs whenever the position, requested line count, or analysis depth changes.
  useEffect(() => {
    if (!stockfishReady.current) return;
    let cancelled = false;
    setLinesLoading(true);
    const engine = getStockfishEngine();
    // Use a slightly capped depth for snappy multi-line search
    const lineDepth = Math.min(depth, 16);
    engine.getMultiPV(currentFen, multiPvCount, lineDepth).then((lines) => {
      if (cancelled) return;
      // Convert UCI moves → SAN for display
      const enriched = lines.map((ln) => {
        const san: string[] = [];
        try {
          const g = new Chess(currentFen);
          for (const uci of ln.pv.slice(0, 8)) {
            if (!uci || uci.length < 4) break;
            const from = uci.slice(0, 2);
            const to = uci.slice(2, 4);
            const promotion = uci.length > 4 ? uci[4] : undefined;
            const mv = g.move({ from, to, promotion });
            if (!mv) break;
            san.push(mv.san);
          }
        } catch { /* ignore */ }
        return { ...ln, pvSan: san };
      });
      setTopLines(enriched);
      setLinesLoading(false);
    }).catch(() => { if (!cancelled) setLinesLoading(false); });
    return () => { cancelled = true; };
  }, [currentFen, multiPvCount, depth]);

  // ── Interactive logic ──
  const evaluatePosition = useCallback(async (fen: string, fenBefore: string, moveSan: string, moveFrom: string, moveTo: string, color: "w" | "b", moveNum: number) => {
    if (!stockfishReady.current) return;
    setLiveEvaluating(true);
    const engine = getStockfishEngine();
    try {
      const cached = await getCachedStockfishEvals([fen], depth);
      const posEval = cached.get(fen) ?? await engine.evaluate(fen, depth);
      if (!cached.has(fen)) void saveCachedStockfishEval(fen, depth, posEval.evaluation, posEval.mate);
      const evalCp = scoreToWhitePov(fen, posEval.evaluation, posEval.mate);
      const mateW = mateToWhitePov(fen, posEval.mate);
      setLiveCurrentEval({ cp: evalCp, mate: mateW });
      const moveEval: MoveEval = {
        san: moveSan, fen, fenBefore, from: moveFrom, to: moveTo, color, moveNumber: moveNum,
        eval: evalCp, mate: mateW,
      };
      prevEvalRef.current = evalCp;
      setLiveMoveHistory(prev => [...prev, moveEval]);
    } catch (e) { console.error("Eval error:", e); } finally { setLiveEvaluating(false); }
  }, [depth]);

  const handleInteractiveSquareClick = useCallback((square: Square) => {
    // PGN review mode: clicking pieces builds an alternative variation
    if (pgnComplete) {
      // Build / extend a variation starting from the current pgnCurrentIdx position
      let g: Chess;
      if (variation && variation.fromIdx === pgnCurrentIdx) {
        g = variationGameRef.current ?? new Chess();
      } else {
        g = pgnCurrentIdx === -1 ? new Chess() : new Chess(pgnMoveEvals[pgnCurrentIdx].fen);
        variationGameRef.current = g;
      }
      // If a variation is already in progress and the user clicked back to a deeper index,
      // ensure the on-screen board matches g.fen()
      if (selectedSquare) {
        try {
          const move = g.move({ from: selectedSquare, to: square, promotion: "q" });
          if (move) {
            const baseLen = pgnCurrentIdx + 1; // half-moves played in the main line
            const totalPly = baseLen + (variation && variation.fromIdx === pgnCurrentIdx ? variation.moves.length : 0);
            const moveNumber = Math.floor(totalPly / 2) + 1;
            const entry = { san: move.san, from: move.from, to: move.to, fen: g.fen(), color: move.color as "w" | "b", moveNumber };
            const next = (variation && variation.fromIdx === pgnCurrentIdx)
              ? { fromIdx: pgnCurrentIdx, moves: [...variation.moves, entry] }
              : { fromIdx: pgnCurrentIdx, moves: [entry] };
            setVariations(prev => {
              const without = prev.filter(v => v.fromIdx !== pgnCurrentIdx);
              return [...without, next];
            });
            variationGameRef.current = g;
            pgnDisplayGame.current = new Chess(g.fen());
            setPgnDisplayFen(g.fen());
            setSelectedSquare(null); setLegalMoves([]);
            return;
          }
        } catch {}
      }
      const piece = g.get(square);
      if (piece && piece.color === g.turn()) {
        setSelectedSquare(square);
        setLegalMoves(g.moves({ square, verbose: true }).map(m => m.to as Square));
      } else { setSelectedSquare(null); setLegalMoves([]); }
      return;
    }
    if (liveViewIdx >= 0) return;
    const game = liveGame;
    if (selectedSquare) {
      try {
        const fenBefore = game.fen();
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          const newFen = game.fen();
          setLiveFen(newFen); setLiveLastMove({ from: move.from, to: move.to });
          setSelectedSquare(null); setLegalMoves([]); setLiveGame(new Chess(newFen));
          evaluatePosition(newFen, fenBefore, move.san, move.from, move.to, move.color, Math.ceil(liveMoveHistory.length / 2) + 1);
          return;
        }
      } catch {}
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else { setSelectedSquare(null); setLegalMoves([]); }
  }, [liveGame, selectedSquare, evaluatePosition, liveMoveHistory.length, liveViewIdx, pgnComplete, pgnCurrentIdx, pgnMoveEvals, variation]);

  // Play an explorer move
  const playExplorerMove = useCallback((san: string) => {
    if (pgnComplete) return; // can't add moves to PGN analysis
    if (liveViewIdx >= 0) return;
    const game = liveGame;
    try {
      const fenBefore = game.fen();
      const move = game.move(san);
      if (move) {
        const newFen = game.fen();
        setLiveFen(newFen); setLiveLastMove({ from: move.from, to: move.to });
        setSelectedSquare(null); setLegalMoves([]); setLiveGame(new Chess(newFen));
        evaluatePosition(newFen, fenBefore, move.san, move.from, move.to, move.color, Math.ceil(liveMoveHistory.length / 2) + 1);
      }
    } catch {}
  }, [liveGame, evaluatePosition, liveMoveHistory.length, liveViewIdx, pgnComplete]);

  const resetInteractive = useCallback(() => {
    const fresh = new Chess();
    setLiveGame(fresh); setLiveFen("start"); setSelectedSquare(null); setLegalMoves([]);
    setLiveMoveHistory([]); setLiveLastMove(null); setLiveEvaluating(false);
    setLiveCurrentEval({ cp: 0, mate: null });
    setLiveViewIdx(-1); prevEvalRef.current = 0;
    setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    setExplorerData(null);
  }, []);

  const undoLastMove = useCallback(() => {
    if (liveMoveHistory.length === 0) return;
    const newHistory = liveMoveHistory.slice(0, -1);
    const game = new Chess();
    for (const mv of newHistory) game.move(mv.san);
    setLiveGame(new Chess(game.fen())); setLiveFen(game.fen()); setLiveMoveHistory(newHistory);
    setLiveLastMove(newHistory.length > 0 ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to } : null);
    setSelectedSquare(null); setLegalMoves([]); setLiveViewIdx(-1);
    prevEvalRef.current = newHistory.length > 0 ? newHistory[newHistory.length - 1].eval : 0;
    if (newHistory.length > 0) {
      const last = newHistory[newHistory.length - 1];
      setLiveCurrentEval({ cp: last.eval, mate: last.mate });
    } else { setLiveCurrentEval({ cp: 0, mate: null }); }
  }, [liveMoveHistory]);

  const goToLiveMove = useCallback((idx: number) => {
    if (idx < 0) {
      setLiveViewIdx(-1);
      const game = new Chess();
      for (const mv of liveMoveHistory) game.move(mv.san);
      setLiveGame(new Chess(game.fen())); setLiveFen(game.fen());
      setLiveLastMove(liveMoveHistory.length > 0 ? { from: liveMoveHistory[liveMoveHistory.length - 1].from, to: liveMoveHistory[liveMoveHistory.length - 1].to } : null);
    } else {
      const clamped = Math.min(idx, liveMoveHistory.length - 1);
      setLiveViewIdx(clamped);
      const mv = liveMoveHistory[clamped];
      setLiveFen(mv.fen); setLiveGame(new Chess(mv.fen)); setLiveLastMove({ from: mv.from, to: mv.to });
    }
    setSelectedSquare(null); setLegalMoves([]);
  }, [liveMoveHistory]);

  // ── PGN logic ──
  const goToPgnMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, pgnMoveEvals.length - 1));
    setPgnCurrentIdx(clamped);
    pgnDisplayGame.current = clamped === -1 ? new Chess() : new Chess(pgnMoveEvals[clamped].fen);
    setPgnDisplayFen(pgnDisplayGame.current.fen());
    // Variations persist across navigation — they remain visible inline so the
    // user can browse the main line and still see all the alt lines they built.
    setSelectedSquare(null); setLegalMoves([]);
  }, [pgnMoveEvals]);

  // Promote the current variation into the main line, replacing any tail moves.
  const promoteVariation = useCallback(async () => {
    if (!variation || variation.moves.length === 0) return;
    const baseLen = variation.fromIdx + 1;
    const baseEvals = pgnMoveEvals.slice(0, baseLen);

    // Evaluate each variation move with the engine if ready
    const engine = stockfishReady.current ? getStockfishEngine() : null;
    const newEvals: MoveEval[] = [...baseEvals];
    for (let i = 0; i < variation.moves.length; i++) {
      const v = variation.moves[i];
      const fenBefore = i === 0
        ? (variation.fromIdx === -1 ? new Chess().fen() : pgnMoveEvals[variation.fromIdx].fen)
        : variation.moves[i - 1].fen;
      let evalCp = 0; let mateW: number | null = null;
      if (engine) {
        try {
          const posEval = await engine.evaluate(v.fen, depth);
          evalCp = scoreToWhitePov(v.fen, posEval.evaluation, posEval.mate);
          mateW = mateToWhitePov(v.fen, posEval.mate);
        } catch {}
      }
      newEvals.push({
        san: v.san, fen: v.fen, fenBefore, from: v.from, to: v.to,
        color: v.color, moveNumber: v.moveNumber, eval: evalCp, mate: mateW,
      });
    }
    setPgnMoveEvals(newEvals);
    setVariations(prev => prev.filter(v => v.fromIdx !== variation.fromIdx));
    variationGameRef.current = null;
    const newIdx = newEvals.length - 1;
    setPgnCurrentIdx(newIdx);
    pgnDisplayGame.current = new Chess(newEvals[newIdx].fen);
    setPgnDisplayFen(newEvals[newIdx].fen);
  }, [variation, pgnMoveEvals, depth]);

  const discardVariation = useCallback(() => {
    if (!variation) return;
    setVariation(null);
    variationGameRef.current = null;
    if (pgnCurrentIdx === -1) {
      pgnDisplayGame.current = new Chess();
      setPgnDisplayFen("start");
    } else {
      pgnDisplayGame.current = new Chess(pgnMoveEvals[pgnCurrentIdx].fen);
      setPgnDisplayFen(pgnMoveEvals[pgnCurrentIdx].fen);
    }
    setSelectedSquare(null); setLegalMoves([]);
  }, [variation, pgnCurrentIdx, pgnMoveEvals]);

  useEffect(() => {
    if (!pgnComplete && liveMoveHistory.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const evals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
      const idx = pgnComplete ? pgnCurrentIdx : (liveViewIdx >= 0 ? liveViewIdx : liveMoveHistory.length - 1);
      const goFn = pgnComplete ? goToPgnMove : goToLiveMove;
      switch (e.key) {
        case "ArrowLeft": goFn(idx - 1); break;
        case "ArrowRight": goFn(idx + 1); break;
        case "Home": goFn(-1); break;
        case "End": goFn(evals.length - 1); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pgnComplete, pgnCurrentIdx, goToPgnMove, pgnMoveEvals.length, liveMoveHistory, liveViewIdx, goToLiveMove]);

  const runAnalysis = async () => {
    setError(""); setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
    const trimmed = pgnInput.trim();
    if (!trimmed) { setError("Please enter a PGN or move list."); return; }
    const parseGame = loadPgnRobust(trimmed);
    if (!parseGame) { setError("Could not parse PGN or move list."); return; }
    const history = parseGame.history({ verbose: true });
    if (history.length === 0) { setError("No moves found."); return; }
    // Determine starting FEN (respect [FEN] tag if present)
    const fenTag = trimmed.match(/\[FEN\s+"([^"]+)"\]/i);
    const startFen = fenTag ? fenTag[1] : undefined;
    if (!stockfishReady.current) {
      const engine = getStockfishEngine(); await engine.init(); stockfishReady.current = true;
    }
    setAnalyzing(true);
    const engine = getStockfishEngine(); engine.newGame();
    const fens: { move: typeof history[number]; fenBefore: string; fenAfter: string }[] = [];
    const evalGame = startFen ? new Chess(startFen) : new Chess();
    for (const move of history) {
      const fenBefore = evalGame.fen();
      evalGame.move(move.san);
      fens.push({ move, fenBefore, fenAfter: evalGame.fen() });
    }
    const cached = await getCachedStockfishEvals(fens.map(f => f.fenAfter), depth);
    const evals: MoveEval[] = [];
    for (let i = 0; i < fens.length; i++) {
      setProgress(Math.round(((i + 1) / fens.length) * 100));
      const { move, fenBefore, fenAfter } = fens[i];
      const posEval = cached.get(fenAfter) ?? await engine.evaluate(fenAfter, depth);
      if (!cached.has(fenAfter)) void saveCachedStockfishEval(fenAfter, depth, posEval.evaluation, posEval.mate);
      const evalCp = scoreToWhitePov(fenAfter, posEval.evaluation, posEval.mate);
      evals.push({
        san: move.san, fen: fenAfter, fenBefore, from: move.from, to: move.to,
        color: move.color, moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp, mate: mateToWhitePov(fenAfter, posEval.mate),
      });
    }
    setPgnMoveEvals(evals); setPgnComplete(true); setAnalyzing(false); setProgress(100); goToPgnMove(0);
  };

  const clearPgnAnalysis = () => {
    setPgnInput(""); setPgnMoveEvals([]); setPgnComplete(false);
    setPgnCurrentIdx(-1); setError(""); setProgress(0);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
  };

  // Load this user's finished online + bot games when the My Games tab opens.
  useEffect(() => {
    if (bottomTab !== "my-games" || !user) return;
    setMyGamesLoading(true);
    Promise.all([
      supabase
        .from("online_games")
        .select("id, pgn, result, created_at, time_control_label, white_player_id, black_player_id")
        .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("bot_games" as any)
        .select("id, pgn, result, outcome, bot_name, bot_rating, player_color, created_at, time_control_label, move_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]).then(([online, bots]) => {
      setMyGames((online.data as any) || []);
      setMyBotGames(((bots.data as unknown) as any[]) || []);
      setMyGamesLoading(false);
    });
  }, [bottomTab, user]);

  // Load a saved game's PGN into the import box and immediately run analysis.
  const loadAndAnalyzeMyGame = (pgn: string) => {
    if (!pgn || !pgn.trim()) {
      setError("This game has no recorded moves.");
      setBottomTab("import");
      return;
    }
    setPgnInput(pgn);
    setBottomTab("import");
    // Run on next tick so state has flushed before runAnalysis reads pgnInput.
    setTimeout(() => { void runAnalysisFromText(pgn); }, 30);
  };

  // Variant of runAnalysis that takes the PGN text directly (avoids React state lag).
  const runAnalysisFromText = async (pgnText: string) => {
    setError(""); setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
    const trimmed = pgnText.trim();
    if (!trimmed) { setError("Empty game."); return; }
    const parseGame = loadPgnRobust(trimmed);
    if (!parseGame) { setError("Could not parse PGN."); return; }
    const history = parseGame.history({ verbose: true });
    if (history.length === 0) { setError("No moves found."); return; }
    const fenTag = trimmed.match(/\[FEN\s+"([^"]+)"\]/i);
    const startFen = fenTag ? fenTag[1] : undefined;
    if (!stockfishReady.current) {
      const engine = getStockfishEngine(); await engine.init(); stockfishReady.current = true;
    }
    setAnalyzing(true);
    const engine = getStockfishEngine(); engine.newGame();
    const fens: { move: typeof history[number]; fenBefore: string; fenAfter: string }[] = [];
    const evalGame = startFen ? new Chess(startFen) : new Chess();
    for (const move of history) {
      const fenBefore = evalGame.fen();
      evalGame.move(move.san);
      fens.push({ move, fenBefore, fenAfter: evalGame.fen() });
    }
    const cached = await getCachedStockfishEvals(fens.map(f => f.fenAfter), depth);
    const evals: MoveEval[] = [];
    for (let i = 0; i < fens.length; i++) {
      setProgress(Math.round(((i + 1) / fens.length) * 100));
      const { move, fenBefore, fenAfter } = fens[i];
      const posEval = cached.get(fenAfter) ?? await engine.evaluate(fenAfter, depth);
      if (!cached.has(fenAfter)) void saveCachedStockfishEval(fenAfter, depth, posEval.evaluation, posEval.mate);
      const evalCp = scoreToWhitePov(fenAfter, posEval.evaluation, posEval.mate);
      evals.push({
        san: move.san, fen: fenAfter, fenBefore, from: move.from, to: move.to,
        color: move.color, moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp, mate: mateToWhitePov(fenAfter, posEval.mate),
      });
    }
    setPgnMoveEvals(evals); setPgnComplete(true); setAnalyzing(false); setProgress(100); goToPgnMove(0);
  };

  const downloadPGN = () => {
    const evals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
    if (evals.length === 0) return;
    let pgn = `[Event "Game Analysis"]\n\n`;
    evals.forEach((mv) => {
      if (mv.color === "w") pgn += `${mv.moveNumber}. `;
      pgn += `${mv.san} `;
    });
    const blob = new Blob([pgn.trim()], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "analysis.pgn"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived ──
  const activeEvals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
  const activeIdx = pgnComplete ? pgnCurrentIdx : (liveViewIdx >= 0 ? liveViewIdx : liveMoveHistory.length - 1);
  const currentEval = activeIdx >= 0 && activeIdx < activeEvals.length ? activeEvals[activeIdx] : null;
  const evalCpForBar = !pgnComplete ? liveCurrentEval.cp : (currentEval?.eval ?? 0);
  const evalMateForBar = !pgnComplete ? liveCurrentEval.mate : (currentEval?.mate ?? null);
  const evalPercent = evalToBarPct(evalCpForBar, evalMateForBar);
  const lastMoveDisplay = pgnComplete
    ? (pgnCurrentIdx >= 0 ? { from: pgnMoveEvals[pgnCurrentIdx].from, to: pgnMoveEvals[pgnCurrentIdx].to } : null)
    : liveLastMove;
  const boardGame = pgnComplete ? pgnDisplayGame.current : liveGame;
  const graphData = useMemo(() => activeEvals.map((ev) => ({
    eval: Math.max(-500, Math.min(500, ev.mate !== null ? (ev.mate > 0 ? 500 : -500) : ev.eval)),
  })), [activeEvals]);
  const goFn = pgnComplete ? goToPgnMove : goToLiveMove;

  // bottomTab declared at top of component

  // ── Render ──
  return (
    <div className="min-h-screen bg-[hsl(220,20%,12%)]">
      <Navbar />
      <main className="flex flex-col items-center pt-4 pb-8 px-2 lg:px-4 min-h-[calc(100vh-64px)]">
        {/* ── PLAYER BANNER (when reviewing a saved game) ── */}
        {gameMeta && (gameMeta.white || gameMeta.black) && (
          <div className="w-full max-w-[920px] mb-3 rounded-lg border border-border/30 bg-[hsl(220,18%,16%)] px-4 py-3 flex items-center justify-between gap-3">
            <PlayerSide info={gameMeta.white} side="white" result={gameMeta.result} />
            <div className="flex flex-col items-center gap-1 px-2 text-center shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">vs</span>
              <Badge variant="outline" className="text-[10px] font-mono">{gameMeta.time_control_label}</Badge>
              {gameMeta.result && (
                <span className="text-[10px] text-muted-foreground font-mono">{gameMeta.result}</span>
              )}
              <span className="text-[9px] text-muted-foreground">
                {new Date(gameMeta.created_at).toLocaleDateString()}
              </span>
            </div>
            <PlayerSide info={gameMeta.black} side="black" result={gameMeta.result} alignRight />
          </div>
        )}

        {/* ── TOP ROW: Board + Analysis Sidebar ── */}
        <div className="flex justify-center items-start gap-0 w-full max-w-[920px]">
          {/* ── LEFT: Eval Bar + Board ── */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1 self-start ml-10">
              <div className="w-4 h-4 rounded-sm bg-[hsl(220,15%,20%)] border border-border/30" />
              <span className="text-xs font-semibold text-foreground/80">Black</span>
              {explorerData?.opening && (
                <Badge variant="outline" className="text-[10px] ml-2">{explorerData.opening.eco} {explorerData.opening.name}</Badge>
              )}
            </div>

            <div className="flex items-stretch">
              {/* Eval Bar */}
              <div className="w-7 shrink-0 rounded-sm overflow-hidden mr-1.5 relative flex flex-col" style={{ minHeight: 420 }}>
                <motion.div className="bg-[hsl(220,15%,18%)]" initial={{ flexBasis: "50%" }} animate={{ flexBasis: `${100 - evalPercent}%` }} transition={{ type: "spring", stiffness: 180, damping: 22 }} style={{ flexShrink: 0 }} />
                <motion.div className="bg-[hsl(60,10%,90%)]" initial={{ flexBasis: "50%" }} animate={{ flexBasis: `${evalPercent}%` }} transition={{ type: "spring", stiffness: 180, damping: 22 }} style={{ flexShrink: 0 }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`text-[9px] font-bold font-mono px-0.5 ${evalCpForBar >= 0 ? 'text-[hsl(220,15%,18%)]' : 'text-[hsl(60,10%,90%)]'}`}>
                    {formatEval(evalCpForBar, evalMateForBar)}
                  </span>
                </div>
                {liveEvaluating && !pgnComplete && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                  </div>
                )}
              </div>

              {/* Board */}
              <div className="w-[min(50vw,460px)]">
                <ChessBoard
                  game={boardGame}
                  flipped={flipped}
                  selectedSquare={selectedSquare}
                  legalMoves={legalMoves}
                  lastMove={lastMoveDisplay}
                  isGameOver={false}
                  isPlayerTurn={(!pgnComplete && liveViewIdx < 0) || pgnComplete}
                  onSquareClick={handleInteractiveSquareClick}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 self-start ml-10">
              <div className="w-4 h-4 rounded-sm bg-[hsl(60,10%,90%)] border border-border/30" />
              <span className="text-xs font-semibold text-foreground/80">White</span>
            </div>

            {/* Board controls */}
            <div className="flex items-center gap-1 mt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFlipped(!flipped)}>
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetInteractive} title="New analysis">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Analysis Sidebar ── */}
          <div className="w-[340px] lg:w-[380px] shrink-0 ml-3 flex flex-col bg-[hsl(220,18%,16%)] rounded-lg border border-border/20 overflow-hidden" style={{ minHeight: 500 }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/20 bg-[hsl(220,18%,14%)]">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Analysis</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Stockfish · D{depth}</span>
            </div>

            {/* Engine eval */}
            <div className="px-3 py-2 border-b border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-foreground">{formatEval(evalCpForBar, evalMateForBar)}</span>
              </div>
              {/* Depth slider */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-muted-foreground">Depth</span>
                <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} className="flex-1" />
                <span className="text-[9px] text-muted-foreground w-4 text-right">{depth}</span>
              </div>
            </div>

            {/* Eval graph */}
            {activeEvals.length > 1 && (
              <div className="px-3 py-2 border-b border-border/20">
                <EvalGraph
                  evals={activeEvals.map(e => ({ san: e.san, eval: e.eval, mate: e.mate, color: e.color }))}
                  currentIdx={activeIdx}
                  onSelect={(i) => goFn(i)}
                  height={64}
                />
              </div>
            )}

            {/* Top engine lines (MultiPV) */}
            <div className="px-3 py-2 border-b border-border/20 bg-[hsl(220,18%,15%)]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Top Lines</span>
                  {linesLoading && <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMultiPvCount(n)}
                      className={`w-5 h-5 text-[10px] font-mono rounded transition-colors ${
                        multiPvCount === n
                          ? "bg-primary text-primary-foreground"
                          : "bg-[hsl(220,18%,22%)] text-muted-foreground hover:text-foreground"
                      }`}
                      title={`Show top ${n} ${n === 1 ? "line" : "lines"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {topLines.length === 0 && !linesLoading ? (
                <p className="text-[10px] text-muted-foreground py-1">Calculating best moves…</p>
              ) : (
                <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                  {topLines.map((ln, i) => {
                    const isWhiteToMove = (() => {
                      try { return new Chess(currentFen).turn() === "w"; } catch { return true; }
                    })();
                    const evalCp = isWhiteToMove ? ln.eval : -ln.eval;
                    const evalMate = ln.mate !== null ? (isWhiteToMove ? ln.mate : -ln.mate) : null;
                    const evalDisplay = formatEval(evalCp, evalMate);
                    const canClick = !pgnComplete && liveViewIdx < 0 && ln.pvSan.length > 0;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (!canClick) return;
                          const first = ln.pvSan[0];
                          if (first) playExplorerMove(first);
                        }}
                        disabled={!canClick}
                        className="w-full flex items-start gap-2 text-left px-1.5 py-1 rounded hover:bg-[hsl(220,18%,22%)] transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                      >
                        <span className={`text-[10px] font-mono font-bold shrink-0 w-12 text-right ${
                          evalMate !== null
                            ? "text-yellow-400"
                            : evalCp >= 30
                              ? "text-green-400"
                              : evalCp <= -30
                                ? "text-red-400"
                                : "text-foreground/80"
                        }`}>
                          {evalDisplay}
                        </span>
                        <span className="text-[11px] font-mono text-foreground/80 leading-tight flex-1 min-w-0 break-words">
                          {ln.pvSan.length ? ln.pvSan.join(" ") : <span className="text-muted-foreground">…</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {(pgnComplete || liveViewIdx >= 0) && topLines.length > 0 && (
                <p className="text-[9px] text-muted-foreground/70 mt-1 italic">Suggestions only — exit review mode to play a line.</p>
              )}
            </div>

            {/* Game Review summary (Stockfish-style) */}
            {pgnComplete && pgnMoveEvals.length > 0 && (
              <div className="px-3 py-2 border-b border-border/20 bg-[hsl(220,18%,15%)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Game Review</span>
                  <span className="text-[9px] text-muted-foreground">Stockfish</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-1.5">
                  <div className="rounded bg-[hsl(220,18%,22%)] px-2 py-1.5 text-center">
                    <div className="text-[9px] text-muted-foreground uppercase">White Acc</div>
                    <div className="text-sm font-bold font-mono text-foreground">{reviewAccuracy.white.toFixed(1)}%</div>
                  </div>
                  <div className="rounded bg-[hsl(220,18%,22%)] px-2 py-1.5 text-center">
                    <div className="text-[9px] text-muted-foreground uppercase">Black Acc</div>
                    <div className="text-sm font-bold font-mono text-foreground">{reviewAccuracy.black.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[9px]">
                  {(["best", "book", "inaccuracy", "mistake", "blunder"] as MoveClass[]).map(k => (
                    <div key={k} className={`rounded border px-1 py-0.5 ${CLASS_META[k].bg} ${CLASS_META[k].color}`}>
                      <div className="font-bold uppercase tracking-wider truncate">{CLASS_META[k].label}</div>
                      <div className="font-mono">W{reviewSummary[k].w} · B{reviewSummary[k].b}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Move list */}
            <div className="flex-1 overflow-y-auto px-2 py-1 max-h-[240px]" ref={moveListRef}>
              {activeEvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MousePointerClick className="h-7 w-7 mb-2 text-primary/40" />
                  <p className="text-sm">Click pieces to make moves</p>
                  <p className="text-[10px] mt-1">or import a PGN below</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                  {activeEvals.map((mv, i) => {
                    const isActive = activeIdx === i && !variation;
                    const showNum = mv.color === "w";
                    const showVarHere = pgnComplete && variation && variation.fromIdx === i;
                    return (
                      <div key={i} className={`contents`}>
                        <button onClick={() => goFn(i)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                            isActive ? "bg-[hsl(120,40%,35%)] text-white" : "hover:bg-[hsl(220,18%,22%)] text-foreground/80"
                          } ${mv.color === "w" ? "col-start-1" : "col-start-2"}`}>
                          {showNum && <span className="text-muted-foreground/50 font-mono w-5 text-right shrink-0 text-[10px]">{mv.moveNumber}.</span>}
                          {!showNum && <span className="w-5 shrink-0" />}
                          <span className="font-mono font-medium">{mv.san}</span>
                          {pgnComplete && reviewClassifications[i] && (
                            <span className={`ml-auto text-[10px] font-bold ${CLASS_META[reviewClassifications[i]].color}`}>
                              {CLASS_META[reviewClassifications[i]].symbol}
                            </span>
                          )}
                        </button>
                        {showVarHere && (
                          <div className="col-span-2 ml-6 my-0.5 px-2 py-1 rounded border border-primary/30 bg-[hsl(45,80%,55%)]/10 text-[11px] text-foreground/90 flex items-center flex-wrap gap-x-1 gap-y-0.5">
                            <span className="text-primary font-mono">(</span>
                            {variation.moves.map((vm, vi) => (
                              <span key={vi} className="font-mono">
                                {vm.color === "w" && <span className="text-muted-foreground/60 mr-0.5">{vm.moveNumber}.</span>}
                                {vm.color === "b" && vi === 0 && <span className="text-muted-foreground/60 mr-0.5">{vm.moveNumber}…</span>}
                                {vm.san}
                                {vi < variation.moves.length - 1 ? " " : ""}
                              </span>
                            ))}
                            <span className="text-primary font-mono">)</span>
                            <Button size="sm" variant="default" className="ml-2 h-5 px-2 text-[9px] bg-primary text-primary-foreground" onClick={promoteVariation}>
                              Promote
                            </Button>
                            <Button size="sm" variant="ghost" className="h-5 px-2 text-[9px]" onClick={discardVariation}>
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Variation starting from the very beginning (fromIdx === -1) */}
                  {pgnComplete && variation && variation.fromIdx === -1 && (
                    <div className="col-span-2 ml-6 my-0.5 px-2 py-1 rounded border border-primary/30 bg-[hsl(45,80%,55%)]/10 text-[11px] text-foreground/90 flex items-center flex-wrap gap-x-1 gap-y-0.5">
                      <span className="text-primary font-mono">(</span>
                      {variation.moves.map((vm, vi) => (
                        <span key={vi} className="font-mono">
                          {vm.color === "w" && <span className="text-muted-foreground/60 mr-0.5">{vm.moveNumber}.</span>}
                          {vm.color === "b" && vi === 0 && <span className="text-muted-foreground/60 mr-0.5">{vm.moveNumber}…</span>}
                          {vm.san}
                          {vi < variation.moves.length - 1 ? " " : ""}
                        </span>
                      ))}
                      <span className="text-primary font-mono">)</span>
                      <Button size="sm" variant="default" className="ml-2 h-5 px-2 text-[9px] bg-primary text-primary-foreground" onClick={promoteVariation}>Promote</Button>
                      <Button size="sm" variant="ghost" className="h-5 px-2 text-[9px]" onClick={discardVariation}>✕</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom navigation */}
            <div className="border-t border-border/20 px-3 py-2 flex items-center justify-between bg-[hsl(220,18%,14%)]">
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(-1)} disabled={activeEvals.length === 0}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeIdx - 1)} disabled={activeIdx <= -1}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeIdx + 1)} disabled={activeIdx >= activeEvals.length - 1}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeEvals.length - 1)} disabled={activeIdx >= activeEvals.length - 1}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {!pgnComplete && liveMoveHistory.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={undoLastMove}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Undo
                  </Button>
                )}
                {activeEvals.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={downloadPGN}>
                    <Download className="h-3 w-3 mr-1" /> PGN
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Explorer & Import (always visible) ── */}
        <div className="w-full max-w-[920px] mt-4">
          <div className="bg-[hsl(220,18%,16%)] rounded-lg border border-border/20 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border/20">
              <BottomTabButton active={bottomTab === "explorer"} onClick={() => setBottomTab("explorer")} icon={<Database className="h-3.5 w-3.5" />} label="MasterChess DB" />
              <BottomTabButton active={bottomTab === "my-games"} onClick={() => setBottomTab("my-games")} icon={<Swords className="h-3.5 w-3.5" />} label="My Games" />
              <BottomTabButton active={bottomTab === "import"} onClick={() => setBottomTab("import")} icon={<Upload className="h-3.5 w-3.5" />} label="Import PGN" />
            </div>

            <AnimatePresence mode="wait">
              {/* ── EXPLORER (MasterChess DB only) ── */}
              {bottomTab === "explorer" && (
                <motion.div key="explorer-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-border/10">
                    <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px]">MasterChess Database</Badge>
                    {explorerData && (
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {formatGames(explorerData.totalGames)} games
                        {explorerData.opening && <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">{explorerData.opening.eco} {explorerData.opening.name}</Badge>}
                      </span>
                    )}
                  </div>

                  {explorerLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground ml-2">Loading games...</span>
                    </div>
                  ) : explorerData && explorerData.moves.length > 0 ? (
                    <div>
                      {/* Win/Draw/Loss bar */}
                      {explorerData.totalGames > 0 && (
                        <div className="px-4 py-2 border-b border-border/10">
                          <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-[hsl(0,0%,95%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.white / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-[hsl(220,15%,20%)]">{((explorerData.white / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-[hsl(0,0%,60%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.draws / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-white">{((explorerData.draws / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-[hsl(220,15%,20%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.black / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-[hsl(0,0%,90%)]">{((explorerData.black / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-[60px_1fr_50px_50px_50px_60px] gap-0 text-[9px] text-muted-foreground px-4 py-1.5 border-b border-border/10 uppercase tracking-wider font-semibold">
                        <span>Move</span><span>Win bar</span><span className="text-center">W%</span><span className="text-center">D%</span><span className="text-center">L%</span><span className="text-right">Games</span>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {explorerData.moves.sort((a, b) => b.games - a.games).map((mv) => (
                          <button key={mv.san} onClick={() => playExplorerMove(mv.san)}
                            className="w-full grid grid-cols-[60px_1fr_50px_50px_50px_60px] gap-0 text-[11px] px-4 py-1.5 hover:bg-[hsl(220,18%,22%)] transition-colors border-b border-border/5">
                            <span className="font-mono font-bold text-foreground">{mv.san}</span>
                            <div className="flex items-center pr-3">
                              <div className="flex h-2.5 w-full rounded-full overflow-hidden">
                                <div className="bg-[hsl(0,0%,92%)]" style={{ width: `${mv.winRate}%` }} />
                                <div className="bg-[hsl(0,0%,60%)]" style={{ width: `${mv.drawRate}%` }} />
                                <div className="bg-[hsl(220,15%,22%)]" style={{ width: `${mv.lossRate}%` }} />
                              </div>
                            </div>
                            <span className="text-center text-[hsl(0,0%,90%)]">{mv.winRate.toFixed(0)}</span>
                            <span className="text-center text-muted-foreground">{mv.drawRate.toFixed(0)}</span>
                            <span className="text-center text-muted-foreground/70">{mv.lossRate.toFixed(0)}</span>
                            <span className="text-right text-muted-foreground">{formatGames(mv.games)}</span>
                          </button>
                        ))}
                      </div>

                      {explorerData.topGames && explorerData.topGames.length > 0 && (
                        <div className="px-4 py-2 border-t border-border/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Trophy className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Games · MasterChess DB</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
                            {explorerData.topGames.map((g, i) => (
                              <Link key={i} to={`/master-game/${g.id}`}
                                className="flex items-center justify-between gap-2 text-[10px] py-0.5 hover:text-primary transition-colors">
                                <span className="text-foreground/80 truncate">
                                  <span className="font-semibold">{g.white.name}</span> ({g.white.rating}) <span className="text-muted-foreground">vs</span> <span className="font-semibold">{g.black.name}</span> ({g.black.rating})
                                </span>
                                <span className="text-muted-foreground shrink-0 inline-flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {g.winner === "white" ? "1-0" : g.winner === "black" ? "0-1" : "½-½"} · {g.year}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Database className="h-6 w-6 mb-2 text-primary/30" />
                      <p className="text-sm">No master games found for this position</p>
                      <p className="text-[10px] mt-1">Stockfish is your guide from here.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── MY GAMES ── */}
              {bottomTab === "my-games" && (
                <motion.div key="my-games-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                  {/* Sub-tabs Online / Bot + Full History link */}
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-[hsl(220,18%,20%)] p-0.5">
                      {([
                        { key: "online", label: "Online", count: myGames.length, icon: Swords },
                        { key: "bot", label: "vs Bots", count: myBotGames.length, icon: Brain },
                      ] as const).map((t) => {
                        const active = myGamesSource === t.key;
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.key}
                            onClick={() => setMyGamesSource(t.key)}
                            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {t.label}
                            <span className={`text-[9px] font-mono px-1 rounded ${active ? "bg-primary-foreground/20" : "bg-muted/40"}`}>{t.count}</span>
                          </button>
                        );
                      })}
                    </div>
                    <Link
                      to="/history"
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <History className="h-3 w-3" /> Full Game History →
                    </Link>
                  </div>

                  {!user ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Swords className="h-6 w-6 mb-2 text-primary/30" />
                      <p className="text-sm">Log in to see your games</p>
                    </div>
                  ) : myGamesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 rounded bg-muted/30 animate-pulse" />
                      ))}
                    </div>
                  ) : myGamesSource === "online" ? (
                    myGames.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Swords className="h-6 w-6 mb-2 text-primary/30" />
                        <p className="text-sm">No finished online games yet</p>
                        <p className="text-[10px] mt-1">Play an online game and it will show up here</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                        {myGames.map((g) => {
                          const isWhite = g.white_player_id === user.id;
                          const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                          const drew = g.result === "1/2-1/2";
                          const date = new Date(g.created_at);
                          const moveCount = g.pgn ? g.pgn.split(/\d+\./).length - 1 : 0;
                          const hasMoves = !!g.pgn && g.pgn.trim().length > 0;
                          return (
                            <button
                              key={g.id}
                              onClick={() => loadAndAnalyzeMyGame(g.pgn)}
                              disabled={!hasMoves || analyzing}
                              className="w-full flex items-center justify-between rounded-lg border border-border/30 bg-[hsl(220,18%,20%)] hover:border-primary/40 hover:bg-[hsl(220,18%,24%)] transition-all px-3 py-2 group disabled:opacity-50 disabled:cursor-not-allowed text-left"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  won ? "bg-green-500/15 text-green-400"
                                    : drew ? "bg-muted text-muted-foreground"
                                    : "bg-red-500/15 text-red-400"
                                }`}>
                                  {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {isWhite ? "White" : "Black"} · {g.time_control_label}
                                    {moveCount > 0 && <span className="text-muted-foreground"> · {moveCount} moves</span>}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                              <Brain className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    myBotGames.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Brain className="h-6 w-6 mb-2 text-primary/30" />
                        <p className="text-sm">No bot games yet</p>
                        <p className="text-[10px] mt-1">Beat a bot and it will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                        {myBotGames.map((b) => {
                          const won = b.outcome === "win";
                          const drew = b.outcome === "draw";
                          const date = new Date(b.created_at);
                          const hasMoves = !!b.pgn && b.pgn.trim().length > 0;
                          return (
                            <button
                              key={b.id}
                              onClick={() => loadAndAnalyzeMyGame(b.pgn)}
                              disabled={!hasMoves || analyzing}
                              className="w-full flex items-center justify-between rounded-lg border border-border/30 bg-[hsl(220,18%,20%)] hover:border-primary/40 hover:bg-[hsl(220,18%,24%)] transition-all px-3 py-2 group disabled:opacity-50 disabled:cursor-not-allowed text-left"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  won ? "bg-green-500/15 text-green-400"
                                    : drew ? "bg-muted text-muted-foreground"
                                    : "bg-red-500/15 text-red-400"
                                }`}>
                                  {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate flex items-center gap-1.5">
                                    🤖 {b.bot_name}
                                    <span className="text-[9px] text-muted-foreground font-mono">({b.bot_rating})</span>
                                    <span className="text-muted-foreground">· {b.player_color === "w" ? "White" : "Black"}</span>
                                  </p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    <span>· {b.time_control_label}</span>
                                    {b.move_count > 0 && <span>· {b.move_count} moves</span>}
                                  </p>
                                </div>
                              </div>
                              <Brain className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                </motion.div>
              )}

              {/* ── IMPORT PGN ── */}
              {bottomTab === "import" && (
                <motion.div key="import-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Textarea
                        placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...\n\nOr paste full PGN with headers"}
                        value={pgnInput} onChange={(e) => setPgnInput(e.target.value)}
                        rows={5} className="font-mono text-xs resize-none bg-[hsl(220,18%,20%)] border-border/30" maxLength={10000}
                      />
                    </div>
                    <div className="w-[200px] flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Depth: {depth}</span>
                        <span>{depth <= 10 ? "Fast" : depth <= 18 ? "Standard" : "Deep"}</span>
                      </div>
                      <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} />
                      {error && <p className="text-xs text-destructive">{error}</p>}
                      <Button onClick={runAnalysis} disabled={analyzing || !pgnInput.trim()} className="w-full bg-[hsl(120,40%,45%)] hover:bg-[hsl(120,40%,50%)] text-white font-semibold text-xs">
                        {analyzing ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Analyzing {progress}%</> : <><Brain className="mr-2 h-3.5 w-3.5" />Analyze Game</>}
                      </Button>
                      {analyzing && <Progress value={progress} className="h-1.5" />}
                      {pgnComplete && (
                        <Button variant="outline" onClick={clearPgnAnalysis} className="w-full text-xs">
                          <Trash2 className="mr-2 h-3 w-3" /> Clear & New
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──
function BottomTabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
        active ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PlayerSide({ info, side, result, alignRight }: { info: PlayerInfo | null; side: "white" | "black"; result: string | null; alignRight?: boolean }) {
  const won = (side === "white" && result === "1-0") || (side === "black" && result === "0-1");
  const drew = result === "1/2-1/2";
  const initials = (info?.display_name || info?.username || "?").slice(0, 2).toUpperCase();
  return (
    <div className={`flex items-center gap-3 min-w-0 flex-1 ${alignRight ? "flex-row-reverse text-right" : ""}`}>
      <div className="relative shrink-0">
        <div className="h-11 w-11 rounded-full overflow-hidden ring-2 ring-border/50 bg-muted flex items-center justify-center">
          {info?.avatar_url ? (
            <img src={info.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        <span className={`absolute -bottom-0.5 ${alignRight ? "-left-0.5" : "-right-0.5"} h-3 w-3 rounded-full border-2 border-[hsl(220,18%,16%)] ${
          side === "white" ? "bg-[hsl(60,10%,90%)]" : "bg-[hsl(220,15%,20%)]"
        }`} />
      </div>
      <div className="min-w-0">
        <div className={`flex items-center gap-1.5 ${alignRight ? "justify-end" : ""}`}>
          {info?.country_flag && <span className="text-sm">{info.country_flag}</span>}
          <span className="text-sm font-semibold text-foreground truncate">
            {info?.display_name || info?.username || (side === "white" ? "White" : "Black")}
          </span>
          {won && <span className="text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded">WIN</span>}
          {drew && <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">DRAW</span>}
          {!won && !drew && result && <span className="text-[9px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">LOSS</span>}
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          {side === "white" ? "♔ White" : "♚ Black"} · {info?.rating ?? "—"}
        </p>
      </div>
    </div>
  );
}
