import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Primary glow */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        animate={{ x: position.x - 150, y: position.y - 150 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        <div
          className="w-[300px] h-[300px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
          }}
        />
      </motion.div>
      {/* Secondary trailing glow — depth effect */}
      <motion.div
        className="fixed pointer-events-none z-[9998] mix-blend-screen"
        animate={{ x: position.x - 100, y: position.y - 100 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, mass: 0.3 }}
      >
        <div
          className="w-[200px] h-[200px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(var(--neon-cyan)) 0%, transparent 60%)",
          }}
        />
      </motion.div>
    </>
  );
}
