import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm py-16">
    <div className="container mx-auto px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Youtube className="h-4 w-4 text-red-500" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Daily<span className="text-gradient-gold">Chess</span>
              <span className="text-muted-foreground text-sm font-normal ml-0.5">_12</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chess lessons, live classes, and training by DailyChess_12. Learn and improve your game.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Learn</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Link to="/premium/lessons" className="text-sm text-muted-foreground hover:text-primary transition-colors">Video Lessons</Link>
            <Link to="/play" className="text-sm text-muted-foreground hover:text-primary transition-colors">Practice Board</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Community</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/tournaments" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tournaments</Link>
            <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Leaderboard</Link>
            <Link to="/friends" className="text-sm text-muted-foreground hover:text-primary transition-colors">Friends</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Support</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact / Book Lesson</Link>
            <Link to="/donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support DailyChess_12</Link>
            <Link to="/premium" className="text-sm text-muted-foreground hover:text-primary transition-colors">Membership</Link>
            <a href="https://www.youtube.com/@DailyChess_12" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-red-400 transition-colors inline-flex items-center gap-1.5">
              <Youtube className="h-3.5 w-3.5" /> YouTube Channel
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DailyChess_12. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          <Link to="/premium" className="text-xs text-muted-foreground hover:text-primary transition-colors">Membership</Link>
          <a href="https://www.youtube.com/@DailyChess_12" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-red-400 transition-colors">
            YouTube
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
