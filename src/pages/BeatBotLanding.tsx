import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Swords, Target, Zap, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOT_PROFILES, getBotById } from "@/lib/bots/profiles";

/**
 * /beat/:botId — long-tail SEO landing page targeting
 *  "how to beat {bot name} chess" / "{bot name} strategy".
 *  One page per bot in BOT_PROFILES = ~24 indexable pages with unique copy.
 */
export default function BeatBotLanding() {
  const { botId = "" } = useParams<{ botId: string }>();
  const bot = useMemo(() => getBotById(botId), [botId]);

  if (!bot) return <Navigate to="/play" replace />;

  const tier =
    bot.rating < 800 ? "beginner"
    : bot.rating < 1400 ? "intermediate"
    : bot.rating < 1800 ? "advanced"
    : "expert";

  const tips: Array<{ icon: any; title: string; body: string }> = (() => {
    const base = [
      {
        icon: BookOpen,
        title: `Exploit ${bot.name}'s opening repertoire`,
        body: `${bot.name} follows ${bot.openings?.[0] ?? "mainline"} systems for ${bot.bookDepth} plies. Steer the game into structures outside that book and ${bot.name} will leave theory and weaken.`,
      },
      {
        icon: Target,
        title: `Punish the ${bot.playstyle} style`,
        body: `${bot.name} plays ${bot.playstyle}. Counter it: trade off active pieces if they're aggressive, open the position if they're closed, simplify into an endgame if they're tactical.`,
      },
      {
        icon: Zap,
        title: `Provoke blunders (rate: ${(bot.blunderRate * 100).toFixed(0)}%)`,
        body: `${bot.name} blunders roughly every ${Math.max(1, Math.round(1 / Math.max(0.02, bot.blunderRate)))} moves. Maintain tactical tension — pins, forks, discovered checks — and one will land.`,
      },
      {
        icon: ShieldCheck,
        title: tier === "expert"
          ? "Survive first, win the endgame"
          : "Play patient, solid moves",
        body: tier === "expert"
          ? `Against a ${bot.rating}-rated opponent, don't try to outcalculate them. Trade pieces when ahead in material, head to an endgame, and convert with king activity.`
          : `${bot.name} (${bot.rating}) rewards calm play. Develop pieces, castle early, control the center, and wait for the bot to make a mistake instead of forcing one.`,
      },
    ];
    return base;
  })();

  const title = `How to Beat ${bot.name} in Chess (${bot.rating} ELO) | MasterChess`;
  const description = `${bot.name} is a ${bot.rating}-rated chess bot with a ${bot.playstyle} style. Learn 4 concrete strategies to beat ${bot.name} — opening prep, mid-game tactics, and endgame plans.`;
  const canonical = `https://masterchess.live/beat/${bot.id}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": `How to beat ${bot.name} in chess`,
          "description": description,
          "step": tips.map((t) => ({ "@type": "HowToStep", "name": t.title, "text": t.body })),
        })}</script>
      </Helmet>

      <main className="min-h-screen px-4 py-10 md:py-16">
        <article className="max-w-3xl mx-auto space-y-8">
          <header className="text-center space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Strategy Guide</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              How to Beat <span className="text-gradient-gold">{bot.name}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              {bot.rating} ELO · {bot.playstyle} style · {bot.country}{" "}
              {bot.countryFlag}
            </p>
          </header>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={bot.avatar}
                alt={`${bot.name} chess bot avatar`}
                className="h-16 w-16 rounded-full border border-primary/30 object-cover"
              />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">{bot.name}</h2>
                <p className="text-xs text-muted-foreground">{bot.bio}</p>
              </div>
            </div>
          </motion.section>

          <section className="space-y-4">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              4 strategies that work against {bot.name}
            </h2>
            <ol className="space-y-3">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/40 p-4 flex gap-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <tip.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-foreground text-sm md:text-base">
                      {i + 1}. {tip.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center space-y-4">
            <Swords className="h-8 w-8 text-primary mx-auto" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Ready to challenge {bot.name}?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Free, no signup required. Apply these strategies in your next game.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to={`/bot/${bot.id}`}>
                <Button size="lg" className="font-display font-bold uppercase tracking-wider">
                  Play {bot.name} now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/play">
                <Button variant="outline" size="lg">
                  Choose a different bot
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-base font-bold text-foreground">Beat other bots</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BOT_PROFILES.filter((b) => b.id !== bot.id)
                .slice(0, 9)
                .map((b) => (
                  <Link
                    key={b.id}
                    to={`/beat/${b.id}`}
                    className="rounded-lg border border-border/40 bg-card/30 hover:bg-card/60 transition-colors px-3 py-2 text-xs"
                  >
                    <span className="font-display font-bold text-foreground">{b.name}</span>
                    <span className="text-muted-foreground"> · {b.rating}</span>
                  </Link>
                ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
