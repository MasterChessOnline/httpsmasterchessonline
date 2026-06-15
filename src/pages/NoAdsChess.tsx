import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, X, Check, ArrowRight } from "lucide-react";

/**
 * SEO landing — targets "chess without ads", "free chess no signup",
 * "ad-free chess website", "best chess site no paywall".
 */
export default function NoAdsChess() {
  const url = "https://masterchess.live/no-ads-chess";

  const compare = [
    { feature: "No banner ads", mc: true, other: false },
    { feature: "No video ads between games", mc: true, other: false },
    { feature: "Free game analysis (Stockfish)", mc: true, other: false },
    { feature: "No paywall on lessons", mc: true, other: false },
    { feature: "No popups asking to upgrade", mc: true, other: false },
    { feature: "Play instantly without signup", mc: true, other: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-zinc-950 to-black text-foreground">
      <Helmet>
        <title>Ad-Free Chess Online — No Ads, No Paywall, No Signup | MasterChess</title>
        <meta
          name="description"
          content="MasterChess is the chess website with zero ads, zero paywalls, and instant play without signup. Free Stockfish analysis, daily tournaments, real human play."
        />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content="Ad-Free Chess Online — No Ads, No Paywall" />
        <meta
          property="og:description"
          content="The chess site with zero ads, zero paywalls, instant play. 100% player-funded."
        />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Ad-Free Chess Online — MasterChess",
          url,
          description:
            "MasterChess offers free online chess with no ads, no paywalls, and instant play. Stockfish analysis, daily tournaments, real human play.",
          isPartOf: { "@type": "WebSite", name: "MasterChess", url: "https://masterchess.live/" },
        })}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="h-3 w-3" /> Zero ads. Forever.
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
            Chess online,{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              without ads
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
            No banners. No video ads between games. No popups begging you to upgrade.
            MasterChess is 100% player-funded — you get the whole platform, free, clean, instantly.
          </p>

          <div className="mt-10 rounded-2xl border border-border/30 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] bg-amber-500/10 border-b border-border/30 px-4 py-3 text-xs uppercase tracking-widest font-bold">
              <div>Feature</div>
              <div className="text-emerald-300 px-4">MasterChess</div>
              <div className="text-zinc-500 px-4">Typical sites</div>
            </div>
            {compare.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_auto_auto] px-4 py-3 text-sm items-center ${
                  i % 2 ? "bg-muted/5" : ""
                }`}
              >
                <div>{row.feature}</div>
                <div className="px-4">
                  {row.mc ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <X className="h-5 w-5 text-zinc-600" />
                  )}
                </div>
                <div className="px-4">
                  {row.other ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <X className="h-5 w-5 text-rose-500/70" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/play-guest"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-bold shadow-lg hover:brightness-110 transition"
            >
              Play now (no signup) <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/built-by-a-kid"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/40 text-zinc-300 font-bold hover:bg-muted/10 transition"
            >
              Who built this?
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
