import { Crown, GraduationCap, Trophy, User, Swords } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: Crown, label: "Home", href: "/" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Trophy, label: "Compete", href: "/tournaments" },
  { icon: User, label: "Profile", href: "/profile" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  // Split items: 2 left, center FAB, 2 right
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Soft top fade so content doesn't collide with the bar */}
      <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[hsl(220,15%,5%)] to-transparent" />

      <div className="relative mx-3 mb-2 rounded-2xl border border-border/40 bg-[hsl(220,15%,7%)]/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--primary)/0.08)]">
        <div className="grid grid-cols-5 items-end h-16 px-1">
          {left.map((item) => {
            const active = isActive(item.href);
            const href = item.href;
            return (
              <Link
                key={item.label}
                to={href}
                className="relative flex flex-col items-center justify-center gap-1 h-full"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 h-[2px] w-8 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center Play CTA — elevated */}
          <div className="relative flex items-start justify-center">
            <Link
              to="/play"
              aria-label="Play"
              className="group absolute -top-6 flex flex-col items-center"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-[hsl(45,90%,45%)] flex items-center justify-center shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.6),0_0_0_4px_hsl(220,15%,7%)]"
              >
                <span className="absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-70 group-active:opacity-100 transition-opacity" />
                <Swords className="relative h-6 w-6 text-[hsl(220,15%,7%)]" strokeWidth={2.5} />
              </motion.div>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Play
              </span>
            </Link>
          </div>

          {right.map((item) => {
            const active = isActive(item.href);
            const href = item.href === "/profile" && user ? `/profile/${user.id}` : item.href;
            return (
              <Link
                key={item.label}
                to={href}
                className="relative flex flex-col items-center justify-center gap-1 h-full"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 h-[2px] w-8 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
