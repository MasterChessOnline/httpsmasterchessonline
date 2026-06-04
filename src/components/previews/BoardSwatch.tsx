/**
 * Universal mini-board swatch — same component used in Settings, Shop,
 * Chests so every "board preview" you see in the app is the EXACT colors
 * that get applied when you select / unlock it.
 */
interface Props {
  light: string; // HSL "h s% l%"
  dark: string;  // HSL "h s% l%"
  size?: number; // grid size (cells per side). 4 = compact, 6 = richer
  className?: string;
}

export default function BoardSwatch({ light, dark, size = 4, className = "" }: Props) {
  const cells = size * size;
  return (
    <div
      className={`grid rounded-lg overflow-hidden shadow-md w-full aspect-square ${className}`}
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
    </div>
  );
}
