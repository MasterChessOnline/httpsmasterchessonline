import { useMemo, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe2,
  Zap,
  Users,
  Trophy,
  Crown,
  Swords,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO_CITIES, findCityBySlug } from "@/lib/seo-cities";

/**
 * /play-from/:city — programmatic long-tail SEO landing page.
 * Targets "play chess online from {city}" / "free chess {city}" / "chess players {city}".
 * One page per city in SEO_CITIES (~40 indexable pages, unique copy each).
 */
export default function PlayFromCity() {
  const { city: slug = "" } = useParams<{ city: string }>();
  const city = useMemo(() => findCityBySlug(slug), [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!city) return <Navigate to="/play" replace />;

  const title = `Play Chess Online from ${city.city} ${city.flag} — Free, No Ads | MasterChess`;
  const description = `Play chess online from ${city.city}, ${city.country} — free, no ads, no signup needed. Match with players worldwide in 5 seconds. Bullet, Blitz, Rapid & Classical time controls.`;
  const canonical = `https://masterchess.live/play-from/${city.slug}`;

  const nearby = SEO_CITIES
    .filter((c) => c.region === city.region && c.slug !== city.slug)
    .slice(0, 6);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://masterchess.live/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": title,
          "description": description,
          "url": canonical,
          "about": {
            "@type": "Place",
            "name": city.city,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": city.city,
              "addressCountry": city.countryCode,
            },
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "MasterChess",
            "url": "https://masterchess.live",
          },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "MasterChess", "item": "https://masterchess.live" },
            { "@type": "ListItem", "position": 2, "name": "Play from cities", "item": "https://masterchess.live/play" },
            { "@type": "ListItem", "position": 3, "name": city.city, "item": canonical },
          ],
        })}</script>
      </Helmet>

      <main className="min-h-screen px-4 py-10 md:py-16 bg-background">
        <article className="max-w-4xl mx-auto space-y-10">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-widest text-primary">
              <MapPin className="h-3 w-3" /> {city.country}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              Play Chess Online from <span className="text-primary">{city.city}</span> {city.flag}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              {city.tagline}. Join MasterChess — free, no ads, real human play only. Match in 5 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Link to="/play/online">
                  <Swords className="mr-2 h-4 w-4" /> Play Now — Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/play-guest">
                  Play as Guest <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.header>

          {/* Why MasterChess for this city */}
          <section className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, title: "Match in 5 seconds", body: `Whether you're in central ${city.city} or the suburbs, our matchmaker finds an opponent worldwide instantly.` },
              { icon: Users, title: "Real human play only", body: `No AI assistance, no engine eval bars. Just authentic chess with players from ${city.country} and beyond.` },
              { icon: Trophy, title: "Bullet to Classical", body: "13 time controls. Daily tournaments, ELO ratings, and free game review after every match." },
              { icon: Crown, title: "Always free, no ads", body: "No paywalls. No tracking pixels. Built for players who just want to play chess." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition-colors"
              >
                <f.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </section>

          {/* Local context */}
          <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Chess in {city.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {city.city} has a long-standing chess tradition. From over-the-board tournaments at local
              clubs to weekend blitz in parks and cafés, players in {city.country} have always been part
              of the global chess community. MasterChess brings that tradition online — whether you want
              a quick bullet game on your phone during a commute, a serious rapid game in the evening,
              or a classical tournament on the weekend, you'll find opponents around your level in seconds.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              No installation, no signup gate. Open the site, hit <strong className="text-foreground">Play Now</strong>,
              and you're playing. If you want to keep your rating and history, sign up takes one click with Google.
            </p>
          </section>

          {/* Time controls */}
          <section>
            <h2 className="font-display text-xl md:text-2xl font-bold mb-4">
              Pick your time control
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Bullet", time: "1+0 · 2+1", color: "from-red-500/20 to-red-500/5" },
                { name: "Blitz", time: "3+0 · 5+0", color: "from-orange-500/20 to-orange-500/5" },
                { name: "Rapid", time: "10+0 · 15+10", color: "from-emerald-500/20 to-emerald-500/5" },
                { name: "Classical", time: "30+0 · 60+0", color: "from-sky-500/20 to-sky-500/5" },
              ].map((tc) => (
                <Link
                  key={tc.name}
                  to="/play/online"
                  className={`rounded-xl border border-border/60 bg-gradient-to-br ${tc.color} p-4 hover:border-primary/50 transition-all hover:scale-[1.02]`}
                >
                  <div className="font-bold">{tc.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tc.time}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Nearby cities */}
          {nearby.length > 0 && (
            <section>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" />
                More cities in {city.region === "Balkans" ? "the Balkans" : city.region}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nearby.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/play-from/${c.slug}`}
                    className="rounded-lg border border-border/60 bg-card/40 px-3 py-2 hover:border-primary/40 hover:bg-card/70 transition-colors text-sm flex items-center gap-2"
                  >
                    <span>{c.flag}</span>
                    <span className="font-medium">{c.city}</span>
                    <span className="text-muted-foreground text-xs ml-auto truncate">{c.country}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <section className="text-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Ready to play from {city.city}?
            </h2>
            <p className="text-muted-foreground mb-5">
              Free forever. No ads. Real players. Start a game in 5 seconds.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/play/online">
                Play Chess Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </article>
      </main>
    </>
  );
}
