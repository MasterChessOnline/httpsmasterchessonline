/**
 * UNIFIED BOARD SIZING — single source of truth for chessboard dimensions
 * used across every chess surface (Play vs Bot, Online, Analysis,
 * Game Review, Puzzles, Opening Explorer, etc.).
 *
 * Goal: a user should NEVER notice a size difference when switching between
 * playing a bot, playing online, or reviewing a game.
 *
 * The class clamps board width to:
 *   - viewport width minus small padding (mobile-first)
 *   - viewport height minus space for clock/header (so the board never gets
 *     hidden under the navbar or below the fold)
 *   - a generous desktop cap that grows with viewport on lg/xl/2xl screens
 */
export const BOARD_CONTAINER_CLASS =
  "w-full mx-auto " +
  "max-w-[min(100vw-1rem,calc(100svh-12rem),660px)] " +
  // Leave ~22rem horizontal room for a side controls panel on laptop screens
  // so the board never pushes the panel off-screen.
  "lg:max-w-[min(calc(100svh-7rem),calc(100vw-23rem),820px)] " +
  "xl:max-w-[min(calc(100svh-6rem),calc(100vw-22rem),960px)] " +
  "2xl:max-w-[min(calc(100svh-6rem),1100px)]";


/** Tighter variant for streamer / focus-mode (no surrounding chrome). */
export const BOARD_CONTAINER_FOCUS_CLASS =
  "w-full mx-auto max-w-[min(94vw,calc(100svh-8rem),720px)] lg:max-w-[min(calc(100svh-4rem),85vw,1500px)]";
