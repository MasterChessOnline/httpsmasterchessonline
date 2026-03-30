import { LogOut, User, Trophy, Users, Swords, GraduationCap, Crown, Brain, Wifi, Settings, MessageCircle, History, BarChart3, BookOpen, Eye, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavSection {
  label: string;
  items: { label: string; href: string; icon: React.ElementType; auth?: boolean }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Play",
    items: [
      { label: "Play", href: "/play", icon: Swords },
      { label: "Online", href: "/play/online", icon: Wifi },
      { label: "Tournaments", href: "/tournaments", icon: Trophy },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Learn", href: "/learn", icon: GraduationCap },
      { label: "Lessons", href: "/lessons", icon: BookOpen },
      { label: "Openings", href: "/openings", icon: Target },
    ],
  },
  {
    label: "Analysis",
    items: [
      { label: "Analysis", href: "/analysis", icon: Brain },
      { label: "Game Review", href: "/history", icon: Eye },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Friends", href: "/friends", icon: Users, auth: true },
      { label: "Chat", href: "/chat", icon: MessageCircle, auth: true },
      { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
    ],
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allItems = NAV_SECTIONS.flatMap(s => s.items);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-border/40 glass shadow-card" : "bg-background/80 backdrop-blur-md"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Top bar */}
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0" aria-label="MasterChess home">
          <motion.div
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Crown className="h-3.5 w-3.5 text-primary" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground hidden sm:inline">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>

        {/* Desktop nav links - all visible, scrollable */}
        <div className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide mx-4 flex-1 justify-center">
          {allItems.filter(item => !item.auth || user).map((item) => {
            const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{ zIndex: -1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">
          {loading ? (
            <div className="h-8 w-16 bg-muted/30 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted/40 hidden md:flex">
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-2.5 py-1 hover:border-primary/30 transition-all duration-300"
              >
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground max-w-[80px] truncate hidden sm:inline">
                  {profile?.display_name || profile?.username || "Player"}
                </span>
                {profile && <span className="font-mono text-[10px] text-primary font-bold">{profile.rating}</span>}
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-7 w-7 hidden md:flex" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs h-8">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow text-xs h-8">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile horizontal scroll nav */}
      <div className="md:hidden border-t border-border/20 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-0.5 px-3 py-1.5 min-w-max">
          {allItems.filter(item => !item.auth || user).map((item) => {
            const isActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
          {user && (
            <>
              <Link to={`/profile/${user.id}`} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${location.pathname.startsWith("/profile") ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <User className="h-3 w-3" /> Profile
              </Link>
              <Link to="/stats" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${location.pathname === "/stats" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <BarChart3 className="h-3 w-3" /> Stats
              </Link>
              <Link to="/settings" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${location.pathname === "/settings" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <Settings className="h-3 w-3" /> Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
