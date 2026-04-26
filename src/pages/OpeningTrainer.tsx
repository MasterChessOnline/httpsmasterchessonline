import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { OPENINGS_DATABASE, Opening } from "@/lib/openings-data";
import OpeningCard from "@/components/openings/OpeningCard";
import OpeningTrainerView from "@/components/openings/OpeningTrainerView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Filter, Crown } from "lucide-react";

type CategoryFilter = "all" | Opening["category"];
type DifficultyFilter = "all" | Opening["difficulty"];

const categories: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "king-pawn", label: "King's Pawn (e4)" },
  { value: "queen-pawn", label: "Queen's Pawn (d4)" },
  { value: "flank", label: "Flank" },
  { value: "indian", label: "Indian" },
];

const difficulties: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function OpeningTrainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("opening-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Deep-link: open a specific course when ?openingId=... is present
  // (used by "Continue course" from the Play page).
  useEffect(() => {
    const id = searchParams.get("openingId");
    if (!id) return;
    const found = OPENINGS_DATABASE.find((o) => o.id === id);
    if (found) {
      setSelectedOpening(found);
      // Clean the query so a back/refresh doesn't re-trigger.
      const next = new URLSearchParams(searchParams);
      next.delete("openingId");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("opening-favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = useMemo(() => {
    return OPENINGS_DATABASE.filter(o => {
      if (category !== "all" && o.category !== category) return false;
      if (difficulty !== "all" && o.difficulty !== difficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.name.toLowerCase().includes(q) || o.eco.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, category, difficulty]);

  // Detect masterclass openings (premium courses)
  const isMasterclass = (o: Opening) =>
    o.id.includes("masterclass") || o.name.toLowerCase().includes("masterclass") || o.name.toLowerCase().includes("masterkurs");

  // Split: masterclasses first, then everything else (favorites prioritised within each)
  const masterclassOpenings = useMemo(
    () => filtered.filter(isMasterclass).sort((a, b) => {
      const aFav = favorites.has(a.id) ? 0 : 1;
      const bFav = favorites.has(b.id) ? 0 : 1;
      return aFav - bFav;
    }),
    [filtered, favorites],
  );
  const regularOpenings = useMemo(
    () => filtered.filter((o) => !isMasterclass(o)).sort((a, b) => {
      const aFav = favorites.has(a.id) ? 0 : 1;
      const bFav = favorites.has(b.id) ? 0 : 1;
      return aFav - bFav;
    }),
    [filtered, favorites],
  );

  if (selectedOpening) {
    return <OpeningTrainerView opening={selectedOpening} onBack={() => setSelectedOpening(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Opening Trainer
            </Badge>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Master Every Opening
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore detailed variation trees, learn move-by-move explanations, and drill lines until they're second nature.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search openings by name or ECO code..."
              className="pl-10 bg-card border-border/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <Button
                key={c.value}
                variant={category === c.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c.value)}
                className="text-xs"
              >
                {c.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {difficulties.map(d => (
              <Button
                key={d.value}
                variant={difficulty === d.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(d.value)}
                className="text-xs"
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Masterclass — premium hero strip */}
      {masterclassOpenings.length > 0 && (
        <section className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
              <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                <Crown className="w-5 h-5 text-primary fill-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                Masterclass · Premium Repertoires
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
            </div>
            <p className="text-center text-muted-foreground text-xs sm:text-sm mb-5 max-w-2xl mx-auto">
              Elite, Stockfish-vetted opening repertoires with 50–130 annotated lines, interactive boards, and Practice mode.
            </p>
            <motion.div
              key={`mc-${category}-${difficulty}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {masterclassOpenings.map((opening, i) => (
                <OpeningCard
                  key={opening.id}
                  opening={opening}
                  index={i}
                  isFavorite={favorites.has(opening.id)}
                  onSelect={() => setSelectedOpening(opening)}
                  onToggleFavorite={() => toggleFavorite(opening.id)}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular openings grid */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {masterclassOpenings.length > 0 && regularOpenings.length > 0 && (
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              All Openings
            </h2>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${difficulty}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {regularOpenings.map((opening, i) => (
                <OpeningCard
                  key={opening.id}
                  opening={opening}
                  index={i}
                  isFavorite={favorites.has(opening.id)}
                  onSelect={() => setSelectedOpening(opening)}
                  onToggleFavorite={() => toggleFavorite(opening.id)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {masterclassOpenings.length === 0 && regularOpenings.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No openings match your search.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
