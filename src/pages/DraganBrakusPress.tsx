// /dragan-brakus/press — press kit page.
// High-res assets, founder bio, contact, downloadable copy.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Image as ImageIcon } from "lucide-react";

const SITE = "https://masterchess.live";

const ONE_LINER =
  "MasterChess is an online chess platform built by a 13-year-old founder, hosting FIDE-style Swiss tournaments such as the Dragan Brakus Cup.";

const ONE_PARAGRAPH =
  "MasterChess.live is a community-first online chess platform created and operated by 13-year-old Nikola Sakotic from Serbia. It hosts free, FIDE-style Swiss tournaments, daily puzzles, AI-free human play and a public live-standings system used during signature events like the Dragan Brakus Cup — a 9-round Blitz held in memory of Serbian chess organizer Dragan Brakus.";

export default function DraganBrakusPress() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Dragan Brakus Cup — Press Kit"
        description="Press kit for the Dragan Brakus Cup on MasterChess: founder bio, photos, logos, one-paragraph description and media contact."
        path="/dragan-brakus/press"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Press Kit — Dragan Brakus Cup</h1>
        <p className="text-muted-foreground mb-8">
          Everything journalists, bloggers and chess clubs need to cover the event. Free to reuse with credit to MasterChess.live.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Story angles</h2>
          <ul className="space-y-2 text-sm">
            <li>• 13-year-old founder organizes a 500-player FIDE-style Swiss in memory of Serbian organizer Dragan Brakus.</li>
            <li>• Free entry, online, 9 rounds, live pairings — built end-to-end by one teenager.</li>
            <li>• Open-source-style live standings page with full Buchholz tie-breaks and Chess-Results export.</li>
            <li>• Charity edition: 100% participation, certificates for every finisher.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">One-liner</h2>
          <Card className="p-4 text-sm">{ONE_LINER}</Card>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">One paragraph</h2>
          <Card className="p-4 text-sm leading-relaxed">{ONE_PARAGRAPH}</Card>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Founder</h2>
          <Card className="p-4 text-sm">
            <strong>Nikola Sakotic</strong> — 13, Belgrade, Serbia. Builder and operator of MasterChess.live. Full bio &amp; photos:{" "}
            <a href="/nikola" className="text-yellow-400 underline">/nikola</a>.
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Assets</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start">
              <a href="/og-image.jpg" download>
                <ImageIcon className="h-4 w-4 mr-2" /> OG / social card (1200×630)
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href="/favicon.png" download>
                <ImageIcon className="h-4 w-4 mr-2" /> MasterChess logo (PNG)
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href={`${SITE}/dragan-brakus`} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" /> Event landing page
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href={`${SITE}/dragan-brakus/live`} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" /> Live standings page
              </a>
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <Card className="p-4 text-sm flex items-center gap-2">
            <Mail className="h-4 w-4 text-yellow-400" />
            <a href="mailto:press@masterchess.live" className="text-yellow-400 underline">press@masterchess.live</a>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
