import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Crown, Swords, Award, Sparkles, Share2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BeatNikola() {
  const url = "https://masterchess.live/beat-nikola";
  const title = "Beat the Founder — Defeat 13-year-old Nikola at Chess | MasterChess";
  const desc =
    "MasterChess was built by Nikola, a 13-year-old chess player from Serbia. Beat him in a rated online game and unlock the official 'Founder Slayer' certificate.";

  const handleShare = async () => {
    const shareData = {
      title: "I'm challenging the 13-year-old founder of MasterChess",
      text: "Think you can beat a 13-year-old at chess? Try me on MasterChess.",
      url,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch {/* ignore */}
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: desc,
          author: { "@type": "Person", name: "Nikola", description: "13-year-old founder of MasterChess" },
          publisher: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live" },
          mainEntityOfPage: url,
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Who is Nikola?",
              acceptedAnswer: { "@type": "Answer", text: "Nikola is the 13-year-old founder of MasterChess, a free chess platform built in Serbia." } },
            { "@type": "Question", name: "How do I beat the founder?",
              acceptedAnswer: { "@type": "Answer", text: "Create a free MasterChess account, challenge Nikola directly through Quick Match or a direct challenge link, and win the game." } },
            { "@type": "Question", name: "What do I get for winning?",
              acceptedAnswer: { "@type": "Answer", text: "A personalised 'Founder Slayer' certificate (PNG) you can share on social media, plus a permanent badge on your MasterChess profile." } },
          ],
        })}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" /> The Founder Challenge
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            Can you beat a{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
              13-year-old
            </span>{" "}
            at chess?
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg">
            MasterChess was built by Nikola — a 13-year-old player from Serbia.
            Defeat him in a rated game and unlock the official <b className="text-yellow-300">Founder Slayer</b> certificate.
          </p>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Link to="/play/online?tc=blitz">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition">
              <Swords className="w-4 h-4" /> Challenge Nikola now
            </button>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-yellow-500/20 text-yellow-200 font-medium transition"
          >
            <Share2 className="w-4 h-4" /> Share the challenge
          </button>
        </div>

        {/* Certificate preview */}
        <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-zinc-900 to-zinc-900 p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-yellow-500/30 text-xs uppercase tracking-widest">Certificate · Preview</div>
          <div className="text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-2">Official Recognition</div>
            <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-2">
              Founder Slayer
            </div>
            <p className="text-zinc-400 max-w-xl mx-auto mb-6 text-sm">
              Awarded to players who defeat Nikola, founder of MasterChess, in a rated online game.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Award className="w-3 h-3 text-yellow-500" />
              Auto-generated PNG · shareable on Instagram, X, WhatsApp
            </div>
          </div>
        </div>

        {/* How it works */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { n: 1, t: "Sign up free", d: "Create your MasterChess account in 30 seconds. No credit card." },
            { n: 2, t: "Challenge Nikola", d: "Find @nikola in Quick Match, or send a direct challenge link." },
            { n: 3, t: "Win → claim certificate", d: "Beat him in a rated game and the certificate is auto-generated for sharing." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-5">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-300 font-bold text-sm mb-3">
                {s.n}
              </div>
              <div className="font-semibold mb-1">{s.t}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8 mb-10">
          <h2 className="text-xl font-semibold mb-3">Who is Nikola?</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            Nikola is a 13-year-old chess player from Serbia who got tired of cluttered chess sites with pop-ups and paywalls — so he started building his own.
            MasterChess is the result: a free, ad-free, no-nonsense place to play chess, learn, and meet other players.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            He plays on the platform every day. Beat him and you get bragging rights — plus a real, shareable certificate.
          </p>
        </section>

        {/* Footer CTA */}
        <div className="text-center">
          <Link to="/play/online" className="inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200 text-sm font-medium">
            Start playing now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
