import { Crown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Master<span className="text-gradient-gold">Chess</span>Online
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {["Play", "Puzzles", "Learn", "Tournaments"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Sign In
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Play Now
          </Button>
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {["Play", "Puzzles", "Learn", "Tournaments"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-muted-foreground">
                {item}
              </a>
            ))}
            <Button className="bg-primary text-primary-foreground w-full mt-2">Play Now</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
