import { Crown } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card py-12">
    <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        <span className="font-display text-lg font-bold text-foreground">
          Master<span className="text-gradient-gold">Chess</span>Online
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} MasterChessOnline. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
