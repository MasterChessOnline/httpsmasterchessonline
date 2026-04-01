import { Crown, BookOpen, Users, Target, Youtube, Trophy, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => (
  <div className="min-h-screen bg-background grid-bg flex flex-col">
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
            MasterChessOnline is the home of <span className="font-semibold text-foreground">DailyChess_12</span> — a chess learning platform built by a passionate instructor who believes every player deserves access to quality lessons, free tournaments, and a welcoming community.
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
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DailyChess_12 Teaching Method */}
      <section className="pb-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold font-display">
              The DailyChess_12 Method
            </h2>
            <p className="text-muted-foreground">
              A structured approach to chess improvement, refined through thousands of hours of teaching.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, title: "Pattern Recognition", desc: "Every lesson starts with real-game positions. You learn to spot tactical and strategic patterns that repeat across all levels of play — from club games to grandmaster battles." },
              { icon: Trophy, title: "Competitive Practice", desc: "Theory alone doesn't make you stronger. Our free daily and weekly tournaments give you the arena to test what you've learned under real time pressure." },
              { icon: Youtube, title: "Video Deep-Dives", desc: "The DailyChess_12 YouTube channel features game breakdowns, opening guides, and endgame technique — all explained in plain language with interactive board examples." },
              { icon: Target, title: "AI-Powered Feedback", desc: "After every game, our AI analyzes your moves, identifies blunders and missed tactics, and gives you a personalized improvement plan — so you always know what to work on next." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
                <Icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold font-display">Ready to improve your chess?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/play">
              <Button size="lg">Play Now</Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline">Start Learning</Button>
            </Link>
            <a href="https://www.youtube.com/@DailyChess_12" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                <Youtube className="h-4 w-4" /> YouTube
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
