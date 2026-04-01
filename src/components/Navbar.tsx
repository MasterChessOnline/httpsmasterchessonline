import { LogOut, User, Trophy, Swords, GraduationCap, Crown, Brain, Wifi, Settings, BarChart3, Target, Zap, Timer, Clock, Shield, Eye, BookOpen, Users, Play, Award, Flame, Star, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ElementType;
  desc: string;
  auth?: boolean;
}

interface NavSection {
  key: string;
  label: string;
  icon: React.ElementType;
  items: DropdownItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    key: "play",
    label: "Play",
    icon: Swords,
    items: [
      { label: "Play Online", href: "/play/online", icon: Wifi, desc: "Ranked & casual matches" },
      { label: "Play vs AI", href: "/play", icon: Brain, desc: "Multiple bot levels" },
      { label: "Game History", href: "/history", icon: Clock, desc: "Review past games" },
      { label: "Analysis Board", href: "/analysis", icon: Eye, desc: "Move review & mistakes" },
    ],
  },
  {
    key: "tournaments",
    label: "Tournaments",
    icon: Trophy,
    items: [
      { label: "All Tournaments", href: "/tournaments", icon: Trophy, desc: "Blitz, Rapid, Daily" },
      { label: "Leaderboard", href: "/leaderboard", icon: BarChart3, desc: "Global rankings" },
      { label: "Achievements", href: "/achievements", icon: Award, desc: "Unlock badges" },
    ],
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    icon: BarChart3,
    items: [
      { label: "Global Rankings", href: "/leaderboard", icon: BarChart3, desc: "Top players worldwide" },
      { label: "Friends", href: "/friends", icon: Users, desc: "Challenge friends" },
    ],
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-card" : "bg-background/60 backdrop-blur-xl"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to={user ? "/" : "/"} className="flex items-center gap-2.5 group shrink-0" aria-label="MasterChess 4D home">
            <motion.div
              className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Crown className="h-4.5 w-4.5 text-primary" />
            </motion.div>
            <span className="font-display text-base font-bold tracking-wider text-foreground hidden sm:inline uppercase">
              Master<span className="text-gradient-neon">Chess</span>
              <span className="text-[10px] text-primary/60 ml-1 font-normal tracking-normal">4D</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 mx-6">
            {NAV_SECTIONS.map((section) => {
              const isActive = section.items.some(item =>
                item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
              );
              return (
                <div
                  key={section.key}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(section.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive || activeDropdown === section.key
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === section.key ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === section.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-72 glass-neon rounded-xl overflow-hidden shadow-2xl z-50"
                        onMouseEnter={() => handleMouseEnter(section.key)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="p-2">
                          {section.items
                            .filter(item => !item.auth || user)
                            .map((item) => {
                              const itemActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
                              return (
                                <Link
                                  key={item.label}
                                  to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                                    itemActive ? "bg-primary/10 text-primary" : "hover:bg-muted/40 text-foreground"
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    itemActive ? "bg-primary/20" : "bg-muted/30 group-hover:bg-primary/10"
                                  }`}>
                                    <item.icon className={`h-4 w-4 ${itemActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{item.label}</p>
                                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                  </div>
                                </Link>
                              );
                            })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-3 py-1.5 hover:border-primary/30 transition-all"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground max-w-[80px] truncate hidden sm:inline">
                    {profile?.display_name || profile?.username || "Player"}
                  </span>
                  {profile && <span className="font-mono text-[11px] text-primary font-bold">{profile.rating}</span>}
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-8 w-8 hidden md:flex" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs h-9">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow text-xs h-9 btn-neon">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/30 text-foreground transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl overflow-y-auto pt-20 pb-8 px-4"
          >
            <div className="space-y-6 max-w-md mx-auto">
              {NAV_SECTIONS.map((section) => (
                <div key={section.key}>
                  <h3 className="font-display text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <section.icon className="h-3.5 w-3.5" />
                    {section.label}
                  </h3>
                  <div className="space-y-1">
                    {section.items
                      .filter(item => !item.auth || user)
                      .map((item) => (
                        <Link
                          key={item.label}
                          to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/30 transition-all"
                        >
                          <item.icon className="h-5 w-5 text-primary/70" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}

              {/* Auth section */}
              {user ? (
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-all w-full text-left">
                  <LogOut className="h-5 w-5 text-destructive/70" />
                  <span className="text-sm font-medium text-destructive">Sign Out</span>
                </button>
              ) : (
                <div className="space-y-2 pt-4 border-t border-border/30">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full btn-neon">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
