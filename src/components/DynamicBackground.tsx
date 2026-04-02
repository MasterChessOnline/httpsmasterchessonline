import { motion } from "framer-motion";

const PIECES = [
  { char: "♔", size: 48, x: 8, y: 12 },
  { char: "♕", size: 40, x: 85, y: 8 },
  { char: "♖", size: 36, x: 12, y: 72 },
  { char: "♗", size: 32, x: 78, y: 68 },
  { char: "♘", size: 44, x: 50, y: 5 },
  { char: "♙", size: 28, x: 92, y: 40 },
  { char: "♚", size: 34, x: 25, y: 85 },
  { char: "♛", size: 30, x: 65, y: 90 },
];

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ perspective: "1000px" }}>
      {/* Ambient light orbs — cinematic depth */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full ambient-light"
        style={{
          top: "10%",
          left: "20%",
          background: "radial-gradient(circle, hsl(43 90% 55% / 0.04), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full ambient-light"
        style={{
          bottom: "15%",
          right: "10%",
          background: "radial-gradient(circle, hsl(30 60% 40% / 0.03), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Floating 3D chess pieces with depth */}
      {PIECES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.025] select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            filter: `drop-shadow(0 0 15px hsl(43 90% 55% / 0.06))`,
            transformStyle: "preserve-3d",
          }}
          animate={{
            y: [0, -(12 + i * 3), 0],
            rotateY: [0, 8, -8, 0],
            rotateX: [0, 3, -3, 0],
            opacity: [0.025, 0.05, 0.025],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
        >
          {p.char}
        </motion.div>
      ))}

      {/* Gold dust particles — sparse, premium */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: 1.5 + Math.random(),
            height: 1.5 + Math.random(),
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: `radial-gradient(circle, hsl(43 90% 55% / 0.3), transparent)`,
          }}
          animate={{
            y: [0, -(15 + Math.random() * 25), 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
