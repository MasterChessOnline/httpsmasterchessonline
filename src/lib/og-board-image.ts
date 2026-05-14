// Generate a unique board-position image URL per opening for OG/Twitter previews
// and Google Image Search. Uses public Chess.com dynboard (returns PNG, no auth).
//
// Why this matters for SEO:
// - Each /openings/:slug page gets a unique og:image showing its actual position
// - Google Images indexes these as separate images (60+ unique board screenshots)
// - Social shares (X, WhatsApp, FB, LinkedIn) show the real board, not generic logo
import { Chess } from "chess.js";

const FALLBACK = "https://masterchess.live/og-image.jpg";
const DYN = "https://www.chess.com/dynboard";

/**
 * Compute FEN from a "1.e4 e5 2.Nf3 Nc6" style move string.
 * Returns null if parsing fails.
 */
export function fenFromStartingMoves(startingMoves: string | undefined): string | null {
  if (!startingMoves) return null;
  try {
    const chess = new Chess();
    // Strip move numbers and dots: "1.e4 e5 2.Nf3" -> "e4 e5 Nf3"
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
 * Returns a 1200×1200 PNG board image for the given starting moves.
 * Falls back to the brand OG image when the FEN can't be computed.
 */
export function getOpeningBoardImage(startingMoves: string | undefined): string {
  const fen = fenFromStartingMoves(startingMoves);
  if (!fen) return FALLBACK;
  const params = new URLSearchParams({
    fen,
    board: "green",
    piece: "neo",
    size: "3",
    coordinates: "outside",
  });
  return `${DYN}?${params.toString()}`;
}
