import { useRef, useEffect, ReactNode } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  /** Tilt magnitude in degrees. Lower = more subtle. */
  intensity?: number;
}

/**
 * Interactive 4D card — tilts toward the cursor with dynamic glow.
 * Uses rAF + transform writes (no React re-renders) for buttery 60fps.
 * Auto-disables 3D tilt on weak devices / reduced-motion.
 */
export default function ParallaxCard({
  children,
  className = "",
  glowColor = "hsl(43 90% 55% / 0.12)",
  intensity = 6,
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cap = useDeviceCapability();

  useEffect(() => {
    const el = ref.current;
    if (!el || cap.reduceMotion) return;

    const allow3D = cap.allow3D;
    let rx = 0, ry = 0, tRx = 0, tRy = 0;
    let scale = 1, tScale = 1;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      tRx = (cy - 0.5) * -intensity;
      tRy = (cx - 0.5) * intensity;
      if (glowRef.current) {
        glowRef.current.style.setProperty("--mx", `${cx * 100}%`);
        glowRef.current.style.setProperty("--my", `${cy * 100}%`);
        glowRef.current.style.opacity = "1";
      }
    };
    const onEnter = () => {
      hovering = true;
      tScale = 1.025;
    };
    const onLeave = () => {
      hovering = false;
      tRx = 0;
      tRy = 0;
      tScale = 1;
      if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    const tick = () => {
      // Smooth lerp — slow & elegant
      rx += (tRx - rx) * 0.12;
      ry += (tRy - ry) * 0.12;
      scale += (tScale - scale) * 0.12;
      el.style.transform = allow3D
        ? `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
        : `scale(${scale}) translateY(${hovering ? -3 : 0}px)`;
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [intensity, cap.allow3D, cap.reduceMotion]);

  return (
    <div
      ref={ref}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={glowRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), ${glowColor}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
