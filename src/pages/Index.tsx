import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrakusHeroBanner from "@/components/BrakusHeroBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Crown, Play, Swords, Trophy, GraduationCap, Users, Zap, ArrowRight } from "lucide-react";

const quickLinks = [
  { to: "/play-guest", title: "Play instantly", text: "Start a chess game now — no waiting.", icon: Play },
  { to: "/play", title: "Play bots", text: "Train against MasterChess bots.", icon: Swords },
  { to: "/learn", title: "Learn chess", text: "Lessons, openings and puzzles.", icon: GraduationCap },
  { to: "/dragan-brakus", title: "DB Chess Cup", text: "Official 5 July 2026 tournament.", icon: Trophy },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-entry-ready="home">
      <Seo
        title="MasterChess — Play Free Online Chess"
        description="Play free online chess on MasterChess: instant games, bots, training and the DB Chess Cup tournament."
        path="/"
        type="website"
      />
      <Navbar />
      <BrakusHeroBanner />

      <main className="relative overflow-hidden">
        <section className="relative px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.18),transparent_34%),radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.2))]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/10 shadow-[0_0_55px_-12px_rgba(250,204,21,0.9)]">
              <Crown className="h-9 w-9 text-amber-300" />
            </div>

            <h1 className="font-display text-[clamp(3rem,13vw,8rem)] font-black uppercase leading-[0.88] tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-700 bg-clip-text text-transparent">
                Master
              </span>
              <span className="text-foreground">Chess</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-xl text-muted-foreground">
              Fast entry. Real chess. Play online, train with bots, and join the DB Chess Cup.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 w-full max-w-xs bg-amber-400 text-black hover:bg-amber-300 sm:w-auto">
                <Link to="/play-guest">
                  <Play className="mr-2 h-5 w-5 fill-current" /> Play Online
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 w-full max-w-xs sm:w-auto">
                <Link to="/play">
                  <Swords className="mr-2 h-5 w-5" /> vs Bots
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-14 w-full max-w-xs sm:w-auto">
                <Link to="/dragan-brakus/register">
                  <Trophy className="mr-2 h-5 w-5" /> Register DB Cup
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">No blocking splash</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Mobile fast</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Offline-safe entry</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <Card className="h-full border-white/10 bg-card/70 p-5 transition hover:border-amber-300/40 hover:bg-card">
                  <item.icon className="mb-4 h-6 w-6 text-amber-300" />
                  <h2 className="font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-amber-300">
                    Open <ArrowRight className="ml-1 h-3 w-3 transition group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-6 overflow-hidden border-amber-300/25 bg-gradient-to-br from-amber-400/12 via-card to-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
                  <Users className="h-4 w-4" /> Tournament registration is open
                </div>
                <h2 className="mt-2 text-2xl font-bold">DB Chess Cup · 5 July 2026 · 17:00 CEST</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your optional FIDE ID or just type your name. After registration you appear on the live standings list.
                </p>
              </div>
              <Button asChild className="bg-amber-400 text-black hover:bg-amber-300">
                <Link to="/dragan-brakus/register">
                  <Zap className="mr-2 h-4 w-4" /> Register Now
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
