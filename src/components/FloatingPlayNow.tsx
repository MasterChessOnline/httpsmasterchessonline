// Persistent conversion CTA. Hidden on pages where a game/board is already
// on screen so it never covers the board.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HIDDEN_PREFIXES = [
  "/play",
  "/game",
  "/online",
  "/analysis",
  "/study",
  "/puzzle",
  "/openings",
  "/learn/lesson",
  "/story",
  "/training",
  "/beat",
  "/tv",
  "/live",
  "/admin",
];

export default function FloatingPlayNow() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (hidden || !visible) return null;

  const to = user ? "/play" : "/play-guest";

  return (
    <Link
      to={to}
      aria-label="Play chess now"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 sm:bottom-6 z-40 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 animate-in fade-in slide-in-from-bottom-2"
    >
      <Swords className="h-4 w-4" />
      {user ? "Play Now" : "Play free — no signup"}
    </Link>
  );
}
