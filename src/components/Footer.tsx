import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card py-12">
    <div className="container mx-auto px-6">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              Master<span className="text-gradient-gold">Chess</span>Online
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The elegant platform for chess players worldwide.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-3">Play</h4>
          <div className="flex flex-col gap-2">
            <Link to="/play" className="text-sm text-muted-foreground hover:text-primary transition-colors">vs Computer</Link>
            <Link to="/play/online" className="text-sm text-muted-foreground hover:text-primary transition-colors">Online Multiplayer</Link>
            <Link to="/tournaments" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tournaments</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-3">Improve</h4>
          <div className="flex flex-col gap-2">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Leaderboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-3">Community</h4>
          <div className="flex flex-col gap-2">
            <Link to="/friends" className="text-sm text-muted-foreground hover:text-primary transition-colors">Friends</Link>
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Create Account</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Me</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MasterChessOnline. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
