import { Chess } from "chess.js";
import { ONLINE_BOTS, type OnlineBotProfile } from "./online-bots";
import { getAIMove } from "./chess-ai";
import { getDifficultyForRating } from "./online-bots";

// Simulated bot-vs-bot games for the Spectate tab
export interface BotGame {
  id: string;
  white: OnlineBotProfile;
  black: OnlineBotProfile;
  chess: Chess;
  timeControl: string;
  whiteTime: number;
  blackTime: number;
  startedAt: number;
  lastMoveAt: number;
  moveCount: number;
  finished: boolean;
  result: string | null;
}

let activeGames: BotGame[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

function pickTwoBots(): [OnlineBotProfile, OnlineBotProfile] {
  const shuffled = [...ONLINE_BOTS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

const TIME_CONTROLS = ["3+0", "5+3", "10+5", "15+10"];

function createBotGame(): BotGame {
  const [white, black] = pickTwoBots();
  const tc = TIME_CONTROLS[Math.floor(Math.random() * TIME_CONTROLS.length)];
  const baseTime = parseInt(tc.split("+")[0]) * 60;
  
  // Start with a few moves already played (looks more natural)
  const chess = new Chess();
  const preMoves = 2 + Math.floor(Math.random() * 8); // 2-10 moves already played
  for (let i = 0; i < preMoves; i++) {
    const diff = getDifficultyForRating(chess.turn() === "w" ? white.rating : black.rating);
    const move = getAIMove(chess, diff);
    if (!move || chess.isGameOver()) break;
    chess.move(move);
  }

  // Deduct some time to look realistic
  const elapsed = preMoves * (3 + Math.random() * 8);
  const whiteElapsed = Math.floor(elapsed * (0.4 + Math.random() * 0.2));
  const blackElapsed = Math.floor(elapsed - whiteElapsed);

  return {
    id: `bot-game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    white,
    black,
    chess,
    timeControl: tc,
    whiteTime: Math.max(10, baseTime - whiteElapsed),
    blackTime: Math.max(10, baseTime - blackElapsed),
    startedAt: Date.now() - elapsed * 1000,
    lastMoveAt: Date.now(),
    moveCount: chess.history().length,
    finished: chess.isGameOver(),
    result: null,
  };
}

function advanceGame(game: BotGame) {
  if (game.finished || game.chess.isGameOver()) {
    game.finished = true;
    if (!game.result) {
      if (game.chess.isCheckmate()) {
        game.result = game.chess.turn() === "w" ? "0-1" : "1-0";
      } else {
        game.result = "1/2-1/2";
      }
    }
    return;
  }

  const currentBot = game.chess.turn() === "w" ? game.white : game.black;
  const diff = getDifficultyForRating(currentBot.rating);
  const move = getAIMove(game.chess, diff);
  
  if (!move) {
    game.finished = true;
    game.result = "1/2-1/2";
    return;
  }

  game.chess.move(move);
  game.moveCount++;
  game.lastMoveAt = Date.now();

  // Deduct time
  const thinkTime = 2 + Math.floor(Math.random() * 10);
  const inc = parseInt(game.timeControl.split("+")[1]) || 0;
  if (game.chess.turn() === "b") {
    game.whiteTime = Math.max(0, game.whiteTime - thinkTime + inc);
  } else {
    game.blackTime = Math.max(0, game.blackTime - thinkTime + inc);
  }

  if (game.whiteTime <= 0) { game.finished = true; game.result = "0-1"; }
  if (game.blackTime <= 0) { game.finished = true; game.result = "1-0"; }
  if (game.chess.isGameOver()) {
    game.finished = true;
    if (game.chess.isCheckmate()) {
      game.result = game.chess.turn() === "w" ? "0-1" : "1-0";
    } else {
      game.result = "1/2-1/2";
    }
  }
}

function tick() {
  // Remove finished games older than 20s
  activeGames = activeGames.filter(g => !g.finished || Date.now() - g.lastMoveAt < 20000);

  // Keep 2-4 active games
  const activeCount = activeGames.filter(g => !g.finished).length;
  if (activeCount < 2) {
    activeGames.push(createBotGame());
  }
  if (activeCount < 3 && Math.random() < 0.3) {
    activeGames.push(createBotGame());
  }

  // Advance each active game (simulate a move every few ticks)
  for (const game of activeGames) {
    if (game.finished) continue;
    const sinceLastMove = Date.now() - game.lastMoveAt;
    // Bots "think" 3-12 seconds
    const thinkDuration = 3000 + Math.random() * 9000;
    if (sinceLastMove >= thinkDuration) {
      advanceGame(game);
    }
  }

  notifyListeners();
}

export function startBotGamesEngine() {
  if (intervalId) return;
  // Seed initial games
  if (activeGames.length === 0) {
    activeGames.push(createBotGame());
    activeGames.push(createBotGame());
    if (Math.random() > 0.5) activeGames.push(createBotGame());
  }
  intervalId = setInterval(tick, 2000);
}

export function stopBotGamesEngine() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function subscribeToBotGames(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(fn => fn !== listener);
    if (listeners.length === 0) stopBotGamesEngine();
  };
}

export function getBotGames(): BotGame[] {
  return [...activeGames];
}

export function getBotGameById(id: string): BotGame | undefined {
  return activeGames.find(g => g.id === id);
}
