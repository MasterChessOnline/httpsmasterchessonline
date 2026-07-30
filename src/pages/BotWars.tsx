import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Swords, Quote } from "lucide-react";
import { BOT_PROFILES } from "@/lib/bot-profiles";

const BANDS = [
  { id: "all", label: "All" },
  { id: "rookie", label: "Under 1000" },
  { id: "club", label: "1000–1600" },
  { id: "strong", label: "1600–2200" },
  { id: "elite", label: "2200+" },
] as const;

function band(rating: number) {
  if (rating < 1000) return "rookie";
  if (rating < 1600) return "club";
  if (rating < 2200) return "strong";
  return "elite";
}

export default function BotWars() {
  const [filter, setFilter] = useState<(typeof BANDS)[number]["id"]>("all");

  const bots = useMemo(() => {
    const list = [...BOT_PROFILES].sort((a, b) => a.rating - b.rating);
    return filter === "all" ? list : list.filter((b) => band(b.rating) === filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Bot Wars — ${BOT_PROFILES.length} Chess Bots With Actual Personalities | MasterChess`}
        description="Every MasterChess bot has a rating, a playing style and a mouth. Pick your rival from beginners to the 3500-rated creator clone, and see what they say when they beat you."
        path="/bot-wars"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            <Swords className="h-3 w-3" /> Bot Wars
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-3">
            {BOT_PROFILES.length} bots. <span className="text-primary">All of them talk.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Other sites give you a difficulty slider. We give you opponents with a style, a
            repertoire, a blunder rate and something to say when they take your queen.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {BANDS.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={filter === b.id ? "default" : "outline"}
              onClick={() => setFilter(b.id)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot, i) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
            >
              <Card className="p-5 h-full flex flex-col border-primary/20 bg-card/70 backdrop-blur">
                <div className="flex items-center gap-3">
                  {bot.avatar.includes("/") ? (
                    <img
                      src={bot.avatar}
                      alt={`${bot.name} chess bot avatar`}
                      loading="lazy"
                      className="h-12 w-12 rounded-full object-cover border border-primary/30 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {bot.avatar}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold truncate">
                      {bot.countryFlag} {bot.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{bot.style}</div>
                  </div>
                  <Badge variant="outline" className="ml-auto shrink-0 border-primary/40 text-primary">
                    {bot.rating}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{bot.bio}</p>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Quote className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs italic">{bot.taunts.onWin}</span>
                </div>

                <Button asChild size="sm" className="mt-4 w-full">
                  <Link to={`/bot/${bot.id}`}>Challenge {bot.name.split(" ")[0]}</Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-10 p-7 border-primary/30 bg-primary/5 text-center">
          <h2 className="font-display text-2xl font-black mb-2">Think you can beat the boss?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            The creator clone is rated 3500 and never accepts a draw. Nobody has taken it down yet.
          </p>
          <Button asChild size="lg">
            <Link to="/beat-nikola">Face the 3500 bot</Link>
          </Button>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
