import { LogOut, User, Trophy, Swords, GraduationCap, Crown, Brain, Wifi, Settings, BarChart3, Target, Zap, Clock, Eye, BookOpen, Play, Award, Flame, Star, ChevronDown, Menu, X, Bell, Search, Users, Gamepad2, Radio, Video, Shield, Crosshair, FileText, History, Sparkles, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ElementType;
  desc: string;
  auth?: boolean;
  comingSoon?: boolean;
  separator?: boolean;
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
      { label: "Quick Match", href: "/play/online", icon: Zap, desc: "Find opponent instantly" },
      { label: "Play vs Bot", href: "/play", icon: Brain, desc: "Multiple AI difficulty levels" },
      { label: "Custom Game", href: "/play", icon: Settings, desc: "Time, color & variants" },
      { label: "Ongoing Games", href: "/play/online", icon: Gamepad2, desc: "Resume your matches" },
      { label: "Rematch Last", href: "/play", icon: Swords, desc: "Challenge your last opponent" },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    icon: GraduationCap,
    items: [
      { label: "Training", href: "/learn", icon: Target, desc: "Structured learning path" },
      { label: "Basic Moves", href: "/learn", icon: BookOpen, desc: "Fundamentals & rules" },
      { label: "Openings", href: "/openings", icon: BookOpen, desc: "Master opening systems" },
      { label: "Endgames", href: "/learn", icon: Crown, desc: "Technique & calculation" },
      { label: "Game Analysis", href: "/analysis", icon: BarChart3, desc: "Deep position analysis", separator: true },
      { label: "Analyze Last Game", href: "/analysis", icon: Eye, desc: "Review your recent game" },
      { label: "Import Game (PGN)", href: "/analysis", icon: FileText, desc: "Analyze any game" },
      { label: "Attack Strategy", href: "/learn", icon: Zap, desc: "Aggressive play patterns", separator: true },
      { label: "Defense Strategy", href: "/learn", icon: Shield, desc: "Solid defensive systems" },
      { label: "Positioning", href: "/learn", icon: Crosshair, desc: "Piece placement mastery" },
      { label: "Video Lessons", href: "/video-lessons", icon: Video, desc: "Lessons launching soon", comingSoon: true, separator: true },
    ],
  },
  {
    key: "tournaments",
    label: "Tournaments",
    icon: Trophy,
    items: [
      { label: "Join Tournament", href: "/tournaments", icon: Trophy, desc: "Browse open tournaments" },
      { label: "Create Tournament", href: "/tournaments", icon: Star, desc: "Host your own event" },
      { label: "My Tournaments", href: "/tournaments", icon: Award, desc: "Your registrations" },
    ],
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    icon: BarChart3,
    items: [
      { label: "Global Ranking", href: "/leaderboard", icon: Crown, desc: "Worldwide standings" },
      { label: "Top 10", href: "/leaderboard", icon: Star, desc: "Elite players" },
      { label: "Top 100", href: "/leaderboard", icon: Award, desc: "Top contenders" },
      { label: "Bullet / Blitz / Rapid", href: "/leaderboard", icon: Clock, desc: "Rankings by time control" },
    ],
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    items: [
      { label: "My Profile", href: "/profile", icon: User, desc: "Your stats & info", auth: true },
      { label: "Match History", href: "/history", icon: History, desc: "All your past games" },
      { label: "Settings", href: "/settings", icon: Settings, desc: "Theme, board, audio" },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "You won against GrandMaster42!", time: "2m ago", read: false },
  { id: 2, text: "Daily tournament starts in 30 min", time: "15m ago", read: false },
  { id: 3, text: "New opening course available", time: "1h ago", read: true },
];

const LiveStatusBar = () => {
  const [onlinePlayers, setOnlinePlayers] = useState(2847);
  const [liveGames, setLiveGames] = useState(312);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers(prev => prev + Math.floor(Math.random() * 11) - 5);
      setLiveGames(prev => Math.max(100, prev + Math.floor(Math.random() * 7) - 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-6 text-[10px] tracking-wide text-muted-foreground py-1">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <Users className="h-2.5 w-2.5" />
        <span className="font-mono font-medium text-foreground/70">{onlinePlayers.toLocaleString()}</span>
        <span className="hidden sm:inline">online</span>
      </div>
      <div className="w-px h-2.5 bg-border/40" />
      <div className="flex items-center gap-1.5">
        <Gamepad2 className="h-2.5 w-2.5" />
        <span className="font-mono font-medium text-foreground/70">{liveGames}</span>
        <span className="hidden sm:inline">live games</span>
      </div>
      <div className="w-px h-2.5 bg-border/40 hidden sm:block" />
      <div className="hidden sm:flex items-center gap-1.5">
        <Radio className="h-2.5 w-2.5 text-primary/60" />
        <span>Server: <span className="text-emerald-400 font-medium">Operational</span></span>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [shrunk, setShrunk] = useState(false);
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
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setShrunk(y > 60);
    };
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
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "shadow-[0_4px_30px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.3)]"
            : ""
        }`}
      >
        {/* Main nav bar */}
        <motion.nav
          className={`relative border-b transition-all duration-500 overflow-hidden ${
            scrolled
              ? "bg-background/80 backdrop-blur-2xl border-primary/8"
              : "bg-background/40 backdrop-blur-xl border-transparent"
          }`}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Light sweep on the entire header */}
          <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent translate-x-[-100%] animate-[sweepHeader_4s_ease-in-out_infinite]" />
          </div>

          <div
            className={`container mx-auto flex items-center justify-between px-4 transition-all duration-500 ${
              shrunk ? "h-12" : "h-16"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="MasterChess home">
              <motion.div
                className={`rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300 ${
                  shrunk ? "w-7 h-7" : "w-9 h-9"
                }`}
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Crown className={`text-primary transition-all duration-300 ${shrunk ? "h-3.5 w-3.5" : "h-4.5 w-4.5"}`} />
              </motion.div>
              <span className={`font-display font-bold tracking-wider text-foreground hidden sm:inline uppercase transition-all duration-300 ${
                shrunk ? "text-sm" : "text-base"
              }`}>
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
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden ${
                        isActive || activeDropdown === section.key
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      {/* Light sweep on hover */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent pointer-events-none" />

                      <section.icon className="h-4 w-4 relative z-[1]" />
                      <span className="relative z-[1]">{section.label}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 relative z-[1] ${activeDropdown === section.key ? "rotate-180" : ""}`} />

                      {/* Active indicator underline */}
                      <motion.span
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
                        initial={false}
                        animate={{
                          scaleX: isActive ? 1 : activeDropdown === section.key ? 0.6 : 0,
                          opacity: isActive || activeDropdown === section.key ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ originX: 0.5 }}
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === section.key && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full left-0 mt-2 w-72 rounded-xl overflow-hidden z-50 border border-primary/10 bg-card/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.05),0_0_60px_-15px_rgba(212,175,55,0.1)]"
                          onMouseEnter={() => handleMouseEnter(section.key)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {/* Dropdown gold edge */}
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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
                                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/item overflow-hidden ${
                                        itemActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-foreground"
                                      }`}
                                    >
                                      {/* Item light sweep */}
                                      <span className="absolute inset-0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-primary/[0.05] to-transparent pointer-events-none" />
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 relative z-[1] ${
                                        itemActive ? "bg-primary/20 shadow-[0_0_12px_rgba(212,175,55,0.2)]" : "bg-muted/30 group-hover/item:bg-primary/10"
                                      }`}>
                                        <item.icon className={`h-4 w-4 transition-colors duration-200 ${itemActive ? "text-primary" : "text-muted-foreground group-hover/item:text-primary"}`} />
                                      </div>
                                      <div className="relative z-[1]">
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
                        className="h-8 w-full bg-muted/30 border border-border/50 rounded-lg px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:shadow-[0_0_12px_rgba(212,175,55,0.1)] transition-all duration-300"
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
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
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
                  className={`relative bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-4 shadow-glow overflow-hidden group transition-all duration-300 ${
                    shrunk ? "h-7" : "h-8"
                  }`}
                >
                  <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                  Play Now
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
                    className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-3 py-1.5 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.08)] transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
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

        {/* Live status bar */}
        <div
          className={`border-b transition-all duration-500 ${
            scrolled
              ? "bg-background/60 backdrop-blur-xl border-border/10"
              : "bg-background/30 backdrop-blur-lg border-transparent"
          } ${shrunk ? "h-0 overflow-hidden opacity-0" : "opacity-100"}`}
        >
          <div className="container mx-auto px-4">
            <LiveStatusBar />
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under the fixed header */}
      <div className={`transition-all duration-500 ${shrunk ? "h-12" : "h-[calc(4rem+1.5rem)]"}`} />

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
