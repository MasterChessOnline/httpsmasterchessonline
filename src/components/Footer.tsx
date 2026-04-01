import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/40 backdrop-blur-sm py-12">
    <div className="container mx-auto px-6">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3 group">
            <Crown className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Master<span className="text-gradient-gold">Chess</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The futuristic platform for chess players. Play beyond reality.
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
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} MasterChess 4D. All rights reserved.</p>
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
);

export default Footer;
