import { useEffect } from "react";

/**
 * Marks the document as being inside an active game.
 * Site chrome (Navbar, MobileBottomNav, Footer) is hidden via CSS in
 * src/index.css using `body[data-game-active="true"]`.
 *
 * On mobile this gives the chessboard the full screen as requested.
 */
export function useGameMode(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    document.body.setAttribute("data-game-active", "true");
    return () => {
      document.body.removeAttribute("data-game-active");
    };
  }, [active]);
}
