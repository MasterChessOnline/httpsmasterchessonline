import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flame, Swords, Users, ShieldCheck, Zap } from "lucide-react";

const PILLARS = [
  {
    icon: Zap,
    title: "Zero friction",
    text: "No signup wall, no popup, no ad. Click the board and you are playing in under three seconds.",
  },
  {
    icon: ShieldCheck,
    title: "No engine in human games",
    text: "No eval bar, no hints, no assistance while two humans fight. Chess is supposed to hurt a little.",
  },
  {
    icon: Users,
    title: "Local clubs first",
    text: "Every club, every coach, every school gets a free public page and free tournaments. Forever.",
  },
  {
    icon: Swords,
    title: "Built by a player, not a boardroom",
    text: "This site is built by a 13-year-old who plays. Every feature exists because a player wanted it.",
  },
];

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="The MasterChess Manifesto — Chess Belongs to Players"
        description="Chess got swallowed by giants. MasterChess is the counter-move: no ads, no engine in human games, free tools for every club. This is what we stand for."
        path="/manifesto"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-14 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-5">
            <Flame className="h-3 w-3" /> Manifesto
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            They took chess off the street.
            <br />
            <span className="text-primary">We are taking it back.</span>
          </h1>
        </motion.div>

        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Chess is the oldest open-source game on earth. Nobody owns the Sicilian. Nobody
            invoices you for a rook endgame. And yet somewhere along the way, playing a game
            of chess online started to mean accounts, ads, upsells, three paywalls and a
            popup asking you to rate the app.
          </p>
          <p className="text-foreground font-semibold">
            MasterChess exists because a 13-year-old got tired of that.
          </p>
          <p>
            Not a startup. Not a funding round. One player, one keyboard, and a very stubborn
            opinion: the board should load instantly, the game should be honest, and the
            local club down the street should get the same tools as the biggest federation
            in the world — for free.
          </p>
          <p>
            We are not trying to be the biggest chess site. We are trying to be the one you
            recommend to a friend without apologising first.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 my-12">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-5 h-full border-primary/20 bg-card/70 backdrop-blur">
                <p.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 font-bold">{p.title}</div>
                <p className="text-sm text-muted-foreground mt-1.5">{p.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="p-7 border-primary/30 bg-primary/5 text-center">
          <h2 className="font-display text-2xl font-black mb-2">
            You do not have to believe us. Just play one game.
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            No account needed. If it is not faster and cleaner than what you use today, close
            the tab and we deserved it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/play-guest">Play instantly</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/beat-nikola">Try to beat Nikola</Link>
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Want the tools for your club, school or stream?{" "}
          <Link to="/partners" className="text-primary underline underline-offset-4">
            Partner program
          </Link>{" "}
          ·{" "}
          <Link to="/streamers/apply" className="text-primary underline underline-offset-4">
            Creator program
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
