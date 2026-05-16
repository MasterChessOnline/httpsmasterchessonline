import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Radio, Copy, Check, ExternalLink, Crown, Palette, Layout } from "lucide-react";
import { motion } from "framer-motion";

const SITE = "https://masterchess.live";

const presets = [
  { name: "Gold (Default)", accent: "d4af37" },
  { name: "Cyan", accent: "22d3ee" },
  { name: "Emerald", accent: "10b981" },
  { name: "Magenta", accent: "ec4899" },
  { name: "Violet", accent: "8b5cf6" },
  { name: "Red", accent: "ef4444" },
];

export default function Streamers() {
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState("d4af37");
  const [layout, setLayout] = useState<"bar" | "card">("bar");
  const [copied, setCopied] = useState(false);

  const url = username
    ? `${SITE}/embed/rating/${encodeURIComponent(username)}?theme=${theme}&accent=%23${accent}&layout=${layout}`
    : "";

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Streamer Tools — OBS Overlays & Live Embeds | MasterChess"
        description="Free OBS-ready overlays for chess streamers. Live rating embed, custom colors, transparent background — built for creators."
        path="/streamers"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            <Radio className="h-3 w-3" /> Streamer Tools
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-3">
            Built for <span className="text-primary">Creators</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drop a live rating overlay straight into OBS. Transparent background, custom accent, refreshes every 30s.
          </p>
        </motion.div>

        <Card className="p-6 sm:p-8 mb-8 border-primary/20 bg-card/70 backdrop-blur">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configurator */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Crown className="h-3 w-3" /> MasterChess username
                </label>
                <Input
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Layout className="h-3 w-3" /> Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["bar", "card"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        layout === l
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/30 hover:border-primary/40"
                      }`}
                    >{l === "bar" ? "Slim bar" : "Card"}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${
                        theme === t ? "border-primary bg-primary/15 text-primary" : "border-border/30 hover:border-primary/40"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Palette className="h-3 w-3" /> Accent color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.accent}
                      onClick={() => setAccent(p.accent)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                        accent === p.accent ? "border-primary" : "border-border/30 hover:border-primary/40"
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ background: `#${p.accent}` }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview + URL */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Live preview
                </label>
                <div className="rounded-xl border border-dashed border-border/40 p-6 min-h-[140px] flex items-center justify-center" style={{
                  background: "repeating-conic-gradient(hsl(var(--muted)/0.15) 0% 25%, transparent 0% 50%) 50% / 20px 20px",
                }}>
                  {username ? (
                    <iframe
                      key={url}
                      src={url}
                      className="border-0"
                      style={{ background: "transparent", width: "100%", height: 90 }}
                      title="Overlay preview"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Enter username to preview</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  OBS Browser Source URL
                </label>
                <div className="flex gap-2">
                  <Input readOnly value={url} placeholder="…" className="font-mono text-xs bg-background/50" />
                  <Button onClick={copy} disabled={!url} variant="outline" size="icon">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  In OBS: <strong>Sources → +</strong> → <strong>Browser</strong>, paste URL, set width 400 height 100, check "Transparent background".
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Featured creator */}
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-display font-bold text-lg mb-1">Featured: DailyChess_12</h3>
              <p className="text-sm text-muted-foreground mb-3">
                MasterChess officially integrates with DailyChess_12 — live streams, viewer queue, and "Challenge the Streamer" mode.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link to="/live">
                  <Button size="sm" variant="default">Open Stream Hub</Button>
                </Link>
                <a href="https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    YouTube <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Want to be featured? <Link to="/contact" className="text-primary hover:underline">Reach out</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
