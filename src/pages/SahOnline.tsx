import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Swords, Trophy, Brain, Sparkles, Zap, ShieldCheck, Users } from "lucide-react";

/** Serbian-language SEO + Google Ads landing for "igraj šah online".
 *  Keep copy 100% in Serbian Latin script. */
export default function SahOnline() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Igraj šah online besplatno — MasterChess"
        description="Besplatan šah online: igraj protiv prijatelja ili AI botova, ulazi u dnevne turnire i analiziraj partije sa Stockfish-om. Bez reklama, bez registracije za prvu partiju."
        path="/sah-online"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Kako da igram šah online besplatno?",
              acceptedAnswer: { "@type": "Answer", text: "Otvori MasterChess, klikni 'Igraj sada' i u par sekundi ulaziš u partiju protiv pravog igrača ili AI bota. Bez registracije za prvu partiju, bez reklama." } },
            { "@type": "Question", name: "Da li mogu da igram šah protiv kompjutera?",
              acceptedAnswer: { "@type": "Answer", text: "Da. MasterChess ima 9 različitih AI botova od 400 do 2000 ELO. Svaki bot ima drugačiji stil — agresivan, pozicioni, defanzivan." } },
            { "@type": "Question", name: "Da li je MasterChess besplatan?",
              acceptedAnswer: { "@type": "Answer", text: "Da. Sve osnovne funkcije — partije, turniri, analiza Stockfish-om, trening otvaranja — su 100% besplatne." } },
            { "@type": "Question", name: "Mogu li da igram sa prijateljem preko linka?",
              acceptedAnswer: { "@type": "Answer", text: "Da. Klikni 'Pozovi prijatelja', podesi vreme i podeli link na WhatsApp ili Telegram. Prijatelj otvara link i partija počinje — bez registracije." } }
          ]
        }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-5"
          >
            <Badge variant="outline" className="text-[11px] uppercase tracking-widest">
              <Sparkles className="h-3 w-3 mr-1.5 text-primary" /> 100% besplatno · Bez reklama
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Igraj šah online — <span className="text-primary">besplatno</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Pravi šah protiv pravih ljudi i AI botova. Dnevni turniri, analiza Stockfish-om,
              trening otvaranja. Bez registracije za prvu partiju.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="text-base">
                <Link to="/play-guest">Igraj sada</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/play">Igraj protiv bota</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Prva partija počinje za 5 sekundi.</p>
          </motion.div>
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">Zašto MasterChess?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Swords,       title: "Pravi protivnici",   text: "Igraj protiv stvarnih igrača iz regiona — nema lažnih brojača." },
            { icon: Brain,        title: "9 AI botova",        text: "Od 400 do 2000 ELO. Svaki bot ima jedinstven stil i ličnost." },
            { icon: Trophy,       title: "Dnevni turniri",     text: "Besplatni Arena i Swiss turniri, sa rejtingom i nagradama." },
            { icon: ShieldCheck,  title: "Fer igra",           text: "Nula tolerancije za varanje. Detekcija engine-a u realnom vremenu." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="bg-card/40 border-border/40">
                <CardContent className="p-5 space-y-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* MODES */}
      <section className="border-y border-border/30 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">Sve što ti treba za šah</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: "/play",         icon: Zap,    title: "Brza partija",     text: "Bullet, Blitz, Rapid — 13 vremenskih kontrola." },
              { to: "/tournaments",  icon: Trophy, title: "Turniri",          text: "Arena i Swiss formati, dnevno." },
              { to: "/openings",     icon: Crown,  title: "Trening otvaranja",text: "60+ poznatih otvaranja sa interaktivnom tablom." },
              { to: "/puzzles",      icon: Brain,  title: "Dnevna zagonetka", text: "Reši taktički problem dana i diži streak." },
              { to: "/battle-royale",icon: Swords, title: "Battle Royale",    text: "8 igrača, single elim, 500 coin za pobednika." },
              { to: "/clubs",        icon: Users,  title: "Klubovi",          text: "Napravi klub, takmiči se sa ekipom." },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Link key={m.to} to={m.to} className="group">
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="p-5 space-y-2">
                      <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.text}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">Često postavljana pitanja</h2>
        <div className="space-y-4">
          {[
            { q: "Kako da igram šah online besplatno?", a: "Klikni 'Igraj sada' i za 5 sekundi si u partiji. Nema registracije, nema reklama." },
            { q: "Mogu li da igram protiv kompjutera?", a: "Da, 9 AI botova od 400 do 2000 ELO te čekaju — od početnika do majstora." },
            { q: "Mogu li sa prijateljem preko linka?", a: "Da. Otvori 'Pozovi prijatelja', podesi vreme, pošalji link na WhatsApp." },
            { q: "Da li je MasterChess zaista besplatan?", a: "Da. Partije, turniri, analiza, treninzi — sve je besplatno." },
          ].map((item) => (
            <Card key={item.q}>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-1.5">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20 text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-semibold">Spreman? Tvoj prvi potez čeka.</h2>
          <p className="text-muted-foreground">Pravi šah, pravi ljudi, bez šuma.</p>
          <Button asChild size="lg" className="text-base">
            <Link to="/play-guest">Igraj sada — besplatno</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
