import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chrome, Download, MousePointerClick, Zap, Puzzle, Trophy } from "lucide-react";

function downloadExtension() {
  fetch("/masterchess-extension.zip")
    .then((res) => {
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "masterchess-extension.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    })
    .catch((err) => alert(err.message));
}

const features = [
  { icon: Zap, title: "Instant Play", text: "One click from any tab → straight into a chess game." },
  { icon: Puzzle, title: "Daily Puzzle", text: "A new tactical puzzle every day in the popup." },
  { icon: MousePointerClick, title: "Right-click FEN → Analyze", text: "Highlight any FEN on any site → open in MasterChess Analysis." },
  { icon: Trophy, title: "Tournament countdown", text: "See when the next Blitz tournament starts." },
];

export default function Extension() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="MasterChess Chrome Extension — One-Click Chess"
        description="Free Chrome extension: instant chess, daily puzzle, and right-click FEN analysis on MasterChess.live. Works on Chrome, Edge, Brave, Opera."
        path="/extension"
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-300/40">
            <Chrome className="h-7 w-7 text-amber-300" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            MasterChess for <span className="text-amber-300">Chrome</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Play chess, solve the daily puzzle, and analyze positions from any tab.
            Zero tracking. Zero ads. Free forever.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={downloadExtension} className="bg-amber-400 text-black hover:bg-amber-300 h-14 px-8">
              <Download className="mr-2 h-5 w-5" /> Download extension (.zip)
            </Button>
            <span className="text-xs text-muted-foreground">v1.0.0 · MV3 · works on Chrome, Edge, Brave, Opera, Arc</span>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="p-5 border-white/10 bg-card/70">
              <f.icon className="h-6 w-6 text-amber-300 mb-3" />
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-10 p-6 border-amber-300/25 bg-gradient-to-br from-amber-400/10 via-card to-card">
          <h2 className="text-xl font-bold mb-3">How to install (30 seconds)</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Click <b>Download extension (.zip)</b> above.</li>
            <li>Unzip the file anywhere (Desktop is fine).</li>
            <li>Open <code className="rounded bg-black/40 px-1.5 py-0.5 text-amber-200">chrome://extensions</code> in Chrome.</li>
            <li>Toggle <b>Developer mode</b> on (top-right corner).</li>
            <li>Click <b>Load unpacked</b> → select the unzipped folder.</li>
            <li>Pin the crown icon 👑 to your toolbar → done.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Works identically on Microsoft Edge, Brave, Opera, and Arc — same steps.
            Coming soon to the Chrome Web Store for one-click install.
          </p>
        </Card>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          Not on desktop? Try the <a href="/manifest.json" className="text-amber-300 hover:underline">PWA install</a> from your mobile browser.
        </div>
      </main>

      <Footer />
    </div>
  );
}
