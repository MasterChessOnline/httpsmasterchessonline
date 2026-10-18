import Seo from "@/components/Seo";
import { Crown, Swords, Bot, BookOpen, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: Swords, title: "Online games", desc: "Play real people for free, or send a friend a link and start in seconds." },
  { icon: Bot, title: "Computer opponents", desc: "Bots from beginner to strong club level, each with a clear rating." },
  { icon: BookOpen, title: "Opening & endgame training", desc: "Interactive lines move by move, plus endgame drills checked against perfect play." },
];

const About = () => (
  <div className="min-h-screen bg-background grid-bg flex flex-col">
    <Seo
      title="About MasterChess — Meet the Founder, Nikola Šakotić"
      description="MasterChess is built by Nikola Šakotić, a 14-year-old chess player and developer from Serbia. Built by a chess player, made for chess players."
      path="/about"
      type="website"
    />
    <Navbar />
    <main className="flex-1">
      <section className="py-20 container mx-auto px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
            Meet the Founder of Master<span className="text-gradient-gold">Chess</span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-primary">
            Built by a chess player. Made for chess players.
          </p>
        </motion.div>
      </section>

      <section className="pb-16 container mx-auto px-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md px-7 py-9 sm:px-12 sm:py-12">
          <div className="text-foreground/90 text-[15px] sm:text-[17px] leading-relaxed space-y-4">
            <p>Hi, I'm <span className="font-semibold text-foreground">Nikola Šakotić</span>, a 14-year-old chess player and developer from Serbia.</p>
            <p>Chess has been a big part of my life. Playing tournaments taught me how much preparation, practice and determination matter. It also showed me how difficult it can be to find the right tools to study openings, improve your game and compete.</p>
            <p>That's why I started building MasterChess — a chess platform shaped by the needs of real players.</p>
            <p>My goal is simple: make it easier for anyone to play chess, train seriously and keep improving, without unnecessary barriers.</p>

            <h2 className="pt-4 font-display text-2xl font-bold text-foreground">More than a website</h2>
            <p>MasterChess brings together online games, computer opponents, interactive opening training and tools designed to help players develop their skills.</p>
            <p>I'm building it step by step, learning from real games and feedback from the community.</p>

            <h2 className="pt-4 font-display text-2xl font-bold text-foreground">Built in Serbia, for players everywhere</h2>
            <p>MasterChess is an independent project created in Serbia with a global chess community in mind.</p>
            <p>Whether you're learning your first opening or preparing for your next tournament, you're welcome here.</p>
            <p className="pt-2 font-semibold text-primary">Play a game. Learn something new. Keep improving.</p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="font-hand text-primary text-3xl sm:text-4xl leading-none">Nikola Šakotić</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Founder of MasterChess</p>
            </div>
            <a href="mailto:checkmatebros44@gmail.com" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail className="h-4 w-4" /> Questions or ideas? Write to me
            </a>
          </div>
        </div>
      </section>

      <section className="pb-16 container mx-auto px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/50 bg-card/50 h-full">
              <CardContent className="p-6 space-y-3">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-24 container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/play"><Button size="lg">Play Chess Now</Button></Link>
          <Link to="/learn"><Button size="lg" variant="outline">Explore Training</Button></Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
