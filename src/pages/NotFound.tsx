import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Floating chess piece background */}
      <div className="absolute inset-0 pointer-events-none">
        {["♔", "♕", "♖", "♗", "♘", "♙"].map((piece, i) => (
          <motion.span
            key={i}
            className="absolute text-6xl text-primary/5 select-none"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            {piece}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h1
          className="text-8xl md:text-9xl font-bold font-display text-gradient-gold mb-4"
          animate={{ textShadow: ["0 0 20px hsl(43 90% 55% / 0.2)", "0 0 40px hsl(43 90% 55% / 0.4)", "0 0 20px hsl(43 90% 55% / 0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          404
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          This page doesn't exist on the board
        </motion.p>
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/">
            <Button className="ripple-btn bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
