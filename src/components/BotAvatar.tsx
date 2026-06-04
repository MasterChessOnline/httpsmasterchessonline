import type { CSSProperties } from "react";

/**
 * Bot avatar renderer. If `avatar` looks like a URL (or imported asset) we
 * render an <img>; otherwise we render the string as an emoji/glyph.
 * Lets BotProfile entries opt into a real portrait without breaking the
 * existing emoji-string contract.
 */
interface Props {
  avatar: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** When rendered as emoji, this is the text size. */
  emojiClassName?: string;
}

function isImage(src: string) {
  return /^(https?:|\/|data:image|blob:)/.test(src) || /\.(png|jpe?g|webp|gif|svg)$/i.test(src);
}

export default function BotAvatar({
  avatar, alt = "Bot", className = "", style, emojiClassName = "",
}: Props) {
  if (isImage(avatar)) {
    return (
      <img
        src={avatar}
        alt={alt}
        draggable={false}
        className={`object-cover rounded-full ${className}`}
        style={style}
      />
    );
  }
  return <span className={emojiClassName || className} style={style}>{avatar}</span>;
}
