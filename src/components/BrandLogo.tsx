import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for the MasterChess crown logo.
 * Circular by design — matches the uploaded brand mark.
 * Set `withWordmark` to render the "MasterChess" text lockup next to the logo.
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
  /** Amber gradient ring around the circle. Default true. */
  withRing?: boolean;
  /** Outer gold glow halo. Default true for md+, off for xs/sm. */
  glow?: boolean;
  /** Slow shimmer sweep across the logo. Default true. */
  shimmer?: boolean;
  /** Render the "MasterChess" wordmark next to the mark. */
  withWordmark?: boolean;
  className?: string;
  ariaLabel?: string;
  motionProps?: MotionProps;
}

export default function BrandLogo({
  size = "md",
  withRing = true,
  glow,
  shimmer = true,
  withWordmark = false,
  className,
  ariaLabel = "MasterChess",
  motionProps,
}: BrandLogoProps) {
  const px = SIZE_PX[size];
  const showGlow = glow ?? (size !== "xs" && size !== "sm");

  const mark = (
    <motion.span
      className="relative inline-flex items-center justify-center shrink-0 select-none"
      style={{ width: px, height: px }}
      aria-label={withWordmark ? undefined : ariaLabel}
      role={withWordmark ? undefined : "img"}
      {...motionProps}
    >
      {showGlow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.55) 0%, rgba(251,191,36,0.15) 45%, transparent 70%)",
          }}
        />
      )}

      {withRing ? (
        <span
          aria-hidden
          className="relative rounded-full p-[2px]"
          style={{
            width: px,
            height: px,
            background:
              "conic-gradient(from 220deg at 50% 50%, #f6d67a 0%, #b8862c 25%, #f9e39a 50%, #8a5c14 75%, #f6d67a 100%)",
            boxShadow:
              "0 6px 22px -6px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black">
            <img
              src="/masterchess-logo.png"
              alt=""
              width={px}
              height={px}
              className="h-full w-full object-cover drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]"
              draggable={false}
            />
            {shimmer && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
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
          src="/masterchess-logo.png"
          alt=""
          width={px}
          height={px}
          className="h-full w-full rounded-full object-cover"
          draggable={false}
        />
      )}
    </motion.span>
  );

  if (!withWordmark) return <span className={className}>{mark}</span>;

  // Font-size scales with mark size.
  const textSize =
    size === "xs" ? "text-base" :
    size === "sm" ? "text-lg" :
    size === "md" ? "text-xl" :
    size === "lg" ? "text-2xl" :
    size === "xl" ? "text-3xl" : "text-4xl";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={ariaLabel}
      role="img"
    >
      {mark}
      <span
        className={cn(
          "font-black tracking-tight leading-none whitespace-nowrap",
          textSize,
        )}
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fde68a 0%, #f6d67a 40%, #b8862c 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 1px 0 rgba(0,0,0,0.35)",
        }}
      >
        MasterChess
      </span>
    </span>
  );
}
