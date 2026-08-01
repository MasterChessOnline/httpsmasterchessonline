// Community hub for the MasterChess Discord server.
// DISCORD_INVITE is the only place the invite link lives — update it here.
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import EmailCaptureSection from "@/components/EmailCaptureSection";
import { Button } from "@/components/ui/button";
import {
  MessagesSquare,
  Swords,
  Trophy,
  GraduationCap,
  Radio,
  Bot,
  ExternalLink,
} from "lucide-react";

export const DISCORD_INVITE = "";

const CHANNELS = [
  {
    icon: Swords,
    name: "#find-a-game",
    text: "Post your rating and time control, get a human opponent in minutes.",
  },
  {
    icon: Trophy,
    name: "#tournaments",
    text: "Pairings, results and pings before every round of the DB Chess Cup and arenas.",
  },
  {
    icon: GraduationCap,
    name: "#analysis",
    text: "Drop a PGN or FEN and get your game reviewed by other players.",
  },
  {
    icon: Radio,
    name: "#stream-alerts",
    text: "Automatic ping when a MasterChess stream or live top-board goes on air.",
  },
  {
    icon: Bot,
    name: "#bot-arena",
    text: "Bot Wars challenges, roasts and screenshots of your best finishes.",
  },
  {
    icon: MessagesSquare,
    name: "#general",
    text: "Chess talk, memes and feedback that goes straight onto the roadmap.",
  },
];

export default function DiscordHub() {
  const hasInvite = DISCORD_INVITE.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="MasterChess Community on Discord — play, analyse, compete"
        description="Join the MasterChess Discord: find opponents at your level, get your games analysed, receive tournament pairings and stream alerts."
        path="/discord"
      />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <header className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/15 mb-4">
            <MessagesSquare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            The MasterChess community
          </h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Real people, real games. Our Discord is where opponents get found, games get analysed
            and tournaments get organised.
          </p>
          <div className="mt-6 flex gap-2 justify-center flex-wrap">
            {hasInvite ? (
              <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  Join the Discord <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ) : (
              <Button size="lg" disabled>
                Invite link coming soon
              </Button>
            )}
            <Link to="/play">
              <Button size="lg" variant="outline">
                <Swords className="mr-2 h-4 w-4" /> Play a game first
              </Button>
            </Link>
          </div>
          {!hasInvite && (
            <p className="text-xs text-muted-foreground mt-3">
              The server is being set up — meanwhile use{" "}
              <Link to="/chat" className="text-primary hover:underline">
                in-site chat
              </Link>{" "}
              and the{" "}
              <Link to="/community" className="text-primary hover:underline">
                community feed
              </Link>
              .
            </p>
          )}
        </header>

        <section className="max-w-4xl mx-auto" aria-labelledby="channels-heading">
          <h2
            id="channels-heading"
            className="font-display text-2xl font-bold text-foreground text-center mb-6"
          >
            What happens inside
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <article
                key={c.name}
                className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <c.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-mono text-sm font-semibold text-foreground">{c.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-12 rounded-2xl border border-border/50 bg-card/60 p-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-3">House rules</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Fair play only — no engine help in games against humans.</li>
            <li>Respect every rating. Beginners get answers, not jokes.</li>
            <li>No spam, no self-promo links without asking a moderator.</li>
            <li>English or Serbian, both are welcome.</li>
          </ul>
        </section>

        <section className="max-w-3xl mx-auto mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Want a feature discussed in Discord to actually ship?{" "}
            <Link to="/roadmap" className="text-primary hover:underline">
              Vote on the public roadmap
            </Link>
            .
          </p>
        </section>

        <EmailCaptureSection
          heading="Not on Discord? Get the email version"
          subheading="Daily puzzle, tournament reminders and community highlights in one short email."
          source="discord"
        />
      </main>
      <Footer />
    </div>
  );
}
