import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MessageCircle,
  Send,
  Share2,
  Users,
  Trophy,
  Zap,
  Crown,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_MSG = "Hey! I challenge you to a chess match on MasterChess. Think you can beat me? 🏆 ";
const TELEGRAM_MSG = "I challenge you to a chess match on MasterChess! ";

export default function Viral() {
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const challengeLink = username
    ? `https://masterchess.live/vs/${username}`
    : "https://masterchess.live/play/online";

  const copyLink = () => {
    navigator.clipboard.writeText(challengeLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const growthTips = [
    {
      icon: MessageCircle,
      title: "WhatsApp Groups",
      desc: "Share your challenge link in family & friend group chats. Chess is universal — everyone knows the rules.",
      action: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(WHATSAPP_MSG + challengeLink)}`,
      color: "bg-green-500",
    },
    {
      icon: Send,
      title: "Telegram Channels",
      desc: "Post in chess-related Telegram groups and channels. The chess community loves discovering new platforms.",
      action: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(challengeLink)}&text=${encodeURIComponent(TELEGRAM_MSG)}`,
      color: "bg-sky-500",
    },
    {
      icon: Share2,
      title: "TikTok & Reels",
      desc: "Record a 15-second clip of your fastest win. Use hashtag #MasterChess and tag @masterchess.live.",
      action: "Go to TikTok",
      href: "https://www.tiktok.com/@masterchess.live",
      color: "bg-gradient-to-r from-cyan-500 to-blue-600",
    },
    {
      icon: Trophy,
      title: "Reddit r/chess",
      desc: "Post 'Just discovered this free chess site — no ads, real human play only' in r/chess or r/chessbeginners.",
      action: "Go to Reddit",
      href: "https://reddit.com/r/chess",
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>Go Viral with MasterChess — Share & Challenge Friends</title>
        <meta name="description" content="Challenge friends to chess matches, share on WhatsApp, Telegram, TikTok, and Reddit. Help MasterChess grow!" />
        <link rel="canonical" href="https://masterchess.live/viral" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-10 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.15),_transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Go Viral
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Challenge the World
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mb-6">
            Invite friends. Post on socials. Make MasterChess the next big chess community.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8">
        {/* Challenge Link Generator */}
        <section className="rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Your Challenge Link</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Enter your username to create a direct challenge link. When someone clicks it, they can instantly play against you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Your MasterChess username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-4">
            <code className="flex-1 text-xs text-yellow-400 font-mono truncate">{challengeLink}</code>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shrink-0"
              onClick={copyLink}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(WHATSAPP_MSG + challengeLink)}`, color: "bg-green-500 hover:bg-green-400" },
              { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(challengeLink)}&text=${encodeURIComponent(TELEGRAM_MSG)}`, color: "bg-sky-500 hover:bg-sky-400" },
              { name: "Twitter", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("I challenge you to chess on MasterChess! ")}&url=${encodeURIComponent(challengeLink)}`, color: "bg-zinc-700 hover:bg-zinc-600" },
              { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(challengeLink)}`, color: "bg-blue-600 hover:bg-blue-500" },
            ].map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg ${s.color} text-white text-xs font-medium transition-transform hover:scale-105`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </section>

        {/* Growth Tips */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-center">How to Grow MasterChess</h2>
          <div className="grid gap-4">
            {growthTips.map((tip, i) => (
              <div
                key={tip.title}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-yellow-500/10 bg-[#121216] hover:border-yellow-500/20 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center shrink-0`}>
                  <tip.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{tip.title}</h3>
                  <p className="text-sm text-zinc-400">{tip.desc}</p>
                </div>
                <a
                  href={tip.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors shrink-0"
                >
                  {tip.action}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Players", value: "10K+" },
              { icon: Zap, label: "Daily Games", value: "5K+" },
              { icon: Trophy, label: "Tournaments", value: "50+/week" },
              { icon: Crown, label: "Top ELO", value: "2400+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-zinc-900/40">
                <stat.icon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
