/**
 * Universal mini-board swatch — same component used in Settings, Shop,
 * Chests so every "board preview" you see in the app is the EXACT colors
 * that get applied when you select / unlock it.
 *
 * For legendary themes (lava, aqua, aurora, nebula, obsidian, magma)
 * an animated effect overlay is layered on top of the checker grid so
 * the board literally LOOKS like water / lava / aurora / etc.
 */
interface Props {
  light: string; // HSL "h s% l%"
  dark: string;  // HSL "h s% l%"
  size?: number; // grid size (cells per side). 4 = compact, 6 = richer
  themeKey?: string; // optional — triggers animated FX overlay for legendary themes
  className?: string;
}

type FX =
  | "lava" | "aqua" | "aurora" | "nebula" | "obsidian" | "magma"
  | null;

function fxFor(key?: string): FX {
  switch (key) {
    case "lava": case "lava_alt": return "lava";
    case "magma": return "magma";
    case "aqua": case "aqua_alt": return "aqua";
    case "aurora": case "aurora_alt": return "aurora";
    case "nebula": case "nebula_alt": return "nebula";
    case "obsidian": return "obsidian";
    default: return null;
  }
}

export default function BoardSwatch({ light, dark, size = 4, themeKey, className = "" }: Props) {
  const cells = size * size;
  const fx = fxFor(themeKey);

  return (
    <div
      className={`relative grid rounded-lg overflow-hidden shadow-md w-full aspect-square ${className}`}
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        boxShadow: `0 4px 14px -4px hsl(${dark} / 0.6), inset 0 0 0 1px hsl(${dark} / 0.4)`,
      }}
    >
      {Array.from({ length: cells }).map((_, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const isLight = (row + col) % 2 === 0;
        return (
          <div
            key={i}
            style={{ backgroundColor: `hsl(${isLight ? light : dark})` }}
          />
        );
      })}

      {/* === FX overlays === */}
      {fx === "lava" && <LavaFX />}
      {fx === "magma" && <MagmaFX />}
      {fx === "aqua" && <AquaFX />}
      {fx === "aurora" && <AuroraFX />}
      {fx === "nebula" && <NebulaFX />}
      {fx === "obsidian" && <ObsidianFX />}
    </div>
  );
}

/* ============== FX layers (pure CSS, no JS animation cost) ============== */

function LavaFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
        style={{
          background:
            "radial-gradient(60% 40% at 30% 70%, rgba(255,140,40,0.85), transparent 70%)," +
            "radial-gradient(45% 35% at 75% 25%, rgba(255,90,30,0.7), transparent 70%)," +
            "radial-gradient(30% 25% at 50% 50%, rgba(255,210,80,0.7), transparent 70%)",
          animation: "fx-lava 6s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-60"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(255,80,0,0.35) 0 2px, transparent 2px 6px)",
        }}
      />
      <style>{`@keyframes fx-lava{0%{filter:hue-rotate(0deg) brightness(1)}100%{filter:hue-rotate(-15deg) brightness(1.15)}}`}</style>
    </>
  );
}

function MagmaFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 60%, rgba(255,160,30,0.0), rgba(255,80,20,0.85), rgba(255,210,80,0.6), rgba(255,80,20,0.85), rgba(255,160,30,0.0))",
          animation: "fx-magma 14s linear infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0 1px, transparent 2px)," +
            "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 0 1px, transparent 2px)," +
            "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.4) 0 1px, transparent 2px)",
        }}
      />
      <style>{`@keyframes fx-magma{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function AquaFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
        style={{
          background:
            "radial-gradient(80% 50% at 50% 0%, rgba(180,240,255,0.55), transparent 70%)," +
            "linear-gradient(180deg, rgba(0,180,255,0.25), rgba(0,40,90,0.45))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 12px)",
          animation: "fx-aqua 7s linear infinite",
        }}
      />
      <style>{`@keyframes fx-aqua{0%{transform:translateX(-15%)}100%{transform:translateX(15%)}}`}</style>
    </>
  );
}

function AuroraFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
        style={{
          background:
            "linear-gradient(120deg, rgba(60,255,180,0.0) 20%, rgba(60,255,180,0.6) 35%, rgba(140,80,255,0.55) 55%, rgba(255,80,200,0.5) 70%, rgba(60,255,180,0.0) 90%)",
          backgroundSize: "200% 100%",
          animation: "fx-aurora 8s ease-in-out infinite alternate",
        }}
      />
      <style>{`@keyframes fx-aurora{0%{background-position:0% 50%}100%{background-position:100% 50%}}`}</style>
    </>
  );
}

function NebulaFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
        style={{
          background:
            "radial-gradient(40% 40% at 30% 30%, rgba(255,100,200,0.7), transparent 70%)," +
            "radial-gradient(45% 45% at 70% 65%, rgba(100,120,255,0.7), transparent 70%)," +
            "radial-gradient(25% 25% at 50% 50%, rgba(255,240,180,0.5), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 22%, white 0.5px, transparent 1px)," +
            "radial-gradient(circle at 30% 70%, white 0.6px, transparent 1px)," +
            "radial-gradient(circle at 55% 18%, white 0.5px, transparent 1px)," +
            "radial-gradient(circle at 80% 40%, white 0.7px, transparent 1px)," +
            "radial-gradient(circle at 68% 82%, white 0.5px, transparent 1px)," +
            "radial-gradient(circle at 90% 88%, white 0.6px, transparent 1px)",
          animation: "fx-stars 4s ease-in-out infinite alternate",
        }}
      />
      <style>{`@keyframes fx-stars{0%{opacity:.4}100%{opacity:1}}`}</style>
    </>
  );
}

function ObsidianFX() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-70"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,200,80,0.0) 35%, rgba(255,210,110,0.45) 50%, rgba(255,200,80,0.0) 65%)",
          backgroundSize: "200% 200%",
          animation: "fx-obsidian 5s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes fx-obsidian{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}`}</style>
    </>
  );
}
