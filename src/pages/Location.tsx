import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Crown, MapPin, Phone, Mail, Globe, Instagram, Youtube, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Location() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>MasterChess Location & Contact — Find Us</title>
        <meta name="description" content="MasterChess headquarters and contact information. Reach out for partnerships, media inquiries, or support." />
        <link rel="canonical" href="https://masterchess.live/location" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-8 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.12),_transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <MapPin className="w-3 h-3" />
            Find Us
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
              MasterChess
            </span>{" "}
            Headquarters
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Visit our office, drop a message, or connect on social media.
          </p>
        </div>
      </section>

      {/* Map + Info */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden border border-yellow-500/10 shadow-2xl shadow-black/40 bg-[#121216]">
            <div className="aspect-video w-full relative">
              <iframe
                title="MasterChess Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18100!2d20.459!3d44.817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDQ5JzAxLjIiTiAyMMKwMjcnMzIuNCJF!5e0!3m2!1sen!2srs!4v1700000000000!5m2!1sen!2srs"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-4 border-t border-yellow-500/10">
              <p className="text-sm text-zinc-400">
                <MapPin className="w-4 h-4 inline mr-2 text-yellow-500" />
                Belgrade, Serbia — Online chess platform serving players worldwide.
              </p>
            </div>
          </div>

          {/* Contact cards */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">MasterChess Live</h3>
                  <p className="text-sm text-zinc-400">Premium online chess platform founded in 2025.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Website</h3>
                  <a href="https://masterchess.live" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                    masterchess.live
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <a href="mailto:contact@masterchess.live" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                    contact@masterchess.live
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Social Media</h3>
                  <div className="flex gap-3 mt-2">
                    <a
                      href="https://www.instagram.com/masterchess.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Instagram className="w-4 h-4 text-white" />
                    </a>
                    <a
                      href="https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Youtube className="w-4 h-4 text-white" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@masterchess.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Share CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20 p-6 text-center">
              <h3 className="font-semibold text-white mb-2">Spread the Word</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Help us grow the MasterChess community.
              </p>
              <Button
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                onClick={() => {
                  const shareData = {
                    title: "MasterChess — Play Chess Online",
                    text: "Join me on MasterChess for free online chess games, tournaments, and AI analysis!",
                    url: "https://masterchess.live",
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    alert("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share MasterChess
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local SEO block */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-4">About MasterChess</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            MasterChess is a free online chess platform based in Belgrade, Serbia, serving players worldwide.
            We offer live multiplayer chess, 9 AI bots with unique personalities, daily tournaments, Stockfish-powered game analysis,
            an opening trainer, battle royale mode, chess clubs, and a full gamification system with XP, levels, and battle passes.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Our mission is to create the most authentic online chess experience — real human play, zero fake engagement,
            no annoying ads, and a community-first approach. Whether you are a beginner learning Scholar's Mate or a
            2000+ ELO player looking for serious competition, MasterChess has something for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Online Chess", "Chess Tournaments", "AI Bots", "Stockfish Analysis", "Opening Trainer", "Battle Royale", "Chess Clubs", "Free to Play"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
