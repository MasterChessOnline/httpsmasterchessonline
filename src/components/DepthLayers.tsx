import React, { useEffect, useRef } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";

const DepthLayers = React.forwardRef<HTMLDivElement>((_p, _r) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const cap = useDeviceCapability();

  useEffect(() => {
    if (!cap.allowHeavy) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      // Normalize to -0.5 → 0.5
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      // Lerp toward target for buttery motion
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${curX * -12}px, ${curY * -8}px, 0)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate3d(${curX * -28}px, ${curY * -20}px, 0)`;
      }
      if (frontRef.current) {
        frontRef.current.style.transform = `translate3d(${curX * 50}px, ${curY * 38}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [cap.allowHeavy]);

  // Low-end devices: skip the entire system
  if (cap.tier === "low" || cap.reduceMotion) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Layer 1 — deep background (slowest) */}
      <div
        ref={bgRef}
        className="absolute -inset-[5%] will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, hsl(43 90% 55% / 0.04) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, hsl(30 60% 40% / 0.05) 0%, transparent 55%)",
        }}
      />

      {/* Layer 2 — mid plane orbs */}
      <div ref={midRef} className="absolute inset-0 will-change-transform">
        <div
          className="absolute rounded-full opacity-[0.08] depth-orb-drift"
          style={{
            width: 520,
            height: 520,
            top: "10%",
            left: "12%",
            background:
              "radial-gradient(circle, hsl(43 90% 55% / 0.6) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute rounded-full opacity-[0.06] depth-orb-drift"
          style={{
            width: 420,
            height: 420,
            bottom: "8%",
            right: "10%",
            background:
              "radial-gradient(circle, hsl(30 60% 40% / 0.7) 0%, transparent 65%)",
            filter: "blur(6px)",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Layer 3 — front plane subtle highlight */}
      <div
        ref={frontRef}
        className="absolute inset-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, hsl(43 90% 60% / 0.025) 0%, transparent 40%)",
        }}
      />
    </div>
  );
});
DepthLayers.displayName = "DepthLayers";
export default DepthLayers;
