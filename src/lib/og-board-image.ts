// Generate board-position image URL for OG/Twitter previews.
// We no longer call any third-party board service — fall back to the
// branded OG image. (MasterChess is fully independent.)
import { Chess } from "chess.js";

const FALLBACK = "https://masterchess.live/og-image.jpg";

export function fenFromStartingMoves(startingMoves: string | undefined): string | null {
  if (!startingMoves) return null;
  try {
    const chess = new Chess();
    const tokens = startingMoves
      .replace(/\d+\.+/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    for (const san of tokens) {
      try {
        chess.move(san);
      } catch {
        // skip unparseable token
      }
    }
    return chess.fen();
  } catch {
    return null;
  }
}

/**
 * Returns the brand OG image for SEO previews.
 * (External chess board image services were removed to keep MasterChess
 * fully independent from other chess platforms.)
 */
export function getOpeningBoardImage(_startingMoves: string | undefined): string {
  return FALLBACK;
}
