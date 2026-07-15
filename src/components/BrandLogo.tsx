import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for the MasterChess crown logo.
 * Every navbar, footer, splash, auth header, and hero badge should
 * render through this component so future logo/style tweaks live in one place.
 */
type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_PX: Record<Size, number> = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
  "2xl": 140,
};

interface BrandLogoProps {
  size?: Size;
  /** Amber gradient ring + inner black bevel. Default true. */
  withRing?: boolean;
  /** Outer gold glow halo. Default true for md+, off for xs/sm. */
  glow?: boolean;
  /** Slow shimmer sweep across the logo. Default true. */
  shimmer?: boolean;
  className?: string;
  ariaLabel?: string;
  motionProps?: MotionProps;
}

export default function BrandLogo({
  size = "md",
  withRing = true,
  glow,
  shimmer = true,
  className,
  ariaLabel = "MasterChess",
  motionProps,
}: BrandLogoProps) {
  const px = SIZE_PX[size];
  const showGlow = glow ?? (size !== "xs" && size !== "sm");
  const pad = withRing ? Math.max(2, Math.round(px * 0.06)) : 0;

  return (
    <motion.span
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 select-none",
        className,
      )}
      style={{ width: px, height: px }}
      aria-label={ariaLabel}
      role="img"
      {...motionProps}
    >
      {showGlow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-[22%] blur-xl opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.55) 0%, rgba(251,191,36,0.15) 45%, transparent 70%)",
          }}
        />
      )}

      {withRing ? (
        <span
          aria-hidden
          className="relative rounded-[22%] p-[2px]"
          style={{
            width: px,
            height: px,
            background:
              "conic-gradient(from 220deg at 50% 50%, #f6d67a 0%, #b8862c 25%, #f9e39a 50%, #8a5c14 75%, #f6d67a 100%)",
            boxShadow:
              "0 6px 22px -6px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          <span
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20%] bg-black"
            style={{ padding: pad }}
          >
            <img
              src="/app-icon-192.png"
              alt=""
              width={px}
              height={px}
              className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]"
              draggable={false}
            />
            {shimmer && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ x: "-120%" }}
                animate={{ x: "120%" }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 5.5,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                  mixBlendMode: "screen",
                }}
              />
            )}
          </span>
        </span>
      ) : (
        <img
          src="/app-icon-192.png"
          alt=""
          width={px}
          height={px}
          className="h-full w-full object-contain"
          draggable={false}
        />
      )}
    </motion.span>
  );
}
