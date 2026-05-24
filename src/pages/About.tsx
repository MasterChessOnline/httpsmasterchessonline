import Seo from "@/components/Seo";
import { Crown, BookOpen, Users, Target, Trophy, GraduationCap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => (
  <div className="min-h-screen bg-background grid-bg flex flex-col">
    <Seo title={"About MasterChessOnline — built by Nikola Šakotić, age 13"} description={"MasterChess is a chess platform handcrafted by Nikola Šakotić, a 13-year-old chess player from Serbia. Free lessons, tournaments and a welcoming community."} path="/about" type="website" />
    <Navbar />
    <main className="flex-1">
      {/* Hero */}
      <section className="py-24 container mx-auto px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
            Master<span className="text-gradient-gold">Chess</span>Online
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            MasterChessOnline was handcrafted by <span className="font-semibold text-foreground">Nikola Šakotić</span>, a 13-year-old chess player from Serbia who believes every player deserves access to quality lessons, free tournaments, and a welcoming community.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="pb-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Our Mission", desc: "Make chess education accessible to everyone — from absolute beginners to aspiring masters." },
            { icon: Users, title: "Community First", desc: "Free daily tournaments, an active leaderboard, and a supportive environment for players of all levels." },
            { icon: GraduationCap, title: "Learn by Doing", desc: "Interactive lessons, AI-powered analysis, and real-game practice — not just theory." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm card-hover inner-glow h-full">
                <CardContent className="p-6 space-y-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Teaching Method */}
      <section className="pb-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold font-display">
              How I teach chess on MasterChess
            </h2>
            <p className="text-muted-foreground">
              A structured approach to chess improvement, shaped by my own years over the board.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, title: "Pattern Recognition", desc: "Every lesson starts with real-game positions. You learn to spot tactical and strategic patterns that repeat across all levels of play — from club games to grandmaster battles." },
              { icon: Trophy, title: "Competitive Practice", desc: "Theory alone doesn't make you stronger. Our free daily and weekly tournaments give you the arena to test what you've learned under real time pressure." },
              { icon: Brain, title: "Deep Analysis", desc: "Game breakdowns, opening guides, and endgame technique — explained in plain language with interactive board examples." },
              { icon: Target, title: "AI-Powered Feedback", desc: "After every game, our AI analyzes your moves, identifies blunders and missed tactics, and gives you a personalized improvement plan — so you always know what to work on next." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/30 card-hover"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who built this — the human behind the site */}
      <section className="pb-20 container mx-auto px-6">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative rounded-2xl border border-primary/20 px-7 py-9 sm:px-12 sm:py-12 backdrop-blur-md overflow-hidden"
            style={{
              background:
                "linear-gradient(140deg, hsl(40 25% 12% / 0.85) 0%, hsl(30 20% 8% / 0.85) 60%, hsl(35 22% 10% / 0.85) 100%)",
              boxShadow:
                "0 30px 60px -20px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(43 60% 70% / 0.06)",
            }}
          >
            <p className="font-hand text-primary/90 text-2xl sm:text-3xl leading-none mb-4 -rotate-1">
              who actually built this —
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
              A 13-year-old kid with a dream
            </h2>

            <div className="font-display text-foreground/90 text-[15px] sm:text-[17px] leading-relaxed space-y-4">
              <p>
                My name is Nikola Šakotić. I'm 13 years old, and I built this entire
                site by myself — no team, no investors, no studio. Just one laptop,
                a lot of late nights, and a stubborn idea that wouldn't let me sleep.
              </p>
              <p>
                Chess gave me a lot. Tournaments, friendships, the quiet thrill of a
                plan finally clicking on the board. I had real success playing, and at
                some point I started dreaming about building my own chess app — a place
                that feels the way the game actually feels when you love it. Not a
                product. A home.
              </p>
              <p>
                So I started. After school, on weekends, between homework and matches.
                Every page on this site, every animation, every clumsy first version
                that I rewrote three times — that was me, learning as I went. Some days
                things broke. Some days they were beautiful. Both kinds of days made
                this what it is.
              </p>
              <p>
                I'm not pretending to be a company. I'm a kid who loves chess and
                wanted other people who love chess to have somewhere good to play.
                If you're reading this, thank you — really. You're part of the dream now.
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="font-hand text-primary text-3xl sm:text-4xl leading-none">
                  Nikola
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  Nikola Šakotić · founder, age 13
                </p>
              </div>
              <a
                href="mailto:checkmatebros44@gmail.com"
                className="font-hand text-primary text-xl hover:text-primary/80 transition-colors"
              >
                checkmatebros44@gmail.com
              </a>
            </div>

            <p className="mt-6 font-hand text-muted-foreground/70 text-sm -rotate-1">
              p.s. if you spot a bug, it's mine. write to me — I'll fix it.
            </p>
          </div>
        </motion.div>
      </section>



      {/* CTA */}
      <section className="pb-24 container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold font-display">Ready to improve your chess?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/play">
              <Button size="lg" className="btn-neon">Play Now</Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline">Start Learning</Button>
            </Link>
            <Link to="/community">
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
