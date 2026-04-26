// Shared helper — every chessboard component pulls its glyphs from here so a
// piece-style change flips the visual set across the whole app instantly.

import { useEffect, useState } from "react";
import { getActivePieceStyle, onPieceStyleChange, type PieceStyle } from "./board-themes";

export interface PieceGlyph {
  symbol: string;
  white: boolean;
  // Whether this glyph carries its own color (e.g. emoji) — boards should
  // skip the white/black tint and just render it raw.
  colorful: boolean;
}

const COLORFUL_STYLES = new Set(["emoji", "animals"]);

function buildGlyph(pieceKey: string, style: PieceStyle): PieceGlyph | null {
  // pieceKey is "wk", "bp" etc. (color + lowercase type)
  if (!pieceKey || pieceKey.length !== 2) return null;
  const color = pieceKey[0]; // w | b
  const type = pieceKey[1].toLowerCase(); // k q r b n p
  // Map to the glyph set: white pieces use uppercase keys, black use lowercase.
  const glyphKey = (color === "w" ? type.toUpperCase() : type) as keyof PieceStyle["glyphs"];
  const symbol = style.glyphs[glyphKey];
  if (!symbol) return null;
  return {
    symbol,
    white: color === "w",
    colorful: COLORFUL_STYLES.has(style.key),
  };
}

/** Get the glyph for a given piece key using the currently-active piece style. */
export function getPieceGlyph(pieceKey: string): PieceGlyph | null {
  return buildGlyph(pieceKey, getActivePieceStyle());
}

/** React hook — re-renders when the user changes their piece style. */
export function usePieceGlyphs() {
  const [, setTick] = useState(0);
  useEffect(() => onPieceStyleChange(() => setTick(t => t + 1)), []);
  const style = getActivePieceStyle();
  return {
    style,
    get: (pieceKey: string) => buildGlyph(pieceKey, style),
  };
}
