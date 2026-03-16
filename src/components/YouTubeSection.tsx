import { Youtube, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const YouTubeSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-red-500/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-red-400 uppercase mb-4">
              <Youtube className="h-4 w-4" />
              YouTube Channel
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Watch & Learn with <span className="text-gradient-gold">DailyChess_12</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Free chess tutorials, opening guides, endgame lessons, and game analysis on YouTube.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <ScrollReveal direction="left">
              <div className="relative group">
                <div className="absolute -inset-3 rounded-2xl bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-all duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-card aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed?listType=user_uploads&list=DailyChess_12"
                    title="DailyChess_12 YouTube Channel"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.15}>
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 mb-6">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-400">DailyChess_12</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Your Chess Coach on YouTube
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  DailyChess_12 creates high-quality chess content for players of all levels. From opening theory to endgame mastery.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                  {["Opening guides & repertoire building", "Tactical puzzles & pattern recognition", "Game analysis & endgame technique"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="https://www.youtube.com/@DailyChess_12" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 hover:scale-105 text-white font-semibold group transition-transform duration-200">
                    <Youtube className="mr-2 h-5 w-5" />
                    Visit the YouTube Channel
                    <ExternalLink className="ml-2 h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
