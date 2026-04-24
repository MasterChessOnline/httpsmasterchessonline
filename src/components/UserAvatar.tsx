import { CSSProperties } from "react";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import { cn } from "@/lib/utils";

type Props = {
  userId: string | null | undefined;
  /** Fallback name used to derive initials when there's no avatar. */
  fallbackName?: string | null;
  className?: string;
  /** Size in pixels (defaults to 100% of parent via CSS — only set if you need it). */
  size?: number;
  rounded?: boolean;
  style?: CSSProperties;
  alt?: string;
};

/**
 * Global avatar component. Always reads from `profiles.avatar_url`
 * via the shared cache + realtime listener — uploading a new picture
 * in Settings updates this everywhere instantly, no refresh required.
 */
export default function UserAvatar({
  userId,
  fallbackName,
  className,
  size,
  rounded = true,
  style,
  alt,
}: Props) {
  const { avatarUrl, displayName } = useUserAvatar(userId);
  const name = displayName || fallbackName || "?";
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";

  const dim = size ? { width: size, height: size } : null;
  const baseStyle: CSSProperties = { ...(dim || {}), ...style };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted text-muted-foreground flex items-center justify-center select-none",
        rounded ? "rounded-full" : "rounded-md",
        className,
      )}
      style={baseStyle}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={alt || name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-semibold">{initial}</span>
      )}
    </div>
  );
}
