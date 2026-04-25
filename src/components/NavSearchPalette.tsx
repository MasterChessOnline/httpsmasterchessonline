import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Swords, Zap, Brain, Settings, Award, Clock, Gamepad2,
  GraduationCap, Sparkles, BookOpen, Target, Crown, FileText,
  Trophy, Plus, ListChecks, Radio, Eye, Users, User, History,
  UserPlus, Shield, Medal, Star, Palette, BarChart3, Crosshair,
} from "lucide-react";

type Category = "play" | "learn" | "compete" | "live" | "friends" | "profile" | "tools";

interface SearchEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  desc: string;
  category: Category;
  keywords?: string;
}

const CATEGORY_META: Record<Category, { label: string; accent: string; accentRgb: string }> = {
  play:    { label: "Play",    accent: "217 91% 65%", accentRgb: "77,163,255" },
  learn:   { label: "Learn",   accent: "271 91% 65%", accentRgb: "168,85,247" },
  compete: { label: "Compete", accent: "38 92% 50%",  accentRgb: "245,158,11" },
  live:    { label: "Live",    accent: "0 84% 60%",   accentRgb: "239,68,68" },
  friends: { label: "Friends", accent: "150 70% 55%", accentRgb: "74,222,128" },
  profile: { label: "Profile", accent: "190 95% 55%", accentRgb: "34,211,238" },
  tools:   { label: "Tools",   accent: "320 80% 60%", accentRgb: "236,72,153" },
};

const ENTRIES: SearchEntry[] = [
  // PLAY
  { label: "Quick Match",       href: "/play/online",   icon: Zap,       desc: "Find opponent instantly",    category: "play",    keywords: "matchmaking online" },
  { label: "Play vs Bot",       href: "/play",          icon: Brain,     desc: "Challenge an AI",            category: "play",    keywords: "computer ai" },
  { label: "Custom Game",       href: "/play",          icon: Settings,  desc: "Set your own rules",         category: "play" },
  { label: "Bullet (1–2 min)",  href: "/play/online",   icon: Zap,       desc: "Lightning fast",             category: "play",    keywords: "bullet time" },
  { label: "Blitz (3–5 min)",   href: "/play/online",   icon: Clock,     desc: "Quick tactical battles",     category: "play",    keywords: "blitz" },
  { label: "Rapid (10+ min)",   href: "/play/online",   icon: Clock,     desc: "Deep strategic play",        category: "play",    keywords: "rapid" },
  { label: "Ongoing Games",     href: "/play/online",   icon: Gamepad2,  desc: "Resume your matches",        category: "play" },
  { label: "Daily Challenge",   href: "/daily-challenge", icon: Target,  desc: "Today's puzzle position",    category: "play" },
  { label: "Story Mode",        href: "/story",         icon: BookOpen,  desc: "Narrative campaign",         category: "play" },
  { label: "Play Like a GM",    href: "/play-like-gm",  icon: Crown,     desc: "Mimic legendary games",      category: "play" },
  { label: "Guess the Move",    href: "/guess-the-move", icon: Crosshair, desc: "Test your intuition",       category: "play" },
  { label: "Skill Tree",        href: "/skill-tree",    icon: Star,      desc: "Unlock playstyles",          category: "play" },
  { label: "Titles & Ratings",  href: "/play/titles",   icon: Award,     desc: "Rating thresholds",          category: "play" },

  // LEARN
  { label: "Daily Training Plan", href: "/daily-plan",  icon: Sparkles,  desc: "Personalized daily tasks",   category: "learn",   keywords: "daily plan" },
  { label: "AI Coach",            href: "/coach",       icon: Brain,     desc: "Ask the chess coach",        category: "learn" },
  { label: "Opening Repertoire",  href: "/repertoire",  icon: BookOpen,  desc: "Build your repertoire",      category: "learn" },
  { label: "Training",            href: "/learn",       icon: Target,    desc: "Structured learning path",   category: "learn" },
  { label: "Openings",            href: "/openings",    icon: BookOpen,  desc: "Master opening systems",     category: "learn" },
  { label: "Opening Explorer",    href: "/opening-explorer", icon: Eye,  desc: "Browse all openings",        category: "learn" },
  { label: "Opening Trainer",     href: "/opening-trainer", icon: Target,desc: "Drill opening lines",        category: "learn" },
  { label: "Lessons",             href: "/lessons",     icon: GraduationCap, desc: "Interactive lessons",    category: "learn" },
  { label: "Endgames",            href: "/learn",       icon: Crown,     desc: "Endgame technique",          category: "learn" },
  { label: "Piece Values",        href: "/piece-values", icon: Shield,   desc: "Material fundamentals",      category: "learn" },
  { label: "Import PGN / Analyze", href: "/analysis",   icon: FileText,  desc: "Analyze any game",           category: "learn",   keywords: "analysis pgn" },
  { label: "Game Review",         href: "/game-review", icon: History,   desc: "Move-by-move replay",        category: "learn" },
  { label: "Missions",            href: "/missions",    icon: ListChecks, desc: "Daily learning missions",   category: "learn" },

  // COMPETE
  { label: "Top Players (Leaderboard)", href: "/leaderboard", icon: Crown, desc: "Global rankings",          category: "compete", keywords: "ranks ranking" },
  { label: "Bullet Ranks",  href: "/leaderboard", icon: Zap,   desc: "1–2 min rankings",                     category: "compete" },
  { label: "Blitz Ranks",   href: "/leaderboard", icon: Clock, desc: "3–5 min rankings",                     category: "compete" },
  { label: "Rapid Ranks",   href: "/leaderboard", icon: Clock, desc: "10+ min rankings",                     category: "compete" },
  { label: "Tournaments",   href: "/tournaments", icon: Trophy, desc: "Browse tournaments",                  category: "compete" },
  { label: "Create Tournament", href: "/tournaments", icon: Plus, desc: "Host your own event",              category: "compete" },
  { label: "Achievements",  href: "/achievements", icon: Medal, desc: "Unlocked milestones",                 category: "compete" },
  { label: "Titles",        href: "/titles", icon: Award, desc: "Earn official titles",                      category: "compete" },

  // LIVE
  { label: "Stream Hub",      href: "/live",      icon: Radio, desc: "Watch DailyChess_12 live",            category: "live" },
  { label: "Spectate Games",  href: "/spectate",  icon: Eye,   desc: "Watch player matches",                category: "live" },
  { label: "Community",       href: "/community", icon: Users, desc: "Posts & chess moments",               category: "live" },
  { label: "Clubs",           href: "/clubs",     icon: Shield, desc: "Browse clubs & teams",               category: "live" },

  // FRIENDS
  { label: "Friends List",     href: "/friends", icon: Users,    desc: "Your friends & requests",           category: "friends" },
  { label: "Add a Friend",     href: "/friends", icon: UserPlus, desc: "Send a friend request",             category: "friends",  keywords: "invite add" },
  { label: "Challenge a Friend", href: "/friends", icon: Swords, desc: "Send a game invite",                category: "friends" },
  { label: "Create a Team",    href: "/clubs",   icon: Plus,     desc: "Make your own group",               category: "friends",  keywords: "team group club" },
  { label: "Browse Teams",     href: "/clubs",   icon: Shield,   desc: "Find a club to join",               category: "friends" },
  { label: "Chat",             href: "/chat",    icon: Users,    desc: "Direct messages",                   category: "friends" },

  // PROFILE
  { label: "My Profile",   href: "/profile",   icon: User,      desc: "Rating & stats",                     category: "profile" },
  { label: "Chess Card",   href: "/chess-card", icon: Sparkles, desc: "Your skill profile",                 category: "profile" },
  { label: "Match History", href: "/history",  icon: History,   desc: "Wins, losses & draws",               category: "profile" },
  { label: "Stats",        href: "/stats",     icon: BarChart3, desc: "Detailed analytics",                 category: "profile" },
  { label: "Settings",     href: "/settings",  icon: Settings,  desc: "Account & preferences",              category: "profile" },
  { label: "Appearance",   href: "/settings",  icon: Palette,   desc: "Themes & board styles",              category: "profile" },

  // TOOLS / EXTRAS
  { label: "Chess Tools",      href: "/chess-tools",       icon: Crosshair,   desc: "Utilities collection",  category: "tools" },
  { label: "Rating Calculator", href: "/rating-calculator", icon: BarChart3, desc: "Estimate rating change", category: "tools" },
  { label: "About",            href: "/about",             icon: FileText,    desc: "About MasterChess",     category: "tools" },
  { label: "Contact",          href: "/contact",           icon: FileText,    desc: "Get in touch",          category: "tools" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const NavSearchPalette = ({ open, onClose }: Props) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = ENTRIES.filter(e =>
      !term ||
      e.label.toLowerCase().includes(term) ||
      e.desc.toLowerCase().includes(term) ||
      (e.keywords ?? "").toLowerCase().includes(term) ||
      e.category.includes(term)
    );
    const order: Category[] = ["play", "learn", "compete", "live", "friends", "profile", "tools"];
    return order
      .map(cat => ({ cat, items: filtered.filter(f => f.category === cat) }))
      .filter(g => g.items.length > 0);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl rounded-2xl border border-border/50 bg-[hsl(220_15%_6%)] shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_0_1px_hsl(var(--primary)/0.1)] overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search every page, feature & shortcut…"
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded border border-border/40 text-muted-foreground">ESC</kbd>
              <button onClick={onClose} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto px-3 py-3 space-y-4">
              {grouped.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-12">No results for "{q}"</p>
              )}
              {grouped.map(group => {
                const meta = CATEGORY_META[group.cat];
                const accent = `hsl(${meta.accent})`;
                return (
                  <div key={group.cat}>
                    <div className="flex items-center gap-2 px-2 pb-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: accent, boxShadow: `0 0 8px hsla(${meta.accent} / 0.6)` }}
                      />
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
                        style={{ color: accent, textShadow: `0 0 10px hsla(${meta.accent} / 0.4)` }}
                      >
                        {meta.label}
                      </span>
                      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, hsla(${meta.accent} / 0.3), transparent)` }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {group.items.map(item => (
                        <Link
                          key={`${group.cat}-${item.label}`}
                          to={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group"
                          style={{
                            background: `hsla(${meta.accent} / 0.04)`,
                            border: `1px solid hsla(${meta.accent} / 0.12)`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `hsla(${meta.accent} / 0.14)`;
                            e.currentTarget.style.borderColor = `hsla(${meta.accent} / 0.35)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `hsla(${meta.accent} / 0.04)`;
                            e.currentTarget.style.borderColor = `hsla(${meta.accent} / 0.12)`;
                          }}
                        >
                          <div
                            className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: `hsla(${meta.accent} / 0.18)`, border: `1px solid hsla(${meta.accent} / 0.25)` }}
                          >
                            <item.icon className="h-3.5 w-3.5" style={{ color: accent }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground/70 truncate">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border/30 px-5 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground bg-[hsl(220_15%_5%)]">
              <span>Browse every corner of MasterChess</span>
              <span>Color-coded by section</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavSearchPalette;
