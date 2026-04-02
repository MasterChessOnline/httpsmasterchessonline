import { LogOut, User, Trophy, Swords, GraduationCap, Crown, Brain, Wifi, Settings, BarChart3, Target, Zap, Clock, Eye, BookOpen, Play, Award, Flame, Star, ChevronDown, Menu, X, Bell, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    key: "home",
    label: "Home",
    icon: Crown,
    items: [
      { label: "Dashboard", href: "/", icon: Crown, desc: "Your chess hub" },
      { label: "Quick Match", href: "/play/online", icon: Zap, desc: "Find opponent instantly" },
      { label: "Featured Games", href: "/leaderboard", icon: Star, desc: "Top games today" },
      { label: "Recent Games", href: "/history", icon: Clock, desc: "Your game history" },
    ],
  },
  {
    key: "play",
    label: "Play",
    icon: Swords,
    items: [
      { label: "Play Online", href: "/play/online", icon: Wifi, desc: "Ranked & casual matches" },
      { label: "Play vs Computer", href: "/play", icon: Brain, desc: "Multiple bot levels" },
      { label: "Custom Game", href: "/play", icon: Settings, desc: "Time, color, variants" },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    icon: GraduationCap,
    items: [
      { label: "Openings", href: "/learn", icon: BookOpen, desc: "Master opening systems" },
      { label: "Strategy", href: "/learn", icon: Brain, desc: "Positional mastery" },
      { label: "Middlegames", href: "/learn", icon: Swords, desc: "Plans & combinations" },
      { label: "Endgames", href: "/learn", icon: Target, desc: "Technique & calculation" },
    ],
  },
  {
    key: "compete",
    label: "Compete",
    icon: Trophy,
    items: [
      { label: "Tournaments", href: "/tournaments", icon: Trophy, desc: "Blitz, Rapid, Daily" },
      { label: "Leaderboard", href: "/leaderboard", icon: BarChart3, desc: "Global & friends" },
      { label: "Events", href: "/tournaments", icon: Flame, desc: "Live competitions" },
    ],
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    items: [
      { label: "My Profile", href: "/profile", icon: User, desc: "Your stats & info", auth: true },
      { label: "Statistics", href: "/stats", icon: BarChart3, desc: "Rating, win rate, accuracy" },
      { label: "Achievements", href: "/achievements", icon: Award, desc: "Badges & rewards" },
      { label: "Settings", href: "/settings", icon: Settings, desc: "Theme, board, audio" },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "You won against GrandMaster42!", time: "2m ago", read: false },
  { id: 2, text: "Daily tournament starts in 30 min", time: "15m ago", read: false },
  { id: 3, text: "New opening course available", time: "1h ago", read: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "glass shadow-card border-primary/10 h-14"
            : "bg-background/60 backdrop-blur-xl border-transparent h-16"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto flex items-center justify-between px-4 h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="MasterChess home">
            <motion.div
              className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:shadow-glow transition-all"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Crown className="h-4.5 w-4.5 text-primary" />
            </motion.div>
            <span className="font-display text-base font-bold tracking-wider text-foreground hidden sm:inline uppercase">
              Master<span className="text-gradient-gold">Chess</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 mx-6">
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
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                      isActive || activeDropdown === section.key
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === section.key ? "rotate-180" : ""}`} />
                    {/* Hover underline */}
                    <span className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary transition-transform duration-300 origin-left ${
                      isActive || activeDropdown === section.key ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === section.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-0 mt-2 w-72 rounded-xl overflow-hidden z-50 border border-primary/10 bg-card/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.05)]"
                        onMouseEnter={() => handleMouseEnter(section.key)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="p-1.5">
                          {section.items
                            .filter(item => !item.auth || user)
                            .map((item, idx) => {
                              const itemActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
                              return (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                                >
                                  <Link
                                    to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/item ${
                                      itemActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-foreground"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                                      itemActive ? "bg-primary/20 shadow-[0_0_12px_rgba(212,175,55,0.2)]" : "bg-muted/30 group-hover/item:bg-primary/10"
                                    }`}>
                                      <item.icon className={`h-4 w-4 transition-colors duration-200 ${itemActive ? "text-primary" : "text-muted-foreground group-hover/item:text-primary"}`} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{item.label}</p>
                                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                    </div>
                                  </Link>
                                </motion.div>
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
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); }}
                      placeholder="Search..."
                      className="h-8 w-full bg-muted/30 border border-border/50 rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative hidden md:block">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full right-0 mt-2 w-80 rounded-xl overflow-hidden z-50 border border-primary/10 bg-card/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                  >
                    <div className="p-3 border-b border-border/30">
                      <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                    </div>
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                      {MOCK_NOTIFICATIONS.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-primary/5 ${
                            !notif.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!notif.read ? "bg-primary" : "bg-muted"}`} />
                          <div className="min-w-0">
                            <p className="text-xs text-foreground">{notif.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Play Now button */}
            <Link to="/play" className="hidden md:block">
              <Button
                size="sm"
                className="relative bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-8 px-4 shadow-glow overflow-hidden group"
              >
                <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                Play Now
                {/* Shine sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </Link>

            {/* User area */}
            {loading ? (
              <div className="h-8 w-20 bg-muted/30 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-3 py-1.5 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="relative">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs h-8">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow text-xs h-8 btn-neon">Sign Up</Button>
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
              {/* Mobile Play Now */}
              <Link to="/play" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground font-semibold shadow-glow btn-neon h-11">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Play Now
                </Button>
              </Link>

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
