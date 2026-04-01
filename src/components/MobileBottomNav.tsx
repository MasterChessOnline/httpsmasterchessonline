import { Crown, Swords, GraduationCap, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: Crown, label: "Home", href: "/" },
  { icon: Swords, label: "Play", href: "/play" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Trophy, label: "Compete", href: "/tournaments" },
  { icon: User, label: "Profile", href: "/profile" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 safe-bottom" role="navigation" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const href = item.href === "/profile" && user ? `/profile/${user.id}` : item.href;
          const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all flex-1"
            >
              <div className="relative">
                {isActive && (
                  <motion.div layoutId="mobile-nav-indicator" className="absolute -inset-2 rounded-xl bg-primary/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <item.icon className={`relative h-5 w-5 transition-colors duration-200 ${isActive ? "text-primary drop-shadow-[0_0_6px_hsl(210_100%_60%/0.5)]" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
