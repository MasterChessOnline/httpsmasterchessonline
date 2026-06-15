import { motion } from "framer-motion";
import { Instagram, Youtube, Share2, ArrowRight } from "lucide-react";

const channels = [
  {
    name: "Instagram",
    handle: "@masterchess.live",
    href: "https://www.instagram.com/masterchess.live",
    icon: Instagram,
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/20",
    text: "text-pink-400",
  },
  {
    name: "YouTube",
    handle: "DailyChess_12",
    href: "https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA",
    icon: Youtube,
    gradient: "from-red-500/20 to-red-800/20",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  {
    name: "TikTok",
    handle: "@masterchess.live",
    href: "https://www.tiktok.com/@masterchess.live",
    icon: Share2,
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
];

export default function SocialFollowStrip() {
  return (
    <section className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold text-white mb-2"
          >
            Follow the Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm text-zinc-400"
          >
            Daily content, behind-the-scenes, and chess tips on social media.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {channels.map((ch, i) => (
            <motion.a
              key={ch.name}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${ch.gradient} border ${ch.border} hover:shadow-lg transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center`}>
                <ch.icon className={`w-5 h-5 ${ch.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ch.name}</p>
                <p className={`text-xs ${ch.text} opacity-80 truncate`}>{ch.handle}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
