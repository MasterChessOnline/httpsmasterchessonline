import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Download,
  Image,
  Palette,
  Type,
  FileText,
  Crown,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const BRAND_COLORS = [
  { name: "Gold", hex: "#EAB308", usage: "Primary accent, CTAs, highlights" },
  { name: "Dark", hex: "#0B0B0D", usage: "Background, headers" },
  { name: "Surface", hex: "#121216", usage: "Cards, panels" },
  { name: "White", hex: "#FAFAFA", usage: "Primary text" },
];

const LOGO_VARIANTS = [
  { name: "Logo + Wordmark", src: "/app-icon-512.png", bg: "bg-[#0b0b0d]" },
  { name: "Icon Only", src: "/favicon.png", bg: "bg-[#0b0b0d]" },
];

export default function PressKit() {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const oneLiner = "MasterChess — Real chess. Real people. No noise.";
  const description =
    "MasterChess is a free online chess platform where players compete in live games, daily tournaments, and AI-bot matches. Features include Stockfish-powered analysis, an opening trainer, battle royale mode, chess clubs, and a full gamification system with XP, levels, and battle passes.";
  const founders = "Founded in 2025 in Belgrade, Serbia.";

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>MasterChess Press Kit — Media Assets & Brand Guidelines</title>
        <meta name="description" content="Download MasterChess logos, brand colors, and media assets. Press kit for journalists, bloggers, and content creators." />
        <link rel="canonical" href="https://masterchess.live/press-kit" />
      </Helmet>

      <section className="relative overflow-hidden pt-16 pb-10 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.12),_transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <FileText className="w-3 h-3" />
            Press Kit
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Media Assets
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Everything you need to write about, review, or promote MasterChess.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-10">
        {/* Brand Story */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Brand Story</h2>
          </div>

          <div className="space-y-4">
            <CopyBlock
              label="One-liner"
              text={oneLiner}
              copied={copied}
              onCopy={() => copy(oneLiner, "One-liner")}
            />
            <CopyBlock
              label="Description"
              text={description}
              copied={copied}
              onCopy={() => copy(description, "Description")}
            />
            <CopyBlock
              label="Founded"
              text={founders}
              copied={copied}
              onCopy={() => copy(founders, "Founded")}
            />
          </div>
        </section>

        {/* Logos */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Image className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Logos</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {LOGO_VARIANTS.map((logo) => (
              <div key={logo.name} className={`rounded-xl ${logo.bg} border border-yellow-500/10 p-6 text-center`}>
                <img src={logo.src} alt={logo.name} className="w-20 h-20 mx-auto mb-3 object-contain" />
                <p className="text-sm font-medium text-white mb-2">{logo.name}</p>
                <a
                  href={logo.src}
                  download
                  className="inline-flex items-center gap-2 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download PNG
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Brand Colors</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BRAND_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => copy(c.hex, c.name)}
                className="rounded-xl border border-zinc-800 p-4 text-center hover:border-yellow-500/30 transition-colors group"
              >
                <div
                  className="w-full h-12 rounded-lg mb-2 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <p className="text-xs text-zinc-500 font-mono mt-1">{c.hex}</p>
                <p className="text-[10px] text-zinc-600 mt-1">{c.usage}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Type className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Typography</h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-zinc-900/60">
              <p className="text-xs text-zinc-500 mb-1">Headings</p>
              <p className="text-xl font-bold text-white">SF Pro Display / Inter Bold</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60">
              <p className="text-xs text-zinc-500 mb-1">Body</p>
              <p className="text-base text-zinc-300">Inter / DM Sans — clean, readable, modern.</p>
            </div>
          </div>
        </section>

        {/* Quick Facts */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Quick Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Founded", value: "2025" },
              { label: "Headquarters", value: "Belgrade, Serbia" },
              { label: "Platform", value: "Web (PWA)" },
              { label: "Players", value: "10,000+" },
              { label: "Game Modes", value: "9+" },
              { label: "Price", value: "100% Free" },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-xl bg-zinc-900/40">
                <p className="text-xs text-zinc-500">{f.label}</p>
                <p className="text-sm font-semibold text-white">{f.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 md:p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Follow MasterChess</h2>
          <div className="flex justify-center gap-3">
            {[
              { label: "Instagram", href: "https://www.instagram.com/masterchess.live", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
              { label: "YouTube", href: "https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA", color: "bg-gradient-to-br from-red-600 to-red-800" },
              { label: "TikTok", href: "https://www.tiktok.com/@masterchess.live", color: "bg-gradient-to-br from-cyan-500 to-blue-600" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2 rounded-lg ${s.color} text-white text-sm font-medium hover:scale-105 transition-transform`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CopyBlock({
  label,
  text,
  copied,
  onCopy,
}: {
  label: string;
  text: string;
  copied: string | null;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 group">
      <p className="flex-1 text-sm text-zinc-300">{text}</p>
      <button
        onClick={onCopy}
        className="shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition-colors"
        title="Copy"
      >
        {copied === label ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
