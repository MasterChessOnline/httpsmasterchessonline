import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Swords, Brain, Trophy, GraduationCap, BookOpen, Users, BarChart3,
  Crown, Zap, Clock, Target, Sparkles, Settings, User, Award,
  Radio, FileText, Crosshair, Gamepad2, Eye, Shield, History,
  Palette, Medal, Star, Plus, ListChecks, Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PageEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  group: string;
  keywords?: string;
}

const PAGES: PageEntry[] = [
  // Play
  { label: "Quick Match", href: "/play/online", icon: Zap, group: "Play", keywords: "online multiplayer find opponent" },
  { label: "Play vs Bot", href: "/play", icon: Brain, group: "Play", keywords: "ai computer offline" },
  { label: "Bullet (1–2 min)", href: "/play/online", icon: Zap, group: "Play", keywords: "fast quick" },
  { label: "Blitz (3–5 min)", href: "/play/online", icon: Clock, group: "Play", keywords: "blitz fast" },
  { label: "Rapid (10+ min)", href: "/play/online", icon: Clock, group: "Play", keywords: "rapid slow" },
  { label: "Titles & Ratings", href: "/play/titles", icon: Award, group: "Play" },
  { label: "Challenge Modes", href: "/challenge", icon: Crosshair, group: "Play", keywords: "variants koth atomic" },
  { label: "Story Mode", href: "/story", icon: BookOpen, group: "Play" },
  { label: "Guess the Move", href: "/guess-the-move", icon: Eye, group: "Play" },
  { label: "Play Like a GM", href: "/play-like-gm", icon: Crown, group: "Play" },

  // Learn
  { label: "Daily Training Plan", href: "/daily-plan", icon: Sparkles, group: "Learn" },
  { label: "AI Coach", href: "/coach", icon: Brain, group: "Learn", keywords: "chat ask" },
  { label: "Opening Repertoire", href: "/repertoire", icon: BookOpen, group: "Learn" },
  { label: "Opening Trainer", href: "/openings", icon: BookOpen, group: "Learn", keywords: "sicilian french caro-kann" },
  { label: "Opening Explorer", href: "/opening-explorer", icon: BookOpen, group: "Learn" },
  { label: "Lessons / Training", href: "/learn", icon: GraduationCap, group: "Learn" },
  { label: "Skill Tree", href: "/skill-tree", icon: Target, group: "Learn" },
  { label: "Game Review", href: "/game-review", icon: FileText, group: "Learn" },
  { label: "Analysis Board", href: "/analysis", icon: FileText, group: "Learn", keywords: "pgn import" },
  { label: "Piece Values", href: "/piece-values", icon: Crown, group: "Learn" },

  // Compete
  { label: "Tournaments", href: "/tournaments", icon: Trophy, group: "Compete" },
  { label: "Daily Challenge", href: "/daily-challenge", icon: Sparkles, group: "Compete" },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3, group: "Compete", keywords: "ranking top players" },
  { label: "Achievements", href: "/achievements", icon: Medal, group: "Compete" },
  { label: "Daily Missions", href: "/missions", icon: ListChecks, group: "Compete", keywords: "streak quests" },

  // Community
  { label: "Stream Hub", href: "/live", icon: Radio, group: "Community", keywords: "youtube streams" },
  { label: "Community Feed", href: "/community", icon: Users, group: "Community", keywords: "posts social" },
  { label: "Friends", href: "/friends", icon: Users, group: "Community" },
  { label: "Clubs", href: "/clubs", icon: Shield, group: "Community" },
  { label: "Spectate Live Games", href: "/spectate", icon: Eye, group: "Community" },
  { label: "Chat", href: "/chat", icon: Users, group: "Community" },

  // Tools & Profile
  { label: "My Stats", href: "/stats", icon: BarChart3, group: "Profile" },
  { label: "Game History", href: "/history", icon: History, group: "Profile" },
  { label: "Chess Card", href: "/chess-card", icon: Palette, group: "Profile", keywords: "share business card" },
  { label: "Rating Calculator", href: "/rating-calculator", icon: BarChart3, group: "Tools" },
  { label: "Chess Tools", href: "/tools", icon: Settings, group: "Tools" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Tools", keywords: "preferences theme" },

  // Info
  { label: "About", href: "/about", icon: Star, group: "Info" },
  { label: "Contact", href: "/contact", icon: User, group: "Info" },
];

const QUICK_ACTIONS: PageEntry[] = [
  { label: "Start Quick Bullet Game", href: "/play/online", icon: Zap, group: "Quick Actions" },
  { label: "Open AI Coach", href: "/coach", icon: Brain, group: "Quick Actions" },
  { label: "View Today's Missions", href: "/missions", icon: ListChecks, group: "Quick Actions" },
  { label: "Watch Live Stream", href: "/live", icon: Radio, group: "Quick Actions" },
  { label: "Open Settings", href: "/settings", icon: Settings, group: "Quick Actions" },
];

interface UserResult {
  user_id: string;
  display_name: string | null;
  rating: number | null;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cmdk-recent") || "[]");
    } catch {
      return [];
    }
  });

  // Search users via Supabase when query >= 2 chars
  useEffect(() => {
    if (search.length < 2) {
      setUsers([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, rating")
        .ilike("display_name", `%${search}%`)
        .limit(5);
      setUsers((data as UserResult[]) || []);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const go = useCallback((href: string, label?: string) => {
    if (label) {
      const next = [label, ...recent.filter((r) => r !== label)].slice(0, 5);
      setRecent(next);
      localStorage.setItem("cmdk-recent", JSON.stringify(next));
    }
    onOpenChange(false);
    setSearch("");
    navigate(href);
  }, [navigate, onOpenChange, recent]);

  const recentEntries = recent
    .map((label) => [...PAGES, ...QUICK_ACTIONS].find((p) => p.label === label))
    .filter((x): x is PageEntry => Boolean(x));

  const groups = ["Play", "Learn", "Compete", "Community", "Profile", "Tools", "Info"] as const;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, actions, players…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[480px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {!search && recentEntries.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentEntries.map((item) => (
                <CommandItem
                  key={`recent-${item.label}`}
                  value={`recent ${item.label}`}
                  onSelect={() => go(item.href, item.label)}
                >
                  <item.icon className="mr-2 h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((item) => (
            <CommandItem
              key={item.label}
              value={`${item.label} ${item.keywords || ""}`}
              onSelect={() => go(item.href, item.label)}
            >
              <item.icon className="mr-2 h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {users.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Players">
              {users.map((u) => (
                <CommandItem
                  key={u.user_id}
                  value={`player ${u.display_name || u.user_id}`}
                  onSelect={() => go(`/profile/${u.user_id}`, u.display_name || "Player")}
                >
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1">{u.display_name || "Anonymous"}</span>
                  {u.rating && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {u.rating}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {groups.map((group) => {
          const items = PAGES.filter((p) => p.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <CommandSeparator />
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={`${group}-${item.label}`}
                    value={`${item.label} ${item.keywords || ""} ${group}`}
                    onSelect={() => go(item.href, item.label)}
                  >
                    <item.icon className="mr-2 h-4 w-4 text-primary/80" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex gap-3">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
        <span className="font-mono">⌘K</span>
      </div>
    </CommandDialog>
  );
}
