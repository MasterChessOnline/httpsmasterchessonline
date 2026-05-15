import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Crown } from "lucide-react";
import { GUIDES } from "@/lib/guides-content";

export default function Guide() {
  const { slug = "" } = useParams();
  const guide = GUIDES[slug];
  if (!guide) return <Navigate to="/guides" replace />;

  const url = `https://masterchess.live/guide/${slug}`;
  return (
    <>
      <Helmet>
        <title>{guide.title} | MasterChess Guide</title>
        <meta name="description" content={guide.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          author: { "@type": "Organization", name: "MasterChess" },
          publisher: { "@type": "Organization", name: "MasterChess", logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" } },
          mainEntityOfPage: url,
          datePublished: "2026-01-01",
          dateModified: new Date().toISOString().slice(0, 10),
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-10 md:py-16">
        <article className="max-w-3xl mx-auto">
          <Link to="/guides" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300 mb-6">
            <ArrowLeft className="h-4 w-4" /> All guides
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent leading-tight"
          >
            {guide.title}
          </motion.h1>
          <p className="text-zinc-400 mt-3 text-lg">{guide.description}</p>

          <div className="prose prose-invert prose-amber max-w-none mt-8 prose-headings:text-amber-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-amber-200 prose-a:text-amber-300">
            {guide.sections.map((s, i) => (
              <section key={i}>
                <h2>{s.heading}</h2>
                {s.body.split("\n\n").map((p, j) => <p key={j}>{p}</p>)}
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 text-center">
            <h3 className="text-xl font-semibold text-amber-100 mb-3">Ready to play?</h3>
            <p className="text-zinc-400 mb-4">Apply this immediately against real players.</p>
            <Link
              to="/play/online"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              <Crown className="h-4 w-4" /> Play Online Now
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
