import { Crown, Youtube, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm py-16">
    <div className="container mx-auto px-6">
      <ScrollReveal>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <Crown className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-display text-lg font-bold text-foreground">
                Master<span className="text-gradient-gold">Chess</span>Online
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The elegant platform for chess players worldwide. Play, learn, and compete.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.youtube.com/@DailyChess_12"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="h-4 w-4" />
                DailyChess_12
              </a>
              <Link
                to="/donate"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart className="h-4 w-4" />
                Donate
              </Link>
            </div>
          </div>
          {[
            {
              title: "Play",
              links: [
                { label: "vs Computer", href: "/play" },
                { label: "Online Multiplayer", href: "/play/online" },
                { label: "Tournaments", href: "/tournaments" },
              ],
            },
            {
              title: "Improve",
              links: [
                { label: "Courses", href: "/learn" },
                { label: "Video Lessons", href: "/premium/lessons" },
                { label: "Leaderboard", href: "/leaderboard" },
              ],
            },
            {
              title: "Community",
              links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Friends", href: "/friends" },
                { label: "Support Us", href: "/donate" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">{section.title}</h4>
              <div className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
      <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MasterChessOnline. All rights reserved.
        </p>
        <div className="flex gap-6">
          {[
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ].map((link) => (
            <Link key={link.href} to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
