import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm py-16">
    <div className="container mx-auto px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              Master<span className="text-gradient-gold">Chess</span>Online
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The elegant platform for chess players worldwide. Play, learn, and compete.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Play</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/play" className="text-sm text-muted-foreground hover:text-primary transition-colors">vs Computer</Link>
            <Link to="/play/online" className="text-sm text-muted-foreground hover:text-primary transition-colors">Online Multiplayer</Link>
            <Link to="/tournaments" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tournaments</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Improve</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Link to="/premium/lessons" className="text-sm text-muted-foreground hover:text-primary transition-colors">Video Lessons</Link>
            <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Leaderboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Community</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/friends" className="text-sm text-muted-foreground hover:text-primary transition-colors">Friends</Link>
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Create Account</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link to="/donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support Us</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MasterChessOnline. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link to="/premium" className="text-xs text-muted-foreground hover:text-primary transition-colors">Premium</Link>
          <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
