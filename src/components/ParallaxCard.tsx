import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

/**
 * Interactive 4D card — tilts toward the mouse cursor with dynamic
 * shadow and optional neon glow. Fully GPU-accelerated.
 */
export default function ParallaxCard({
  children,
  className = "",
  glowColor = "hsl(43 90% 55% / 0.12)",
  intensity = 8,
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (cy - 0.5) * -intensity,
      y: (cx - 0.5) * intensity,
    });
    setGlowPos({ x: cx * 100, y: cy * 100 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: hovering ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic glow that follows cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
        style={{
          background: `radial-gradient(600px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
          opacity: hovering ? 1 : 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
