import { LogOut, Trophy, Swords, GraduationCap, Crown, Brain, Play, Award, Star, ChevronDown, Menu, X, Search, Users, BookOpen, FileText, Target, Medal, Radio, Shield, Eye, Zap, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StreakIndicator from "@/components/StreakIndicator";
import CoinBalancePill from "@/components/CoinBalancePill";
import NavSearchPalette from "@/components/NavSearchPalette";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

// Slimmed navbar — only the essentials. Everything else is reachable via the
// Cmd/Ctrl+K search palette, the user avatar menu, or the relevant pages.
const NAV_SECTIONS: NavSection[] = [
  {
    key: "play",
    label: "Play",
    icon: Swords,
    accent: "217 91% 65%",
    accentRgb: "77,163,255",
    items: [
      { label: "Quick Match", href: "/play/online", icon: Zap, desc: "Find an opponent instantly", highlight: true },
      { label: "Play vs Bot", href: "/play", icon: Brain, desc: "9 bots · 400–2000 ELO" },
      { label: "Play as Guest", href: "/play-guest", icon: Play, desc: "No signup · instant board" },
      { label: "Challenge Friend", href: "/vs/new", icon: UserPlus, desc: "Share a private link" },
      { label: "Puzzles", href: "/puzzles", icon: Target, desc: "Daily tactics & rush" },
      { label: "Battle Royale", href: "/battle-royale", icon: Crosshair, desc: "8-player single-elim" },
      { label: "Challenge Modes", href: "/challenges", icon: Sparkles, desc: "Win in 10, No castling…" },
      { label: "Ongoing Games", href: "/play/online", icon: Gamepad2, desc: "Resume your matches" },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    icon: GraduationCap,
    accent: "271 91% 65%",
    accentRgb: "168,85,247",
    items: [
      { label: "Lessons", href: "/learn", icon: Crown, desc: "Structured learning path", highlight: true },
      { label: "AI Coach", href: "/coach", icon: Brain, desc: "Ask anything, review games" },
      { label: "Openings Trainer", href: "/openings", icon: BookOpen, desc: "Explore & drill openings" },
      { label: "Game Review", href: "/analysis", icon: FileText, desc: "Analyze games & explore lines" },
      { label: "Guess the Move", href: "/guess-the-move", icon: Eye, desc: "Train your intuition" },
      { label: "Play Like a GM", href: "/play-like-gm", icon: Star, desc: "Match grandmaster moves" },
      { label: "Battle Pass", href: "/battle-pass", icon: Gift, desc: "30 tiers · XP rewards" },
    ],
  },
  {
    key: "tournaments",
    label: "Tournaments",
    icon: Trophy,
    accent: "38 92% 50%",
    accentRgb: "245,158,11",
    items: [
      { label: "All Tournaments", href: "/tournaments", icon: Trophy, desc: "Browse upcoming events", highlight: true },
      { label: "DB Chess Cup", href: "/dragan-brakus", icon: Award, desc: "Official MasterChess Cup · 30 Jun" },
      { label: "DB Cup · Register", href: "/tournaments/db-chess-cup/register", icon: UserPlus, desc: "Sign up with your FIDE ID" },
      { label: "DB Cup · Live", href: "/dragan-brakus/live", icon: Radio, desc: "Live standings & pairings" },
      { label: "MasterChess Monday", href: "/tournaments?series=monday", icon: Zap, desc: "Weekly blitz arena" },
      { label: "Friday Night Fire", href: "/tournaments?series=friday", icon: Sparkles, desc: "Bullet chaos · prizes" },
      { label: "Sunday Classic", href: "/tournaments?series=sunday", icon: Clock, desc: "Rapid swiss · every week" },
      { label: "Arena", href: "/tournaments?type=arena", icon: Crosshair, desc: "Open-entry timed arenas" },
      { label: "Team Battle", href: "/tournaments?type=team", icon: Shield, desc: "Club vs club" },
      { label: "Puzzle Tournament", href: "/puzzle-tournament", icon: Target, desc: "Solve fastest, win coins" },
      { label: "Leaderboard", href: "/leaderboard", icon: Medal, desc: "Top players globally" },
    ],
    wide: true,
  },
  {
    key: "news",
    label: "News",
    icon: Radio,
    accent: "150 70% 55%",
    accentRgb: "74,222,128",
    items: [
      { label: "Newsroom", href: "/news", icon: Radio, desc: "Chess news & MasterChess updates", highlight: true },
      { label: "Blog", href: "/blog", icon: BookOpen, desc: "Guides, openings, deep dives" },
      { label: "Submit Story", href: "/news/submit", icon: Plus, desc: "Share what you found", auth: true },
      { label: "Stream Hub", href: "/live", icon: Radio, desc: "DailyChess_12 live & VODs" },
      { label: "About Nikola", href: "/nikola", icon: Crown, desc: "Founder · 13 years old" },
      { label: "Why MasterChess", href: "/why-masterchess", icon: Star, desc: "For partners & press" },
    ],
  },
  {
    key: "community",
    label: "Community",
    icon: Users,
    accent: "190 95% 55%",
    accentRgb: "34,211,238",
    items: [
      { label: "Feed", href: "/community", icon: Users, desc: "Chess moments & posts", highlight: true },
      { label: "Friends", href: "/friends", icon: UserPlus, desc: "Your friends & requests", auth: true },
      { label: "Messages", href: "/messages", icon: Bell, desc: "Direct chats", auth: true },
      { label: "Clubs", href: "/clubs", icon: Shield, desc: "Find or create a team" },
      { label: "Chess Map", href: "/map", icon: Eye, desc: "Players around the world" },
      { label: "Confessions", href: "/confessions", icon: Heart, desc: "Anonymous chess thoughts" },
      { label: "Achievements", href: "/achievements", icon: Medal, desc: "Badges & milestones", auth: true },
    ],
  },
];

// FRIENDS_SECTION kept for backward compatibility (no longer rendered).
const FRIENDS_SECTION: NavSection = {
  key: "friends",
  label: "Friends",
  icon: Users,
  accent: "150 70% 55%",
  accentRgb: "74,222,128",
  items: [],
};


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

  // Escape closes mobile menu + body scroll lock when open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  // Cmd/Ctrl+K opens the search palette globally
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 420);
  };

  return (
    <>
      <div
        className={`app-navbar hidden lg:block fixed top-0 left-0 right-0 z-50 transition-shadow duration-500 ${
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
            className={`container mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 transition-all duration-500 ${
              shrunk ? "h-14" : "h-16"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0 min-w-0" aria-label="MasterChess home">
              <motion.div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:border-primary/50 group-hover:shadow-[0_0_28px_rgba(212,175,55,0.28)] transition-all duration-300 shrink-0"
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.55)]" aria-hidden="true" />
              </motion.div>
              <span
                className="font-display font-bold tracking-wide text-foreground uppercase text-lg sm:text-2xl whitespace-nowrap shrink-0"
                style={{ wordBreak: "keep-all", overflowWrap: "normal", whiteSpace: "nowrap" }}
              >
                Master<span className="text-gradient-gold">Chess</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2">
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
                      className="relative flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-display font-semibold uppercase tracking-[0.14em] transition-all duration-300 group overflow-hidden whitespace-nowrap shrink-0"
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
                      <section.icon className="relative h-4 w-4 shrink-0" style={{ color: accentColor }} />
                      <span
                        className="relative whitespace-nowrap transition-colors duration-300"
                        style={{ color: accentColor }}
                      >
                        {section.label}
                      </span>
                      <ChevronDown
                        className={`relative h-3.5 w-3.5 transition-transform duration-300 ${activeDropdown === section.key ? "rotate-180" : ""}`}
                        style={{ color: accentColor }}
                      />
                      {isActive && (
                        <>
                          {/* Pulsing glow halo behind active item */}
                          <motion.span
                            aria-hidden
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            animate={{ opacity: [0.35, 0.7, 0.35] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              boxShadow: `inset 0 0 0 1px hsla(${section.accent} / 0.45), 0 0 22px -4px hsla(${section.accent} / 0.55)`,
                            }}
                          />
                          <motion.span
                            layoutId="nav-active"
                            className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                              boxShadow: `0 0 14px hsla(${section.accent} / 0.8)`,
                            }}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {activeDropdown === section.key && (
                        <motion.div
                          initial={{ opacity: 0, y: 14, scale: 0.96, rotateX: -8 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97, rotateX: -4 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className={`absolute left-1/2 -translate-x-1/2 rounded-2xl z-[70] backdrop-blur-2xl flex flex-col overflow-hidden ${
                            section.wide ? "w-[340px]" : "w-[260px]"
                          }`}
                          style={{
                            top: shrunk ? "calc(100% + 12px)" : "calc(100% + 34px)",
                            transformOrigin: "top center",
                            background: `linear-gradient(160deg, hsla(${section.accent} / 0.14) 0%, hsl(220 15% 6%) 38%, hsl(220 18% 4%) 100%)`,
                            border: `1px solid hsla(${section.accent} / 0.4)`,
                            boxShadow: `0 24px 60px rgba(0,0,0,0.9), 0 0 40px -8px rgba(${section.accentRgb},0.3), inset 0 1px 0 hsla(${section.accent} / 0.2), inset 0 -1px 0 rgba(0,0,0,0.4)`,
                          }}
                          onMouseEnter={() => handleMouseEnter(section.key)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {/* animated top accent line */}
                          <motion.div
                            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none z-10"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            style={{
                              transformOrigin: "left",
                              background: `linear-gradient(90deg, transparent 0%, hsla(${section.accent} / 0.95) 50%, transparent 100%)`,
                              boxShadow: `0 0 14px hsla(${section.accent} / 0.75)`,
                            }}
                          />
                          {/* subtle radial glow at top */}
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none opacity-60"
                            style={{
                              background: `radial-gradient(ellipse at top, hsla(${section.accent} / 0.4) 0%, transparent 70%)`,
                            }}
                          />

                          <div
                            className="px-3 pt-3 pb-2 flex items-center gap-2 shrink-0 rounded-t-2xl"
                            style={{
                              background: `linear-gradient(180deg, hsl(220 15% 8%) 0%, hsl(220 15% 7%) 100%)`,
                              borderBottom: `1px solid hsla(${section.accent} / 0.28)`,
                              boxShadow: `0 2px 0 hsla(${section.accent} / 0.4)`,
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `hsla(${section.accent} / 0.22)`, border: `1px solid hsla(${section.accent} / 0.35)` }}>
                              <section.icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] leading-none whitespace-nowrap" style={{ color: accentColor, textShadow: `0 0 12px hsla(${section.accent} / 0.4)` }}>
                              {section.label}
                            </span>
                          </div>
                          <div className="px-1.5 pb-1 pt-0.5">
                            {section.items
                              .filter(item => !item.auth || user)
                              .map((item, idx) => {
                                const itemPath = item.href.split(/[#?]/)[0];
                                const itemActive = itemPath === "/" ? location.pathname === "/" : location.pathname.startsWith(itemPath);
                                return (
                                  <div key={item.label}>
                                    {item.separator && idx > 0 && (
                                      <div className="mx-2 my-0.5 h-px" style={{ backgroundColor: `hsla(${section.accent} / 0.1)` }} />
                                    )}
                                    {item.subheading && (
                                      <p className="text-[10px] uppercase tracking-[0.14em] font-extrabold px-3 pt-1.5 pb-0.5" style={{ color: accentColor, textShadow: `0 0 10px hsla(${section.accent} / 0.35)` }}>
                                        {item.subheading}
                                      </p>
                                    )}
                                    <Link
                                      to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 group/item"
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
                                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{ backgroundColor: item.highlight || itemActive ? `hsla(${section.accent} / 0.2)` : `hsla(${section.accent} / 0.08)` }}
                                      >
                                        <item.icon className="h-3.5 w-3.5 transition-colors duration-200" style={{ color: item.highlight || itemActive || item.comingSoon ? accentColor : `hsla(${section.accent} / 0.6)` }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: item.highlight ? accentColor : item.comingSoon ? "hsl(var(--foreground) / 0.6)" : "hsl(var(--foreground))" }}>
                                            {item.label}
                                          </p>
                                          {item.highlight && (
                                            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: `hsla(${section.accent} / 0.25)`, color: accentColor }}>GO</span>
                                          )}
                                          {item.comingSoon && (
                                            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold tracking-wide" style={{ backgroundColor: `hsla(${section.accent} / 0.2)`, color: accentColor }}>SOON</span>
                                          )}
                                        </div>
                                      </div>
                                      {item.comingSoon && <Lock className="h-3 w-3 shrink-0" style={{ color: `hsla(${section.accent} / 0.4)` }} />}
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

              {/* Search button — opens full palette */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/20 transition-all duration-200 shrink-0"
                aria-label="Search MasterChess"
                title="Search every page (Ctrl/Cmd+K)"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Donate button — ALWAYS visible (mobile + desktop) */}
              <Link to="/supporter" aria-label="Donate to MasterChess" title="Support MasterChess">
                <Button
                  size="sm"
                  className="h-9 px-2.5 sm:px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold shadow-[0_0_18px_rgba(251,191,36,0.4)] hover:shadow-[0_0_26px_rgba(251,191,36,0.6)] transition-all"
                >
                  <Heart className="h-4 w-4 fill-current sm:mr-1.5" />
                  <span className="hidden sm:inline">Donate</span>
                </Button>
              </Link>

              {/* Rate MasterChess button — visible from sm up (icon-only on small, with text from md+) */}
              <Link to="/rate-masterchess" aria-label="Rate MasterChess" title="Rate MasterChess">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2.5 md:px-3 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 font-semibold"
                >
                  <Star className="h-4 w-4 fill-current md:mr-1.5" />
                  <span className="hidden md:inline">Rate</span>
                </Button>
              </Link>

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


              {/* Language switcher removed — site is English-only */}

              {/* User streak + sign out */}
              {loading ? (
                <div className="h-9 w-9 bg-muted/20 rounded-xl animate-pulse" />
              ) : user ? (
                <>
                  <CoinBalancePill />
                  <StreakIndicator />
                  <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-9 w-9 hidden xl:flex" aria-label="Sign out">
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
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-overlay"
                className="lg:hidden p-2.5 min-h-11 min-w-11 rounded-lg hover:bg-muted/20 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Search palette */}
      <NavSearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />


      {/* Spacer (hidden on mobile — the top bar itself is hidden on < lg) */}
      <div className={`app-navbar-spacer hidden lg:block transition-all duration-500 ${shrunk ? "h-14" : "h-[88px]"}`} />


      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[hsl(220,15%,5%)]/98 backdrop-blur-xl overflow-y-auto pt-16 pb-28"
          >
            {/* Sticky CTA header — auth actions only (Play CTAs live in bottom nav) */}
            {!user && (
              <div className="sticky top-0 z-10 -mt-16 pt-16 pb-4 px-4 bg-[hsl(220,15%,5%)] backdrop-blur-xl border-b border-border/20 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]">
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-2.5">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full h-10 text-sm border border-border/30">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full h-10 text-sm font-bold bg-foreground text-background hover:bg-foreground/90">Create Account</Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="max-w-lg mx-auto space-y-3 px-4 pt-4">

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
                      aria-expanded={mobileExpanded === section.key}
                      aria-controls={`mobile-section-${section.key}`}
                      aria-label={`${section.label} menu`}
                      className="w-full flex items-center justify-between px-5 py-4 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div aria-hidden="true" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsla(${section.accent} / 0.15)` }}>
                          <section.icon className="h-4 w-4" style={{ color: accentColor }} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: accentColor }}>{section.label}</span>
                      </div>
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-300 ${mobileExpanded === section.key ? "rotate-180" : ""}`} style={{ color: `hsla(${section.accent} / 0.5)` }} />
                    </button>

                    <AnimatePresence>
                      {mobileExpanded === section.key && (
                        <motion.div
                          id={`mobile-section-${section.key}`}
                          role="region"
                          aria-label={`${section.label} links`}
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

              {user && (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all w-full text-left"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
