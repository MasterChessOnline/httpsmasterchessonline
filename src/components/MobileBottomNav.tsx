import { Swords, Target, GraduationCap, User, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Play", href: "/play", icon: Swords },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Profile", href: "/profile", icon: User, auth: true },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const items = NAV_ITEMS.map((item) => {
    if (item.label === "Profile" && user) {
      return { ...item, href: `/profile/${user.id}` };
    }
    return item;
  }).filter((item) => !item.auth || user);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 glass safe-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(href);

          return (
            <Link
              key={label}
              to={href}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 tap-highlight-none"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -inset-2 rounded-xl bg-primary/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative h-5 w-5 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
