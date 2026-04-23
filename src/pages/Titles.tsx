import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getTitle, getNextTitle, getTitlesForMode } from "@/lib/titles";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Globe, Lock, Check, Trophy, Crown, Sparkles, ArrowLeft } from "lucide-react";

type RatingMode = "online" | "bot";

const Titles = () => {
  const { profile } = useAuth();
  const [mode, setMode] = useState<RatingMode>("online");

  const currentRating = useMemo(() => {
    if (!profile) return 0;
    const p = profile as unknown as { rating?: number; bot_rating?: number };
    return mode === "online" ? p.rating ?? 0 : p.bot_rating ?? 0;
  }, [mode, profile]);

  const currentTitle = getTitle(currentRating, mode);
  const nextTitle = getNextTitle(currentRating, mode);
  const ratingToNext = nextTitle ? Math.max(0, nextTitle.minRating - currentRating) : 0;
  const titlesForMode = useMemo(() => getTitlesForMode(mode), [mode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-5xl">
        {/* Back link */}
        <Link
          to="/play"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Play
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <Trophy className="h-3.5 w-3.5" />
            MasterChess Title System
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-3">
            Earn Your <span className="text-gradient-gold">Title</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Reach rating thresholds to unlock prestigious titles. Once earned, titles are yours forever.
          </p>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <button
              onClick={() => setMode("online")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "online"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-4 w-4" />
              Online
            </button>
            <button
              onClick={() => setMode("bot")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "bot"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bot className="h-4 w-4" />
              Bot
            </button>
          </div>
        </div>

        {/* Current status card */}
        {profile && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-card/40 backdrop-blur-sm p-5 sm:p-6 mb-10 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-5">
              <div
                className={`flex flex-col items-center justify-center w-full sm:w-44 rounded-xl border ${currentTitle.borderColor} ${currentTitle.bgColor} p-4`}
              >
                <span className="text-4xl mb-1">{currentTitle.icon}</span>
                <span className={`text-sm font-bold ${currentTitle.color} text-center`}>
                  {currentTitle.label}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Current Title
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end justify-between mb-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                      {mode === "online" ? "Online Rating" : "Bot Rating"}
                    </p>
                    <p className="text-3xl sm:text-4xl font-mono font-bold text-foreground">
                      {currentRating}
                    </p>
                  </div>
                  {nextTitle && (
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                        Next: {nextTitle.label}
                      </p>
                      <p className={`text-lg font-bold ${nextTitle.color}`}>
                        {ratingToNext} to go
                      </p>
                    </div>
                  )}
                </div>
                {nextTitle ? (
                  <Progress
                    value={Math.min(
                      100,
                      ((currentRating - currentTitle.minRating) /
                        (nextTitle.minRating - currentTitle.minRating)) *
                        100
                    )}
                    className="h-2"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                    <Sparkles className="h-4 w-4" />
                    Maximum title reached — true legend!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Title ladder */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3 px-1">
            Title Ladder · {mode === "online" ? "Online Play" : "Vs Bots"}
          </h2>

          {titlesForMode.filter((t) => t.key !== "unranked").map((title, idx) => {
            const earned = currentRating >= title.minRating;
            const isCurrent = title.key === currentTitle.key;
            return (
              <motion.div
                key={title.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`group flex items-center gap-4 rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                  isCurrent
                    ? `${title.borderColor} ${title.bgColor} shadow-md`
                    : earned
                    ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30"
                    : "border-border/40 bg-card/40 hover:border-border/60"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 text-2xl sm:text-3xl border ${
                    earned ? title.borderColor : "border-border/40"
                  } ${earned ? title.bgColor : "bg-muted/20"} ${
                    !earned && "grayscale opacity-60"
                  }`}
                >
                  {title.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm sm:text-base font-bold ${
                        earned ? title.color : "text-muted-foreground"
                      }`}
                    >
                      {title.label}
                    </p>
                    {title.prestigious && (
                      <Crown className="h-3.5 w-3.5 text-yellow-400" />
                    )}
                    {isCurrent && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                        YOU
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">
                    {title.fullName}
                  </p>
                </div>

                {/* Rating threshold */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Required
                  </p>
                  <p
                    className={`text-lg sm:text-xl font-mono font-bold ${
                      earned ? title.color : "text-foreground/80"
                    }`}
                  >
                    {title.minRating}+
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0 hidden sm:flex">
                  {earned ? (
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/20 border border-border/40">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={mode === "online" ? "/play/online" : "/play"}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">
              {mode === "online" ? (
                <>
                  <Globe className="h-4 w-4 mr-2" /> Play Online to Climb
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" /> Play vs Bots to Climb
                </>
              )}
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button size="lg" variant="outline" className="border-border/50 hover:border-primary/40">
              <Trophy className="h-4 w-4 mr-2" /> View Leaderboard
            </Button>
          </Link>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground/70 mt-6 max-w-md mx-auto">
          Online and Bot ratings are tracked separately. Titles earned in either mode are saved permanently to your profile.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Titles;
