import { motion } from "framer-motion";

const PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.03] select-none"
          style={{
            left: `${10 + (i * 12) % 85}%`,
            top: `${5 + (i * 17) % 80}%`,
            fontSize: `${24 + (i % 3) * 12}px`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, (i % 2 === 0 ? 5 : -5), 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        >
          {PIECES[i % PIECES.length]}
        </motion.div>
      ))}
    </div>
  );
}
