import { LogOut, User, Trophy, Swords, GraduationCap, Crown, Brain, Settings, BarChart3, Target, Zap, Clock, Eye, BookOpen, Play, Award, Star, ChevronDown, Menu, X, Bell, Search, Users, Gamepad2, Sparkles, Shield, Crosshair, FileText, History, Lock, Palette, Plus, ListChecks, Medal, Radio, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StreakIndicator from "@/components/StreakIndicator";
import NavSearchPalette from "@/components/NavSearchPalette";

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
      { label: "Titles & Ratings", href: "/play/titles", icon: Award, desc: "View rating thresholds", separator: true },
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
    wide: true,
    accent: "38 92% 50%",
    accentRgb: "245,158,11",
    items: [
      { label: "Top Players", href: "/leaderboard", icon: Crown, desc: "Global leaderboard ranking", highlight: true, subheading: "Ranks" },
      { label: "Bullet Ranks", href: "/leaderboard", icon: Zap, desc: "1–2 min rankings" },
      { label: "Blitz Ranks", href: "/leaderboard", icon: Clock, desc: "3–5 min rankings" },
      { label: "Rapid Ranks", href: "/leaderboard", icon: Clock, desc: "10+ min rankings" },
      { label: "Join Tournament", href: "/tournaments", icon: Trophy, desc: "Browse open tournaments", separator: true, subheading: "Tournaments" },
      { label: "Starting Soon", href: "/tournaments", icon: Clock, desc: "Upcoming events" },
      { label: "Create Tournament", href: "/tournaments", icon: Plus, desc: "Host your own event" },
      { label: "My Tournaments", href: "/tournaments", icon: ListChecks, desc: "Your active tournaments" },
    ],
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    accent: "190 95% 55%",
    accentRgb: "34,211,238",
    items: [
      { label: "My Profile", href: "/profile", icon: User, desc: "Rating & stats", auth: true, highlight: true },
      { label: "Chess Card", href: "/chess-card", icon: Sparkles, desc: "Your skill profile & compare", auth: true },
      { label: "Match History", href: "/history", icon: History, desc: "Wins, losses & draws" },
      { label: "Stats", href: "/stats", icon: BarChart3, desc: "Detailed analytics", subheading: "Insights", separator: true },
      { label: "Achievements", href: "/achievements", icon: Medal, desc: "Unlocked milestones" },
      { label: "Settings", href: "/settings", icon: Settings, desc: "Account & preferences", separator: true, subheading: "Account" },
    ],
  },
];

// Friends mega-section — lives separately, rendered as the rightmost nav dropdown
const FRIENDS_SECTION: NavSection = {
  key: "friends",
  label: "Friends",
  icon: Users,
  accent: "150 70% 55%",
  accentRgb: "74,222,128",
  items: [
    { label: "All Friends", href: "/friends", icon: Users, desc: "View your friends list", auth: true, highlight: true },
    { label: "Add a Friend", href: "/friends", icon: UserPlus, desc: "Send a new friend request", auth: true },
    { label: "Friend Requests", href: "/friends", icon: Bell, desc: "Pending invitations", auth: true },
    { label: "Challenge a Friend", href: "/friends", icon: Swords, desc: "Send a game invite", auth: true, separator: true, subheading: "Play Together" },
    { label: "Group Match", href: "/friends", icon: Gamepad2, desc: "Quick game with a friend", auth: true },
    { label: "Browse Teams", href: "/clubs", icon: Shield, desc: "Find a club or team", separator: true, subheading: "Teams & Clubs" },
    { label: "Create a Team", href: "/clubs", icon: Plus, desc: "Build your own group", auth: true },
    { label: "Chat", href: "/chat", icon: FileText, desc: "Direct messages", auth: true, separator: true },
  ],
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
            className={`container mx-auto flex items-center justify-between gap-4 px-5 transition-all duration-500 ${
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
              <span className="font-display font-bold tracking-wide text-foreground hidden sm:inline uppercase text-2xl">
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
                      className="relative flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden whitespace-nowrap shrink-0"
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
                      <section.icon className="relative h-4 w-4 shrink-0" style={isActive || activeDropdown === section.key ? { color: accentColor } : undefined} />
                      <span className={`relative whitespace-nowrap ${!(isActive || activeDropdown === section.key) ? "text-muted-foreground group-hover:text-foreground" : ""}`}>{section.label}</span>
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
                          className={`absolute left-1/2 -translate-x-1/2 rounded-2xl z-[70] backdrop-blur-2xl flex flex-col ${
                            section.wide ? "w-[380px]" : "w-[300px]"
                          }`}
                          style={{
                            top: shrunk ? "calc(100% + 12px)" : "calc(100% + 34px)",
                            background: `linear-gradient(135deg, hsla(${section.accent} / 0.12) 0%, hsl(220 15% 6%) 35%, hsl(220 15% 5%) 100%)`,
                            border: `1px solid hsla(${section.accent} / 0.35)`,
                            boxShadow: `0 18px 50px rgba(0,0,0,0.85), 0 0 30px -5px rgba(${section.accentRgb},0.2), inset 0 1px 0 hsla(${section.accent} / 0.15)`,
                          }}
                          onMouseEnter={() => handleMouseEnter(section.key)}
                          onMouseLeave={handleMouseLeave}
                        >
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
                          <div className="px-1.5 pb-1.5">
                            {section.items
                              .filter(item => !item.auth || user)
                              .map((item, idx) => {
                                const itemActive = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
                                return (
                                  <div key={item.label}>
                                    {item.separator && idx > 0 && (
                                      <div className="mx-2 my-1.5 h-px" style={{ backgroundColor: `hsla(${section.accent} / 0.1)` }} />
                                    )}
                                    {item.subheading && (
                                      <p className="text-[10px] uppercase tracking-[0.14em] font-extrabold px-3 pt-2 pb-1" style={{ color: accentColor, textShadow: `0 0 10px hsla(${section.accent} / 0.35)` }}>
                                        {item.subheading}
                                      </p>
                                    )}
                                    <Link
                                      to={item.href === "/profile" && user ? `/profile/${user.id}` : item.href}
                                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group/item"
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
                                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{ backgroundColor: item.highlight || itemActive ? `hsla(${section.accent} / 0.2)` : `hsla(${section.accent} / 0.08)` }}
                                      >
                                        <item.icon className="h-3.5 w-3.5 transition-colors duration-200" style={{ color: item.highlight || itemActive || item.comingSoon ? accentColor : `hsla(${section.accent} / 0.6)` }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-medium leading-tight" style={{ color: item.highlight ? accentColor : item.comingSoon ? "hsl(var(--foreground) / 0.6)" : "hsl(var(--foreground))" }}>
                                            {item.label}
                                          </p>
                                          {item.highlight && (
                                            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: `hsla(${section.accent} / 0.25)`, color: accentColor }}>GO</span>
                                          )}
                                          {item.comingSoon && (
                                            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold tracking-wide" style={{ backgroundColor: `hsla(${section.accent} / 0.2)`, color: accentColor }}>SOON</span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">{item.desc}</p>
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
              {/* Friends dropdown */}
              {(() => {
                const section = FRIENDS_SECTION;
                const accentColor = `hsl(${section.accent})`;
                const isActive = location.pathname.startsWith("/friends");
                return (
                  <div
                    className="hidden lg:block relative"
                    onMouseEnter={() => handleMouseEnter(section.key)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="relative flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden whitespace-nowrap"
                      style={{
                        color: isActive || activeDropdown === section.key ? accentColor : undefined,
                        backgroundColor: isActive || activeDropdown === section.key ? `hsla(${section.accent} / 0.1)` : `hsla(${section.accent} / 0.04)`,
                        border: `1px solid hsla(${section.accent} / ${isActive || activeDropdown === section.key ? 0.4 : 0.18})`,
                      }}
                    >
                      <section.icon className="h-4 w-4" style={{ color: accentColor }} />
                      <span className={!(isActive || activeDropdown === section.key) ? "text-foreground/85" : ""}>{section.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${activeDropdown === section.key ? "rotate-180" : ""}`}
                        style={{ color: accentColor }}
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === section.key && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 rounded-2xl z-[70] backdrop-blur-2xl flex flex-col w-[320px]"
                          style={{
                            top: "calc(100% + 12px)",
                            background: `linear-gradient(135deg, hsla(${section.accent} / 0.12) 0%, hsl(220 15% 6%) 35%, hsl(220 15% 5%) 100%)`,
                            border: `1px solid hsla(${section.accent} / 0.35)`,
                            boxShadow: `0 18px 50px rgba(0,0,0,0.85), 0 0 30px -5px rgba(${section.accentRgb},0.2), inset 0 1px 0 hsla(${section.accent} / 0.15)`,
                          }}
                          onMouseEnter={() => handleMouseEnter(section.key)}
                          onMouseLeave={handleMouseLeave}
                        >
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
                          <div className="px-1.5 pb-1.5">
                            {section.items
                              .filter(item => !item.auth || user)
                              .map((item, idx) => {
                                const itemActive = location.pathname.startsWith(item.href);
                                return (
                                  <div key={item.label}>
                                    {item.separator && idx > 0 && (
                                      <div className="mx-2 my-1.5 h-px" style={{ backgroundColor: `hsla(${section.accent} / 0.1)` }} />
                                    )}
                                    {item.subheading && (
                                      <p className="text-[10px] uppercase tracking-[0.14em] font-extrabold px-3 pt-2 pb-1" style={{ color: accentColor, textShadow: `0 0 10px hsla(${section.accent} / 0.35)` }}>
                                        {item.subheading}
                                      </p>
                                    )}
                                    <Link
                                      to={item.href}
                                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
                                      style={{
                                        backgroundColor: item.highlight ? `hsla(${section.accent} / 0.12)` : itemActive ? `hsla(${section.accent} / 0.08)` : undefined,
                                        border: item.highlight ? `1px solid hsla(${section.accent} / 0.2)` : "1px solid transparent",
                                      }}
                                      onMouseEnter={(e) => { if (!item.highlight) e.currentTarget.style.backgroundColor = `hsla(${section.accent} / 0.08)`; }}
                                      onMouseLeave={(e) => { if (!item.highlight && !itemActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                                    >
                                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.highlight || itemActive ? `hsla(${section.accent} / 0.2)` : `hsla(${section.accent} / 0.08)` }}>
                                        <item.icon className="h-3.5 w-3.5" style={{ color: item.highlight || itemActive ? accentColor : `hsla(${section.accent} / 0.7)` }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium leading-tight" style={{ color: item.highlight ? accentColor : "hsl(var(--foreground))" }}>{item.label}</p>
                                        <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">{item.desc}</p>
                                      </div>
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
              })()}

              {/* Search button — opens full palette */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/20 transition-all duration-200"
                aria-label="Search MasterChess"
                title="Search every page (Ctrl/Cmd+K)"
              >
                <Search className="h-4 w-4" />
              </button>

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

              {/* User streak + sign out */}
              {loading ? (
                <div className="h-9 w-9 bg-muted/20 rounded-xl animate-pulse" />
              ) : user ? (
                <>
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
                className="lg:hidden p-2.5 rounded-lg hover:bg-muted/20 text-foreground transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Search palette */}
      <NavSearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />


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

              {[...NAV_SECTIONS, FRIENDS_SECTION].map((section) => {
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
