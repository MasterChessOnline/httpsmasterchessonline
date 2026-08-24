import { Crown, GraduationCap, Trophy, Puzzle, Swords, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

const BASE_ITEMS = [
  { icon: Crown, label: "Home", href: "/" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Trophy, label: "Compete", href: "/tournaments" },
];
const GUEST_LAST = { icon: Puzzle, label: "Puzzles", href: "/puzzles" };
const USER_LAST = { icon: User, label: "Profile", href: "/profile" };



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

  const navItems = [...BASE_ITEMS, user ? USER_LAST : GUEST_LAST];
  const left = navItems.slice(0, 2);
  const right = navItems.slice(2);

  const renderItem = (item: (typeof navItems)[number]) => {

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
        className={`relative flex w-full flex-col items-center justify-center gap-1 py-2 ${focusRing}`}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute top-0 h-[2px] w-8 rounded-full bg-primary"
          />
        )}
        <item.icon
          className={`h-5 w-5 shrink-0 transition-colors ${
            active ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <span
          className={`w-full truncate px-0.5 text-center text-[10px] font-medium leading-none transition-colors ${
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

      <div className="relative w-full overflow-hidden border-t border-border/50 bg-[hsl(220,15%,6%)] backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.55)]">
        <ul
          role="list"
          className="m-0 grid list-none grid-cols-5 items-stretch p-0"
        >
          {left.map((item) => (
            <li key={item.label} className="flex min-w-0">
              {renderItem(item)}
            </li>
          ))}

          {/* Center Play CTA — stays inside the bar */}
          <li className="flex min-w-0 items-center justify-center">
            <Link
              to="/play"
              data-nav-item
              aria-label="Play a new game"
              aria-current={isActive("/play") ? "page" : undefined}
              className={`flex w-full flex-col items-center justify-center gap-1 py-1.5 ${focusRing}`}
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(45,90%,45%)] shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.6)]"
              >
                <Swords className="h-5 w-5 text-[hsl(220,15%,7%)]" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary leading-none">
                Play
              </span>
            </Link>
          </li>

          {right.map((item) => (
            <li key={item.label} className="flex min-w-0">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

};

export default MobileBottomNav;
