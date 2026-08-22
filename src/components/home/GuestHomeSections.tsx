/**
 * The whole below-the-fold homepage for a first-time visitor (typically an
 * Instagram ad click).
 *
 * Rule from the growth brief: five short sections, one message each, and every
 * one of them pushes the same single action — Create Free Account. No feature
 * walls, no 25 sections, no invented player counts.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Trophy, Coins, Users, Crown, ChevronRight, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackSignupCta } from "@/lib/funnel";
import { SHOP_ITEMS } from "@/lib/shop-data";

interface TopPlayer {
  user_id: string;
  display_name: string | null;
  rating: number;
}

const WHY = [
  {
    icon: Swords,
    title: "Play",
    body: "Play online against other players — or against 9 bots while you warm up.",
  },
  {
    icon: Trophy,
    title: "Compete",
    body: "Rated games, a real leaderboard and free tournaments every day.",
  },
  {
    icon: Coins,
    title: "Earn",
    body: "Win coins for playing and use them to customise boards, pieces and your profile.",
  },
];

const FEATURED_SHOP = ["board:cosmic_nebula", "pieces:celestial", "pieces:dragon", "board:aurora_borealis"];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SignupButton({ where, label = "Create Free Account" }: { where: string; label?: string }) {
  return (
    <Link to="/signup" onClick={() => trackSignupCta(where)} className="w-full sm:w-auto">
      <Button
        size="lg"
        className="ripple-btn w-full sm:w-auto h-14 px-10 font-display text-base uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl shadow-[0_0_60px_-14px_hsl(150_80%_45%/0.9)]"
      >
        <Crown className="mr-2 h-5 w-5" /> {label}
      </Button>
    </Link>
  );
}

export default function GuestHomeSections({ topPlayers }: { topPlayers: TopPlayer[] }) {
  const shopItems = FEATURED_SHOP
    .map((key) => SHOP_ITEMS.find((i) => i.key === key))
    .filter((i): i is (typeof SHOP_ITEMS)[number] => Boolean(i))
    .slice(0, 4);

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-20 space-y-16">
      {/* ── WHY MASTERCHESS — exactly three things ── */}
      <section aria-labelledby="why-mc">
        <Reveal>
          <h2 id="why-mc" className="text-center font-display text-xl sm:text-2xl font-bold uppercase tracking-widest">
            Why MasterChess?
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border/30 bg-card/60 p-5 text-center transition-colors hover:border-primary/40">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                  <w.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COMPETE — leaderboard preview (only if real players exist) ── */}
      {topPlayers.length > 0 && (
        <section aria-labelledby="compete-mc">
          <Reveal>
            <div className="flex items-center justify-between">
              <h2 id="compete-mc" className="font-display text-lg sm:text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Top Players
              </h2>
              <Link to="/leaderboard" className="flex items-center text-xs font-semibold text-primary hover:underline">
                Full leaderboard <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-4 space-y-2">
            {topPlayers.slice(0, 3).map((p, i) => (
              <Reveal key={p.user_id} delay={i * 0.06}>
                <div className="flex items-center gap-3 rounded-xl border border-border/25 bg-card/50 p-3.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? "border border-primary/30 bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? <Crown className="h-4 w-4" /> : `#${i + 1}`}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {p.display_name || "Anonymous"}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── EARN & CUSTOMIZE — coins have a visible purpose ── */}
      <section aria-labelledby="earn-mc">
        <Reveal>
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6">
            <h2 id="earn-mc" className="font-display text-lg sm:text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Earn &amp; Customise
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              New accounts start with <strong className="text-primary">500 free coins</strong>. Coins are not money —
              you win them by playing and spend them on boards, piece sets and profile looks.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {shopItems.map((item) => (
                <div key={item.key} className="rounded-xl border border-border/25 bg-background/40 p-3 text-center">
                  <div className="text-2xl">{item.preview}</div>
                  <div className="mt-1 truncate text-[11px] font-semibold text-foreground">{item.name}</div>
                  <div className="text-[10px] text-primary">{item.price} coins</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <SignupButton where="home_earn" label="Claim 500 Coins" />
              <Link to="/shop" className="text-xs font-semibold text-muted-foreground hover:text-primary">
                Browse the shop
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── INVITE FRIENDS — growth loop, stated simply ── */}
      <section aria-labelledby="invite-mc">
        <Reveal>
          <div className="rounded-2xl border border-border/30 bg-card/60 p-6 text-center">
            <Users className="mx-auto mb-3 h-6 w-6 text-primary" />
            <h2 id="invite-mc" className="font-display text-lg font-bold uppercase tracking-widest">
              Invite a friend
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Chess is better with someone you know. Make an account, share your link and you both earn coins.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FINAL CTA — the same one action as the first screen ── */}
      <section aria-labelledby="final-cta">
        <Reveal>
          <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/12 via-card to-card p-8 text-center">
            <h2 id="final-cta" className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Ready for your first game?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Free account, 10 seconds, no card. Then you are straight into a live game.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <SignupButton where="home_final" />
              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Gift className="h-3.5 w-3.5 text-emerald-400" /> 500 free coins</span>
                <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Free to join</span>
                <span className="inline-flex items-center gap-1.5"><Swords className="h-3.5 w-3.5 text-emerald-400" /> Play online</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-foreground hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
