import { LogOut, User, Trophy, Swords, GraduationCap, Crown, Brain, Settings, BarChart3, Target, Zap, Clock, Eye, BookOpen, Play, Award, Star, ChevronDown, Menu, X, Bell, Search, Users, Gamepad2, Sparkles, Shield, Crosshair, FileText, History, Lock, Palette, Plus, ListChecks, Medal, Radio } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ElementType;
  desc: string;
  auth?: boolean;
  comingSoon?: boolean;
  separator?: boolean;
  highlight?: boolean;
  subheading?: string;
}

interface NavSection {
  key: string;
  label: string;
  icon: React.ElementType;
  items: DropdownItem[];
  wide?: boolean;
  accent: string;
  accentRgb: string;
}

const NAV_SECTIONS: NavSection[] = [
  {
    key: "play",
    label: "Play",
    icon: Swords,
    wide: true,
    accent: "217 91% 65%",
    accentRgb: "77,163,255",
    items: [
      { label: "Quick Match", href: "/play/online", icon: Zap, desc: "Find opponent instantly", highlight: true },
      { label: "Play vs Bot", href: "/play", icon: Brain, desc: "Multiple AI difficulty levels" },
      { label: "Custom Game", href: "/play", icon: Settings, desc: "Set your own rules" },
      { label: "Bullet (1–2 min)", href: "/play/online", icon: Zap, desc: "Lightning fast games", separator: true, subheading: "Time Controls" },
      { label: "Blitz (3–5 min)", href: "/play/online", icon: Clock, desc: "Quick tactical battles" },
      { label: "Rapid (10+ min)", href: "/play/online", icon: Clock, desc: "Deep strategic play" },
      { label: "Ongoing Games", href: "/play/online", icon: Gamepad2, desc: "Resume your matches", separator: true },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    icon: GraduationCap,
    wide: true,
    accent: "271 91% 65%",
    accentRgb: "168,85,247",
    items: [
      { label: "Daily Training Plan", href: "/daily-plan", icon: Sparkles, desc: "Your personalized daily tasks", highlight: true, subheading: "Improve" },
      { label: "AI Coach", href: "/coach", icon: Brain, desc: "Ask the AI chess coach anything" },
      { label: "Opening Repertoire", href: "/repertoire", icon: BookOpen, desc: "Build your personal repertoire" },
      { label: "Training", href: "/learn", icon: Target, desc: "Structured learning path", separator: true, subheading: "Fundamentals" },
      { label: "Openings", href: "/openings", icon: BookOpen, desc: "Master opening systems" },
      { label: "Endgames", href: "/learn", icon: Crown, desc: "Technique & calculation" },
      { label: "Import PGN", href: "/analysis", icon: FileText, desc: "Analyze any game", separator: true, subheading: "Analysis" },
      { label: "Coming Soon", href: "/coming-soon", icon: Sparkles, desc: "New features on the way", comingSoon: true, separator: true },
    ],
  },
  {
    key: "tournaments",
    label: "Compete",
    icon: Trophy,
    accent: "38 92% 50%",
    accentRgb: "245,158,11",
    items: [
      { label: "Join Tournament", href: "/tournaments", icon: Trophy, desc: "Browse open tournaments", subheading: "Active" },
      { label: "Starting Soon", href: "/tournaments", icon: Clock, desc: "Upcoming events" },
      { label: "Create Tournament", href: "/tournaments", icon: Plus, desc: "Host your own event", separator: true, subheading: "Organize" },
      { label: "My Tournaments", href: "/tournaments", icon: ListChecks, desc: "Your active tournaments", separator: true },
    ],
  },
  {
    key: "leaderboard",
    label: "Ranks",
    icon: BarChart3,
    accent: "142 71% 45%",
    accentRgb: "34,197,94",
    items: [
      { label: "Top Players", href: "/leaderboard", icon: Crown, desc: "Global ranking", subheading: "Rankings" },
      { label: "Bullet", href: "/leaderboard", icon: Zap, desc: "1–2 min rankings", separator: true, subheading: "By Format" },
      { label: "Blitz", href: "/leaderboard", icon: Clock, desc: "3–5 min rankings" },
      { label: "Rapid", href: "/leaderboard", icon: Clock, desc: "10+ min rankings" },
    ],
  },
  {
    key: "live",
    label: "Live",
    icon: Radio,
    accent: "0 84% 60%",
    accentRgb: "239,68,68",
    items: [
      { label: "Stream Hub", href: "/live", icon: Radio, desc: "Watch DailyChess_12 live", highlight: true },
      { label: "Spectate Games", href: "/spectate", icon: Eye, desc: "Watch player matches" },
      { label: "Community", href: "/community", icon: Users, desc: "Posts & chess moments", separator: true },
    ],
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    accent: "350 89% 60%",
    accentRgb: "244,63,94",
    items: [
      { label: "My Profile", href: "/profile", icon: User, desc: "Rating & stats", auth: true },
      { label: "Chess Card", href: "/chess-card", icon: Sparkles, desc: "Your skill profile & compare", auth: true, highlight: true },
      { label: "Match History", href: "/history", icon: History, desc: "Wins, losses & draws" },
      { label: "Settings", href: "/settings", icon: Settings, desc: "Account & preferences", separator: true },
    ],
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [liveGames, setLiveGames] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState(0);
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchRef = useRef<HTMLInputElement>(null);

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
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Live status data — real counts from backend, refreshed gently
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const [games, queue, tournaments] = await Promise.all([
          supabase.from("online_games").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("matchmaking_queue").select("user_id", { count: "exact", head: true }),
          supabase.from("tournaments").select("id", { count: "exact", head: true }).in("status", ["registration", "active", "in_progress"]),
        ]);
        if (cancelled) return;
        const live = games.count ?? 0;
        const waiting = queue.count ?? 0;
        setLiveGames(live);
        // Online ≈ players in active games (×2) + matchmaking queue
        setOnlineCount(live * 2 + waiting);
        setActiveTournaments(tournaments.count ?? 0);
      } catch {
        /* silent — keep last known values */
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 250);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-500 ${
          scrolled
            ? "shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7),0_2px_0_hsl(var(--primary)/0.18)]"
            : "shadow-[0_4px_18px_rgba(0,0,0,0.5),0_1px_0_hsl(var(--border))]"
        }`}
      >
        <motion.nav
          className="relative border-b border-border/70 bg-[hsl(220,15%,7%)]/95 backdrop-blur-2xl backdrop-saturate-150"
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div
            className={`container mx-auto flex items-center justify-between px-5 transition-all duration-500 ${
              shrunk ? "h-14" : "h-16"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="MasterChess home">
              <motion.div
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300"
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Crown className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="font-display font-bold tracking-wider text-foreground hidden sm:inline uppercase text-base">
                Master<span className="text-gradient-gold">Chess</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1 mx-8">
              {NAV_SECTIONS.map((section) => {
                const isActive = section.items.some(item =>
                  item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
                );
                const accentColor = `hsl(${section.accent})`;
                return (
                  <div
                    key={section.key}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(section.key)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden"
                      style={{
                        color: isActive || activeDropdown === section.key ? accentColor : undefined,
                        backgroundColor: isActive || activeDropdown === section.key ? `hsla(${section.accent} / 0.1)` : undefined,
                      }}
                    >
                      {/* Subtle light sweep on hover */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out"
                        style={{
                          background: `linear-gradient(110deg, transparent 30%, hsla(${section.accent} / 0.18) 50%, transparent 70%)`,
                        }}
                      />
                      <section.icon className="relative h-4 w-4" style={isActive || activeDropdown === section.key ? { color: accentColor } : undefined} />
                      <span className={`relative ${!(isActive || activeDropdown === section.key) ? "text-muted-foreground group-hover:text-foreground" : ""}`}>{section.label}</span>
                      <ChevronDown
                        className={`relative h-3.5 w-3.5 transition-transform duration-300 ${activeDropdown === section.key ? "rotate-180" : ""}`}
                        style={isActive || activeDropdown === section.key ? { color: accentColor } : undefined}
                      />
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                            boxShadow: `0 0 10px hsla(${section.accent} / 0.55)`,
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {activeDropdown === section.key && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 rounded-2xl z-50 backdrop-blur-2xl ${
                            section.wide ? "w-[380px]" : "w-[300px]"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, hsla(${section.accent} / 0.06) 0%, hsl(220 15% 10% / 0.97) 40%, hsl(220 15% 10% / 0.97) 100%)`,
                            border: `1px solid hsla(${section.accent} / 0.2)`,
                            boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px -5px rgba(${section.accentRgb},0.12), inset 0 1px 0 hsla(${section.accent} / 0.1)`,
                          }}
                          onMouseEnter={() => handleMouseEnter(section.key)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div
                            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                            style={{ background: `linear-gradient(90deg, transparent 5%, hsla(${section.accent} / 0.6) 50%, transparent 95%)` }}
                          />
                          <div className="px-4 pt-3.5 pb-2 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsla(${section.accent} / 0.15)` }}>
                              <section.icon className="h-4 w-4" style={{ color: accentColor }} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>{section.label}</span>
                          </div>
                          <div className="px-2 pb-2.5 max-h-[75vh] overflow-y-auto">
                            {section.items
                              .filter(item => !item.auth || user)
                              .map((item, idx) => {
                                const itemActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
                                return (
                                  <div key={item.label}>
                                    {item.separator && idx > 0 && (
                                      <div className="mx-3 my-2 h-px" style={{ backgroundColor: `hsla(${section.accent} / 0.1)` }} />
                                    )}
                                    {item.subheading && (
                                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold px-3.5 pt-2 pb-1" style={{ color: `hsla(${section.accent} / 0.5)` }}>
                                        {item.subheading}
                                      </p>
                                    )}
                                    <Link
                                      to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group/item"
                                      style={{
                                        backgroundColor: item.highlight ? `hsla(${section.accent} / 0.12)` : itemActive ? `hsla(${section.accent} / 0.08)` : undefined,
                                        border: item.highlight ? `1px solid hsla(${section.accent} / 0.2)` : "1px solid transparent",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!item.highlight) e.currentTarget.style.backgroundColor = `hsla(${section.accent} / 0.08)`;
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!item.highlight && !itemActive) e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{ backgroundColor: item.highlight || itemActive ? `hsla(${section.accent} / 0.2)` : `hsla(${section.accent} / 0.08)` }}
                                      >
                                        <item.icon className="h-4 w-4 transition-colors duration-200" style={{ color: item.highlight || itemActive || item.comingSoon ? accentColor : `hsla(${section.accent} / 0.6)` }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-[13px] font-medium leading-tight" style={{ color: item.highlight ? accentColor : item.comingSoon ? "hsl(var(--foreground) / 0.6)" : "hsl(var(--foreground))" }}>
                                            {item.label}
                                          </p>
                                          {item.highlight && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `hsla(${section.accent} / 0.25)`, color: accentColor }}>⚡ GO</span>
                                          )}
                                          {item.comingSoon && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide" style={{ backgroundColor: `hsla(${section.accent} / 0.2)`, color: accentColor }}>SOON</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5">{item.desc}</p>
                                      </div>
                                      {item.comingSoon && <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: `hsla(${section.accent} / 0.4)` }} />}
                                    </Link>
                                  </div>
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
              {/* Search */}
              <div className="hidden lg:flex items-center">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden mr-1"
                    >
                      <input
                        ref={searchRef}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); }}
                        placeholder="Search..."
                        className="h-9 w-full bg-muted/20 border border-border/40 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all duration-300"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/20 transition-all duration-200"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>


              {/* Play Now button */}
              <Link to="/play" className="hidden lg:block">
                <Button
                  size="sm"
                  className="relative bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm px-5 h-9 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] overflow-hidden group transition-all duration-300"
                >
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Play Now
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </Button>
              </Link>

              {/* User area */}
              {loading ? (
                <div className="h-9 w-24 bg-muted/20 rounded-xl animate-pulse" />
              ) : user ? (
                <>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm px-3.5 py-2 hover:border-primary/30 hover:bg-card/70 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[80px] truncate hidden sm:inline">
                      {profile?.display_name || profile?.username || "Player"}
                    </span>
                    {profile && <span className="font-mono text-xs text-primary font-bold">{profile.rating}</span>}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-9 w-9 hidden lg:flex" aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm h-9 px-4">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)] text-sm h-9 px-5">Sign Up</Button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-muted/20 text-foreground transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </motion.nav>

        {/* Thin live status bar */}
        <AnimatePresence>
          {!shrunk && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block border-b border-border/10 bg-[hsl(220,15%,5%)/0.7] backdrop-blur-xl"
            >
              <div className="container mx-auto px-5 h-6 flex items-center justify-between text-[10.5px] font-medium tracking-wide">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5 text-muted-foreground/80">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-foreground/85">{onlineCount.toLocaleString()}</span>
                    <span className="text-muted-foreground/60">online</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground/80">
                    <Gamepad2 className="h-2.5 w-2.5 text-primary/70" />
                    <span className="text-foreground/85">{liveGames.toLocaleString()}</span>
                    <span className="text-muted-foreground/60">live games</span>
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 text-muted-foreground/80">
                    <Trophy className="h-2.5 w-2.5 text-amber-400/80" />
                    <span className="text-foreground/85">{activeTournaments}</span>
                    <span className="text-muted-foreground/60">tournaments</span>
                  </span>
                </div>
                <Link to="/live" className="hidden sm:flex items-center gap-1.5 text-muted-foreground/70 hover:text-foreground transition-colors">
                  <Radio className="h-2.5 w-2.5 text-rose-400" />
                  <span>DailyChess_12 live</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className={`transition-all duration-500 ${shrunk ? "h-14" : "h-[88px]"}`} />


      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[hsl(220,15%,5%)/0.98] backdrop-blur-xl overflow-y-auto pt-20 pb-24 px-5"
          >
            <div className="max-w-lg mx-auto space-y-4">
              {/* Mobile Play Now */}
              <Link to="/play" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)] h-12 text-base">
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Play Now
                </Button>
              </Link>

              {NAV_SECTIONS.map((section) => {
                const accentColor = `hsl(${section.accent})`;
                return (
                  <div
                    key={section.key}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      border: `1px solid hsla(${section.accent} / ${mobileExpanded === section.key ? 0.25 : 0.1})`,
                      background: mobileExpanded === section.key
                        ? `linear-gradient(135deg, hsla(${section.accent} / 0.08) 0%, hsl(220 15% 8% / 0.95) 50%)`
                        : `hsl(220 15% 8% / 0.5)`,
                    }}
                  >
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsla(${section.accent} / 0.15)` }}>
                          <section.icon className="h-4 w-4" style={{ color: accentColor }} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: accentColor }}>{section.label}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileExpanded === section.key ? "rotate-180" : ""}`} style={{ color: `hsla(${section.accent} / 0.5)` }} />
                    </button>

                    <AnimatePresence>
                      {mobileExpanded === section.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-0.5">
                            {section.items
                              .filter(item => !item.auth || user)
                              .map((item) => (
                                <div key={item.label}>
                                  {item.subheading && (
                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold px-3 pt-3 pb-1" style={{ color: `hsla(${section.accent} / 0.45)` }}>
                                      {item.subheading}
                                    </p>
                                  )}
                                  <Link
                                    to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all active:scale-[0.98]"
                                    style={{
                                      backgroundColor: item.highlight ? `hsla(${section.accent} / 0.1)` : undefined,
                                      border: item.highlight ? `1px solid hsla(${section.accent} / 0.15)` : "1px solid transparent",
                                    }}
                                  >
                                    <item.icon className="h-5 w-5 shrink-0" style={{ color: item.highlight || item.comingSoon ? accentColor : `hsla(${section.accent} / 0.5)` }} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                                        {item.comingSoon && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `hsla(${section.accent} / 0.2)`, color: accentColor }}>SOON</span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{item.desc}</p>
                                    </div>
                                  </Link>
                                </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {user ? (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all w-full text-left"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Sign Out</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-12 text-base font-medium border-border/30">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full h-12 text-base font-bold bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,55,0.2)]">Sign Up</Button>
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
