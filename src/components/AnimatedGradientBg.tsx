import { motion } from "framer-motion";

export default function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large orbiting gradient orbs */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)",
          top: "5%",
          left: "15%",
        }}
        animate={{
          x: [0, 120, -60, 0],
          y: [0, -100, 80, 0],
          scale: [1, 1.3, 0.85, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.6) 0%, transparent 70%)",
          bottom: "5%",
          right: "5%",
        }}
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 80, -50, 0],
          scale: [1, 0.75, 1.15, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold-light) / 0.4) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles with varied sizes */}
      {Array.from({ length: 30 }).map((_, i) => {
        const size = 1 + Math.random() * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/40"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40 - Math.random() * 60, 0],
              x: [0, (Math.random() - 0.5) * 30, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
