import React from "react";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
      <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} MasterChess. All rights reserved.</p>
        <div className="flex gap-4">
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <Link key={link.href} to={link.href} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
));
Footer.displayName = "Footer";

export default Footer;
