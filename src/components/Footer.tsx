import React from "react";
import { Crown, Instagram, Youtube, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ShareSiteStrip from "@/components/ShareSiteStrip";
import DonationProgressBar from "@/components/DonationProgressBar";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/masterchess.live", label: "Instagram", color: "hover:text-pink-400" },
  { icon: Youtube, href: "https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA", label: "YouTube", color: "hover:text-red-400" },
  { icon: Share2, href: "https://www.tiktok.com/@masterchess.live", label: "TikTok", color: "hover:text-cyan-400" },
];

const Footer = React.forwardRef<HTMLElement>((_props, ref) => (
  <footer ref={ref} className="relative border-t border-border/30 bg-card/40 backdrop-blur-sm py-12 overflow-hidden">
    {/* Subtle ambient glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.02), transparent 70%)" }} />
    {/* Gold edge line */}
    <div className="absolute top-0 left-10% right-10% h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(43 90% 55% / 0.1), transparent)" }} />

    <div className="container mx-auto px-6 relative">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3 group">
            <Crown className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform duration-300" style={{ filter: "drop-shadow(0 0 6px hsl(43 90% 55% / 0.3))" }} />
            <span className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Master<span className="text-gradient-gold">Chess</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The premium platform for chess players. Play, learn, compete.
          </p>
          <div className="flex gap-3 mt-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={`w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-muted-foreground ${s.color} hover:scale-110 transition-all`}
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          {
            title: "Play",
            links: [
              { label: "Play Online", href: "/play/online" },
              { label: "Play vs AI", href: "/play" },
              { label: "Tournaments", href: "/tournaments" },
            ],
          },
          {
            title: "Learn",
            links: [
              { label: "Training", href: "/learn" },
              { label: "Openings", href: "/openings" },
              { label: "Analysis", href: "/analysis" },
            ],
          },
          {
            title: "Compete",
            links: [
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "Achievements", href: "/achievements" },
              { label: "Friends", href: "/friends" },
              { label: "Community", href: "/community" },
              { label: "Live · DailyChess_12", href: "/live" },
              { label: "About", href: "/about" },
              { label: "Fair Play", href: "/fair-play" },
              { label: "Invite Friends", href: "/referrals" },
              { label: "Confession Booth", href: "/confessions" },
              { label: "❤ Support the project", href: "/supporter" },
              { label: "Promote", href: "/promo" },
              { label: "Press Kit", href: "/press-kit" },
            ],
          },
        ].map((section) => (
          <div key={section.title}>
            <h4 className="font-display text-xs font-semibold text-foreground mb-3 uppercase tracking-widest">{section.title}</h4>
            <div className="flex flex-col gap-2">
              {section.links.map((link) => (
                <Link key={link.href} to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 max-w-md mx-auto">
        <DonationProgressBar variant="inline" />
      </div>

      <ShareSiteStrip />

      <div className="border-t border-border/30 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} MasterChess. All rights reserved.</p>
        <div className="flex gap-4">
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Press", href: "/press" },
            { label: "Investors", href: "/pitch" },
            { label: "Streamers", href: "/streamers" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <Link key={link.href} to={link.href} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Signature — quiet, personal, ends the page on a human note */}
      <Link
        to="/about"
        className="group mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 hover:text-primary/80 transition-colors"
      >
        <span>Crafted with passion</span>
        <motion.span
          aria-hidden
          className="inline-flex items-center justify-center"
          whileHover={{ rotate: 360, scale: 1.15 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Crown className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors" style={{ filter: "drop-shadow(0 0 4px hsl(43 90% 55% / 0.45))" }} />
        </motion.span>
        <span className="text-primary/60 group-hover:text-primary/90 transition-colors">MasterChess</span>
      </Link>
    </div>
  </footer>
));
Footer.displayName = "Footer";

export default Footer;
