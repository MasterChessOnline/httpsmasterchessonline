// Shared helper — every chessboard component pulls its piece artwork from
// here so a piece-style change flips the visual set across the whole app.

import { useEffect, useState } from "react";
import { getActivePieceStyle, onPieceStyleChange, type PieceStyle } from "./board-themes";

export interface PieceArtwork {
  // Unicode symbol (always set — used as fallback even for SVG sets if asset fails)
  symbol: string;
  // True if this is the white piece
  white: boolean;
  // SVG asset URL when the active style ships real artwork; null for unicode mode.
  svgUrl: string | null;
  // True when the SVG is pixel art (needs image-rendering: pixelated)
  pixelated: boolean;
}

function pieceFileName(pieceKey: string): string {
  // pieceKey is "wk", "bp" etc. → "wK", "bP"
  const color = pieceKey[0];
  const type = pieceKey[1].toUpperCase();
  return `${color}${type}.svg`;
}

function buildArtwork(pieceKey: string, style: PieceStyle): PieceArtwork | null {
  if (!pieceKey || pieceKey.length !== 2) return null;
  const color = pieceKey[0];
  const type = pieceKey[1].toLowerCase();
  const glyphKey = (color === "w" ? type.toUpperCase() : type) as keyof PieceStyle["glyphs"];
  const symbol = style.glyphs[glyphKey];
  if (!symbol) return null;
  const svgUrl =
    style.mode === "svg" && style.svgFolder
      ? `/pieces/${style.svgFolder}/${pieceFileName(pieceKey)}`
      : null;
  return {
    symbol,
    white: color === "w",
    svgUrl,
    pixelated: !!style.render.pixelated,
  };
}

/** Get the artwork for a given piece key using the currently-active piece style. */
export function getPieceArtwork(pieceKey: string): PieceArtwork | null {
  return buildArtwork(pieceKey, getActivePieceStyle());
}

/** React hook — re-renders when the user changes their piece style. */
export function usePieceGlyphs() {
  const [, setTick] = useState(0);
  useEffect(() => onPieceStyleChange(() => setTick(t => t + 1)), []);
  const style = getActivePieceStyle();
  return {
    style,
    get: (pieceKey: string) => buildArtwork(pieceKey, style),
  };
}
