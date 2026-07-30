import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tv, Users, Clock, Trophy, Flame } from "lucide-react";

const RULES = [
  { icon: Users, title: "8 players, 12–16 years old", desc: "Selected from applications. No rating minimum — personality counts as much as strength." },
  { icon: Clock, title: "One match per day, 30 days", desc: "Every day one player is eliminated. Every match is filmed and cut into short clips." },
  { icon: Flame, title: "The audience votes", desc: "Viewers vote daily for the play of the day — and for the villain of the day." },
  { icon: Trophy, title: "Last one standing", desc: "The survivor takes the prize and a permanent place in the MasterChess hall of fame." },
];

export default function Successors() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="The Successors — A 30-Day Chess Reality Series | MasterChess"
        description="Eight teenagers. Thirty days. One eliminated every day. The Successors is a chess reality series where the drama is the point. Apply to compete or follow the daily episodes."
        path="/successors"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Badge className="mb-4">Coming after the Dragan Brakus Cup</Badge>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-4 ml-2">
            <Tv className="h-3 w-3" /> Season 1
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-4">
            The <span className="text-primary">Successors</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Eight teenagers. Thirty days. One goes home every single day. The camera does not
            follow the moves — it follows the faces.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {RULES.map((r) => (
            <Card key={r.title} className="p-5 border-primary/20 bg-card/70 backdrop-blur">
              <r.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-bold">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            </Card>
          ))}
        </div>

        <Card className="p-7 border-primary/20 bg-card/70 backdrop-blur mb-8">
          <h2 className="font-display text-2xl font-black mb-3">Why this exists</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Chess broadcasts are built for people who already love chess. Boards, arrows,
              evaluation bars, a commentator saying "interesting". Nobody who does not play
              chess has ever watched that twice.
            </p>
            <p>
              The Successors is the opposite. You will not need to understand the Sicilian to
              care who wins — you will care because you know who cried after round four and
              who refused to shake hands in round nine.
            </p>
            <p className="text-foreground font-semibold">
              That is how a game becomes a sport people watch.
            </p>
          </div>
        </Card>

        <Card className="p-7 border-primary/30 bg-primary/5 text-center">
          <h2 className="font-display text-2xl font-black mb-2">Want to be one of the eight?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Applications open with the first season. Play a rated game today so we can see you
            in the standings when we pick.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/ranked">Play rated now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Tell us why it should be you</Link>
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
