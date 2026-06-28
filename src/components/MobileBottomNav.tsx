import { Crown, GraduationCap, Trophy, User, Swords } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import CoinBalancePill from "@/components/CoinBalancePill";

const NAV_ITEMS = [
  { icon: Crown, label: "Home", href: "/" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Trophy, label: "Compete", href: "/tournaments" },
  { icon: User, label: "Profile", href: "/profile" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(220,15%,7%)] rounded-xl";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navRef = useRef<HTMLElement | null>(null);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  // Roving keyboard support: ← → to move between nav items, Home/End to jump
  useEffect(() => {
    const root = navRef.current;
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !root.contains(target)) return;
      const items = Array.from(
        root.querySelectorAll<HTMLAnchorElement>("a[data-nav-item]")
      );
      const idx = items.indexOf(target.closest("a[data-nav-item]") as HTMLAnchorElement);
      if (idx < 0) return;
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % items.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;
      e.preventDefault();
      items[next]?.focus();
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, []);

  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  const renderItem = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(item.href);
    const href =
      item.href === "/profile" && user ? `/profile/${user.id}` : item.href;
    return (
      <Link
        key={item.label}
        to={href}
        data-nav-item
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={`relative flex flex-col items-center justify-center gap-1 h-full min-h-11 ${focusRing}`}
      >
        {active && (
          <>
            <motion.span
              layoutId="mobile-nav-indicator"
              className="absolute top-0 h-[2px] w-10 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.85)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              aria-hidden="true"
            />
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-3 inset-y-1 rounded-xl pointer-events-none"
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(closest-side, hsl(var(--primary) / 0.22), transparent 70%)",
              }}
            />
          </>
        )}
        <motion.span
          aria-hidden="true"
          animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.8, repeat: active ? Infinity : 0, ease: "easeInOut" }}
          className="inline-flex"
        >
          <item.icon
            className={`h-5 w-5 transition-colors ${
              active ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.75)]" : "text-muted-foreground"
            }`}
          />
        </motion.span>
        <span
          className={`text-[10px] font-medium leading-none transition-colors ${
            active ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      ref={navRef}
      data-mobile-bottom-nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      aria-label="Primary mobile navigation"
    >
      {/* Soft top fade so content doesn't collide with the bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[hsl(220,15%,5%)] to-transparent"
      />

      {/* Floating coin balance pill — always visible to logged-in users */}
      {user && (
        <div className="pointer-events-auto absolute -top-9 right-4 z-10">
          <CoinBalancePill />
        </div>
      )}

      <div className="relative mx-3 mb-4 rounded-2xl border border-border/40 bg-[hsl(220,15%,7%)]/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--primary)/0.08)]">
        <ul
          role="list"
          className="grid grid-cols-5 items-end h-16 px-1 m-0 p-0 list-none"
        >
          {left.map((item) => (
            <li key={item.label} className="contents">
              {renderItem(item)}
            </li>
          ))}

          {/* Center Play CTA — elevated */}
          <li className="relative flex items-start justify-center">
            <Link
              to="/play"
              data-nav-item
              aria-label="Play a new game"
              aria-current={isActive("/play") ? "page" : undefined}
              className={`group absolute -top-14 flex flex-col items-center min-h-11 min-w-11 ${focusRing}`}
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                aria-hidden="true"
                className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-[hsl(45,90%,45%)] flex items-center justify-center shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.6),0_0_0_4px_hsl(220,15%,7%)]"
              >
                <span className="absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-70 group-active:opacity-100 transition-opacity" />
                <Swords
                  className="relative h-6 w-6 text-[hsl(220,15%,7%)]"
                  strokeWidth={2.5}
                />
              </motion.div>
              <span
                aria-hidden="true"
                className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary"
              >
                Play
              </span>
            </Link>
          </li>

          {right.map((item) => (
            <li key={item.label} className="contents">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
