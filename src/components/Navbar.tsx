import { Menu, X, LogOut, User, Trophy, Users, Swords, GraduationCap, Award, LayoutDashboard, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Play", href: "/play", icon: Swords },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Leaderboard", href: "/leaderboard", icon: Award },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/40 glass shadow-card"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="MasterChessOnline home">
          <motion.div
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
          </motion.div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{ zIndex: -1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <Link to="/friends" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/40">
                <Users className="h-4 w-4" />
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-1.5 hover:border-primary/30 transition-all duration-300 hover:shadow-glow"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                  {profile?.display_name || profile?.username || user.email?.split("@")[0]}
                </span>
                {profile && (
                  <span className="font-mono text-xs text-primary font-bold">{profile.rating}</span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-semibold shadow-glow transition-transform duration-200">
                  Sign Up Free
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden p-2 -mr-2 rounded-lg hover:bg-muted/40 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="border-t border-border/40 glass px-6 py-4 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.filter(item => !item.auth || user).map((item, i) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="border-t border-border/40 mt-2 pt-2">
                {user ? (
                  <>
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/40"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{profile?.display_name || user.email?.split("@")[0]}</span>
                      {profile && <span className="font-mono text-xs text-primary ml-auto">{profile.rating}</span>}
                    </Link>
                    <Link
                      to="/friends"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    >
                      <Users className="h-4 w-4" />
                      Friends
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full bg-primary text-primary-foreground shadow-glow">Sign Up Free</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
