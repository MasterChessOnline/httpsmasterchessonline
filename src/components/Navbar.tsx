import { Crown, Menu, X, LogOut, User, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Play", href: "/play" },
  { label: "Online", href: "/play/online" },
  { label: "Puzzles", href: "/puzzles" },
  { label: "Learn", href: "/learn" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="MasterChessOnline home">
          <Crown className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Master<span className="text-gradient-gold">Chess</span>Online
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-20 bg-muted/30 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <Link to="/friends" className="text-muted-foreground hover:text-primary transition-colors">
                <Users className="h-4 w-4" />
              </Link>
              <Link to={`/profile/${user.id}`} className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-1.5 hover:border-primary/30 transition-all">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {profile?.display_name || profile?.username || user.email?.split("@")[0]}
                </span>
                {profile && (
                  <span className="text-xs text-muted-foreground ml-1">{profile.rating}</span>
                )}
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button></Link>
              <Link to="/signup"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Sign Up</Button></Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} to={item.href} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={`/profile/${user.id}`} className="flex items-center gap-2 text-sm text-foreground pt-2 border-t border-border/50" onClick={() => setMobileOpen(false)}>
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile?.display_name || user.email?.split("@")[0]}</span>
                  {profile && <span className="text-xs text-muted-foreground">({profile.rating})</span>}
                </Link>
                <Link to="/friends" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> Friends</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}><Button className="bg-primary text-primary-foreground w-full">Sign Up</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
