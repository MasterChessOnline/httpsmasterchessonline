import { useEffect, useState } from "react";

export type DeviceTier = "high" | "medium" | "low";

interface Capability {
  tier: DeviceTier;
  reduceMotion: boolean;
  isMobile: boolean;
  /** Allow heavy effects (parallax, particles, blur). */
  allowHeavy: boolean;
  /** Allow 3D tilt / perspective transforms. */
  allow3D: boolean;
}

/**
 * Detects device capability for the 4D system.
 * Gates heavy effects on weak devices and respects prefers-reduced-motion.
 */
export function useDeviceCapability(): Capability {
  const [cap, setCap] = useState<Capability>(() => detect());

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const update = () => setCap(detect());
    mqMotion.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqMotion.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  return cap;
}

function detect(): Capability {
  if (typeof window === "undefined") {
    return { tier: "high", reduceMotion: false, isMobile: false, allowHeavy: true, allow3D: true };
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const cores = (navigator as any).hardwareConcurrency ?? 8;
  const memory = (navigator as any).deviceMemory ?? 8;

  let tier: DeviceTier = "high";
  if (cores <= 4 || memory <= 4) tier = "medium";
  if (cores <= 2 || memory <= 2 || isMobile) tier = isMobile && cores >= 6 ? "medium" : "low";

  const allowHeavy = !reduceMotion && tier !== "low";
  const allow3D = !reduceMotion && tier === "high";

  return { tier, reduceMotion, isMobile, allowHeavy, allow3D };
}
