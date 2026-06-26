import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PHOTO_WITH_GM = "/__l5e/assets-v1/2a6e1880-e177-4cbe-b12c-834b642345c7/nikola-with-gm.jpg";
const PHOTO_NIEMANN = "/__l5e/assets-v1/14dae1b4-8366-483a-85ee-cdfb7e456207/nikola-vs-niemann.jpg";
const PHOTO_STREAMER = "/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg";

const NIKOLA_PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nikola Šakotić",
  "alternateName": ["Nikola Sakotic", "Nikola Sakotić"],
  "givenName": "Nikola",
  "familyName": "Šakotić",
  "jobTitle": "Founder & Creator of MasterChess.live",
  "description":
    "13-year-old self-taught programmer and chess player from Serbia. Founder of MasterChess.live — a free, ad-free chess platform for real human play.",
  "birthDate": "2013",
  "nationality": "Serbian",
  "gender": "Male",
  "knowsAbout": ["Chess", "Chess Openings", "Web Development", "React", "TypeScript", "Stockfish", "Game Design"],
  "url": "https://masterchess.live/nikola-sakotic",
  "mainEntityOfPage": "https://masterchess.live/nikola-sakotic",
  "image": [
    `https://masterchess.live${PHOTO_STREAMER}`,
    `https://masterchess.live${PHOTO_NIEMANN}`,
    `https://masterchess.live${PHOTO_WITH_GM}`,
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "MasterChess.live",
    "url": "https://masterchess.live/",
    "logo": "https://masterchess.live/icon-512.png",
  },
  "founderOf": {
    "@type": "Organization",
    "name": "MasterChess.live",
    "url": "https://masterchess.live/",
  },
  "sameAs": [
    "https://masterchess.live/",
    "https://masterchess.live/about",
    "https://masterchess.live/press",
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

const NEWS_LINKS = [
  { slug: "how-13-year-old-built-masterchess-live", title: "How a 13-Year-Old Built MasterChess.live — The Full Story" },
  { slug: "meeting-hans-niemann-at-the-board-belgrade", title: "Meeting Hans Niemann at the Board in Belgrade" },
  { slug: "backstage-with-a-grandmaster-lessons-from-the-top", title: "Backstage with a Grandmaster: Lessons from the Top" },
  { slug: "founders-letter-why-masterchess-live-exists", title: "Founder's Letter: Why MasterChess.live Exists" },
  { slug: "masterchess-brand-serbian-chess-events", title: "MasterChess Wears the Brand at Top Serbian Chess Events" },
];

export default function NikolaSakotic() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Nikola Šakotić — Founder of MasterChess.live (13-Year-Old Developer)"
        description="Nikola Šakotić (Nikola Sakotic) is a 13-year-old self-taught programmer from Serbia and the founder of MasterChess.live — a free, ad-free chess platform built single-handedly."
        path="/nikola-sakotic"
        type="article"
        image={PHOTO_STREAMER}
        jsonLd={[NIKOLA_PERSON_LD, BREADCRUMB_LD]}
      />

      <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <article className="space-y-8">
          <header className="space-y-5 text-center">
            <img
              src={PHOTO_STREAMER}
              alt="Nikola Šakotić, founder of MasterChess.live, wearing the MasterChess shirt at a Serbian chess event"
              width={320}
              height={320}
              loading="eager"
              className="mx-auto h-40 w-40 md:h-48 md:w-48 rounded-full object-cover ring-2 ring-primary/30 shadow-lg"
            />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Nikola Šakotić</h1>
            <p className="text-lg text-muted-foreground">
              Founder &amp; Creator of{" "}
              <Link to="/" className="underline font-medium">MasterChess.live</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              13-year-old self-taught programmer · Serbia · est. 2026
            </p>
          </header>

          <Card className="p-6 md:p-8 space-y-5 text-base leading-relaxed">
            <p>
              Hi, I&apos;m <strong>Nikola Šakotić</strong> (also written Nikola Sakotic). I&apos;m 13
              years old, from Serbia, and I built{" "}
              <Link to="/" className="underline font-medium">MasterChess.live</Link> by myself —
              every line of code, every piece of design, every bot personality.
            </p>

            <h2 className="text-2xl font-semibold pt-2">Why I built MasterChess.live</h2>
            <p>
              I love chess. But every chess site I tried was either covered in ads, locked behind a
              paywall, full of fake players, or so cluttered it made my eyes hurt. I wanted a place
              where you just open the page and play — real humans, real ratings, real games. No
              upsells. No tracking pixels in your face. So I built it.
            </p>

            <h2 className="text-2xl font-semibold pt-2">What&apos;s on the site</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>9 bot opponents from 400 to 2000 ELO with unique personalities</li>
              <li>Online matchmaking with real ELO ratings (no bot-fill, no ghost players)</li>
              <li>Daily puzzle, tactics trainer, opening trainer, full game review</li>
              <li>Weekly signature tournaments, clans, battle pass, battle royale</li>
              <li>100% free, 100% ad-free, forever</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-2">How I built it</h2>
            <p>
              MasterChess.live is a React + TypeScript single-page app, with a Stockfish engine
              compiled to WebAssembly for bot opponents, a Postgres backend for accounts and
              matchmaking, and edge functions for everything that needs a server. I learned most of
              this by reading docs and breaking things. A lot of things.
            </p>

            <h2 className="text-2xl font-semibold pt-2">Highlights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Serbian U14 chess competitor</li>
              <li>Built and shipped MasterChess.live solo at age 13</li>
              <li>Photographed at the Serbian Chess Federation events alongside top GMs</li>
              <li>Featured in MasterChess.live News for solo-shipping a full chess platform</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-2">What&apos;s next</h2>
            <p>
              More lessons in my own voice (yes, a 13-year-old voice — that&apos;s the point). More
              bots. A bigger community. If you have feedback or want to play me, my profile is on
              the site.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link to="/play">Play on MasterChess.live</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/news">Read MasterChess.live News</Link>
              </Button>
            </div>
          </Card>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">From the road — chess events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <img src={PHOTO_NIEMANN} alt="Nikola Šakotić seated at the Niemann–Nepomniachtchi board, Belgrade" loading="lazy" className="w-full aspect-[3/4] object-cover rounded-lg shadow-sm" />
              <img src={PHOTO_WITH_GM} alt="Nikola Šakotić with a grandmaster at a Belgrade chess event" loading="lazy" className="w-full aspect-[3/4] object-cover rounded-lg shadow-sm" />
              <img src={PHOTO_STREAMER} alt="Nikola Šakotić wearing the MasterChess.live shirt at a chess event" loading="lazy" className="w-full aspect-[3/4] object-cover rounded-lg shadow-sm" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Covered in MasterChess.live News</h2>
            <ul className="space-y-2">
              {NEWS_LINKS.map((n) => (
                <li key={n.slug}>
                  <Link to={`/news/${n.slug}`} className="underline text-primary hover:opacity-80">
                    {n.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="text-sm text-muted-foreground space-y-2 border-t pt-6">
            <p><strong>Full name:</strong> Nikola Šakotić (Nikola Sakotic)</p>
            <p><strong>Role:</strong> Founder, Developer, Designer of MasterChess.live</p>
            <p><strong>Project:</strong> <a href="https://masterchess.live" className="underline">MasterChess.live</a></p>
            <p><strong>Country:</strong> Serbia</p>
            <p><strong>Born:</strong> 2013</p>
            <p><strong>Press:</strong> <Link to="/press" className="underline">Press kit &amp; media inquiries</Link></p>
          </section>
        </article>
      </main>
    </div>
  );
}
