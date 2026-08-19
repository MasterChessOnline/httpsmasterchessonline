import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getLandingVariant, playNowHref } from "@/lib/landingVariants";
import { track } from "@/lib/track";

/**
 * FIRST-SCREEN HERO
 *
 * The only job of this block is to say what MasterChess is and put one
 * dominant PLAY NOW button above the fold on a phone. Copy comes from the
 * A/B variant table, so headlines and CTA labels can be swapped without
 * touching this layout.
 */
export default function HeroPlayNow({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const variant = getLandingVariant();
  const href = playNowHref(!!user);

  return (
    <section className={`px-5 pt-5 pb-4 text-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-xl"
      >
        <p className="font-display text-xs sm:text-sm font-bold tracking-[0.32em] text-primary/80">
          MASTERCHESS
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-5xl font-black leading-[1.05] tracking-tight text-foreground">
          {variant.headline}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          {variant.subheadline}
        </p>

        <div className="mt-5 flex flex-col items-center gap-2.5">
          <Link
            to={href}
            onClick={() =>
              track("play_now_click", {
                surface: "home-hero",
                variant: variant.key,
                signed_in: !!user,
              })
            }
            className="w-full sm:w-auto sm:min-w-[280px] rounded-2xl bg-primary px-8 py-4 font-display text-lg font-black tracking-wide text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            {variant.primaryCta}
          </Link>
          <Link
            to="/features"
            onClick={() => track("explore_click", { surface: "home-hero", variant: variant.key })}
            className="text-xs font-semibold tracking-wide text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {variant.secondaryCta}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
