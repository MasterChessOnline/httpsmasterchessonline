/**
 * Small inline clan tag badge — e.g. [GMX] in clan color.
 * Reusable next to player names or club titles.
 */
export default function ClanTag({
  tag,
  color = "#d4a843",
  size = "sm",
  className = "",
}: {
  tag: string | null | undefined;
  color?: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  if (!tag) return null;
  const sizes = {
    xs: "text-[9px] px-1 py-[1px]",
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
  } as const;
  const c = color || "#d4a843";
  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded ${sizes[size]} ${className}`}
      style={{
        color: c,
        background: `${c}1a`,
        border: `1px solid ${c}40`,
        textShadow: `0 0 8px ${c}55`,
      }}
      aria-label={`Clan ${tag}`}
    >
      [{tag}]
    </span>
  );
}
