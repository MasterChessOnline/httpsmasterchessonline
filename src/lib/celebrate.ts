import confetti from "canvas-confetti";

const GOLD = ["#FFD700", "#FFA500", "#F5C518", "#FFB347", "#EAB308"];

/** Quick celebratory burst — use on game win, badge unlock, signup success. */
export function celebrate(intensity: "small" | "medium" | "big" = "medium") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const counts = { small: 60, medium: 150, big: 280 };
  const count = counts[intensity];

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      origin: { y: 0.7 },
      colors: GOLD,
      particleCount: Math.floor(count * particleRatio),
      ...opts,
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.1 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

/** Cinematic side cannons — for milestone moments (first win, level up). */
export function celebrateSideCannons() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: GOLD });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
