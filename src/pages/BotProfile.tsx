import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBotById } from "@/lib/bots/profiles";
import { Trophy, Swords, Target, TrendingUp, ArrowLeft, Bot, BookOpen, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RankBadge from "@/components/RankBadge";
import TitleBadge from "@/components/TitleBadge";
import { getRank } from "@/lib/ranks";
import { getTitle, getNextTitle, getTitleProgress } from "@/lib/titles";
import { Progress } from "@/components/ui/progress";

// Deterministic pseudo-stats so a bot's "career" feels stable across visits.
function botSeededStats(bot: { id: string; rating: number }) {
  let h = 0;
  for (let i = 0; i < bot.id.length; i++) h = (h * 31 + bot.id.charCodeAt(i)) >>> 0;
  const rand = (n: number) => ((h = (h * 9301 + 49297) % 233280) / 233280) * n;

  // Higher rated bots → more games and a stronger winrate.
  const games = 200 + Math.floor(rand(1200) + bot.rating / 4);
  const ratingFactor = Math.min(1, Math.max(0.45, (bot.rating - 400) / 2400));
  const winRate = 0.42 + ratingFactor * 0.28; // 42-70%
  const drawRate = 0.12 + (1 - ratingFactor) * 0.08;
  const wins = Math.floor(games * winRate);
  const draws = Math.floor(games * drawRate);
  const losses = games - wins - draws;
  const peak = bot.rating + Math.floor(rand(80) + 20);
  const streak = Math.floor(rand(7)) + 2;
  return { games, wins, draws, losses, peak, streak };
}

export default function BotProfile() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const bot = botId ? getBotById(botId) : undefined;

  if (!bot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Bot not found.</p>
          <Button variant="ghost" onClick={() => navigate("/play")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Play
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = botSeededStats(bot);
  const winRatePct = Math.round((stats.wins / stats.games) * 100);
  const title = getTitle(bot.rating, "bot");
  const nextTitle = getNextTitle(bot.rating, "bot");
  const progress = getTitleProgress(bot.rating, "bot");
  const rank = getRank(bot.rating);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 glass-border"
          >
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-4xl shadow-glow shrink-0">
                {bot.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-foreground truncate">{bot.name}</h1>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Bot className="h-3 w-3" /> BOT
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <TitleBadge rating={bot.rating} mode="bot" size="sm" hideUnranked={false} />
                  <RankBadge rating={bot.rating} size="sm" />
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    {bot.countryFlag} {bot.country}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">"{bot.bio}"</p>
              </div>
            </div>

            {/* Rating block */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
                <p className="font-mono text-3xl font-bold text-primary drop-shadow-glow">{bot.rating}</p>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Peak Rating</p>
                <p className="font-mono text-3xl font-bold text-accent">{stats.peak}</p>
              </div>
            </div>

            {/* Title progress */}
            {nextTitle && (
              <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Next title</span>
                  <span className={`font-bold ${nextTitle.color}`}>
                    {nextTitle.icon} {nextTitle.label}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  {bot.rating} / {nextTitle.minRating}
                </p>
              </div>
            )}
          </motion.div>

          {/* Playstyle */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-4">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Playstyle
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/15 text-primary border-primary/30 capitalize">{bot.playstyle}</Badge>
              <Badge variant="outline" className="capitalize">{bot.personality}</Badge>
              <Badge variant="outline">{bot.style}</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Games", value: stats.games, icon: Swords },
              { label: "Wins", value: stats.wins, icon: Trophy },
              { label: "Win Rate", value: `${winRatePct}%`, icon: TrendingUp },
              { label: "Streak", value: `🔥 ${stats.streak}`, icon: Target },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card/80 p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-mono text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Win/Loss/Draw distribution */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-4">
            <h3 className="font-display text-sm font-semibold mb-3">Career record</h3>
            <div className="flex h-3 rounded-full overflow-hidden mb-2">
              <div className="bg-primary" style={{ width: `${(stats.wins / stats.games) * 100}%` }} />
              <div className="bg-muted" style={{ width: `${(stats.draws / stats.games) * 100}%` }} />
              <div className="bg-destructive/70" style={{ width: `${(stats.losses / stats.games) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>🏆 {stats.wins} W</span>
              <span>🤝 {stats.draws} D</span>
              <span>💀 {stats.losses} L</span>
            </div>
          </div>

          {/* Openings */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-4">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Opening repertoire
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {bot.openings.map((o) => (
                <Badge key={o} variant="outline" className="capitalize text-[11px]">
                  {o.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link to={`/play?bot=${bot.id}`} className="block">
            <Button className="w-full" size="lg">
              <Swords className="h-4 w-4 mr-2" /> Challenge {bot.name}
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
