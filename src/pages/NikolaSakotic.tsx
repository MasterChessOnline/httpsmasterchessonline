import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NIKOLA_PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nikola Šakotić",
  "alternateName": ["Nikola Sakotic", "Nikola Sakotić"],
  "givenName": "Nikola",
  "familyName": "Šakotić",
  "jobTitle": "Founder & Creator of MasterChess",
  "description":
    "13-year-old self-taught programmer and chess player from Serbia. Founder of MasterChess.live — a free, ad-free chess platform for real human play.",
  "birthDate": "2013",
  "nationality": "Serbian",
  "gender": "Male",
  "knowsAbout": [
    "Chess",
    "Chess Openings",
    "Web Development",
    "React",
    "TypeScript",
    "Stockfish",
    "Game Design",
  ],
  "url": "https://masterchess.live/nikola-sakotic",
  "mainEntityOfPage": "https://masterchess.live/nikola-sakotic",
  "image": "https://masterchess.live/nikola-avatar.jpg",
  "worksFor": {
    "@type": "Organization",
    "name": "MasterChess",
    "url": "https://masterchess.live/",
    "logo": "https://masterchess.live/icon-512.png",
  },
  "founderOf": {
    "@type": "Organization",
    "name": "MasterChess",
    "url": "https://masterchess.live/",
  },
  "sameAs": [
    "https://masterchess.live/",
    "https://masterchess.live/about",
    "https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA",
  ],
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "MasterChess", "item": "https://masterchess.live/" },
    { "@type": "ListItem", "position": 2, "name": "Nikola Šakotić", "item": "https://masterchess.live/nikola-sakotic" },
  ],
};

export default function NikolaSakotic() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Nikola Šakotić — Founder of MasterChess (13-Year-Old Developer)"
        description="Nikola Šakotić (Nikola Sakotic) is a 13-year-old self-taught programmer from Serbia and the founder of MasterChess.live — a free, ad-free chess platform built single-handedly."
        path="/nikola-sakotic"
        type="article"
        jsonLd={[NIKOLA_PERSON_LD, BREADCRUMB_LD]}
      />

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <article className="space-y-8">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Nikola Šakotić
            </h1>
            <p className="text-lg text-muted-foreground">
              Founder &amp; Creator of <Link to="/" className="underline font-medium">MasterChess</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              13-year-old self-taught programmer · Serbia · est. 2026
            </p>
          </header>

          <Card className="p-6 md:p-8 space-y-5 text-base leading-relaxed">
            <p>
              Hi, I&apos;m <strong>Nikola Šakotić</strong> (also written Nikola Sakotic).
              I&apos;m 13 years old, from Serbia, and I built{" "}
              <Link to="/" className="underline font-medium">MasterChess.live</Link> by myself —
              every line of code, every piece of design, every bot personality.
            </p>

            <h2 className="text-2xl font-semibold pt-2">Why I built MasterChess</h2>
            <p>
              I love chess. But every chess site I tried was either covered in ads, locked
              behind a paywall, full of fake players, or so cluttered it made my eyes hurt.
              I wanted a place where you just open the page and play — real humans, real
              ratings, real games. No upsells. No tracking pixels in your face. So I built it.
            </p>

            <h2 className="text-2xl font-semibold pt-2">What&apos;s on the site</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>9 bot opponents from 400 to 2000 ELO with unique personalities</li>
              <li>Online matchmaking with real ELO ratings (no bot-fill, no ghost players)</li>
              <li>A daily puzzle and a tactics trainer</li>
              <li>Opening trainer, lessons, and game-review tools</li>
              <li>Tournaments, clans, a battle pass, and challenge modes</li>
              <li>100% free, 100% ad-free, forever</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-2">How I built it</h2>
            <p>
              MasterChess is a React + TypeScript single-page app, with a Stockfish engine
              compiled to WebAssembly for bot opponents, a Postgres backend for accounts and
              matchmaking, and edge functions for everything that needs a server. I learned
              most of this by reading docs and breaking things. A lot of things.
            </p>

            <h2 className="text-2xl font-semibold pt-2">What&apos;s next</h2>
            <p>
              More lessons in my own voice (yes, a 13-year-old voice — that&apos;s the point).
              More bots. A bigger community. If you have feedback or want to play me, my
              profile is on the site.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link to="/play">Play on MasterChess</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">About MasterChess</Link>
              </Button>
            </div>
          </Card>

          <section className="text-sm text-muted-foreground space-y-2 border-t pt-6">
            <p><strong>Full name:</strong> Nikola Šakotić (Nikola Sakotic)</p>
            <p><strong>Role:</strong> Founder, Developer, Designer</p>
            <p><strong>Project:</strong> <a href="https://masterchess.live" className="underline">MasterChess.live</a></p>
            <p><strong>Country:</strong> Serbia</p>
            <p><strong>Born:</strong> 2013</p>
          </section>
        </article>
      </main>
    </div>
  );
}
