import { usePresence } from "@/hooks/use-presence";

interface Props {
  userId: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Pulsing green dot if the given user is currently in the realtime
 * 'online-users' channel. Real signal only — no fake data.
 */
export default function PresenceDot({ userId, className = "", showLabel = false }: Props) {
  const { isOnline } = usePresence();
  const online = isOnline(userId);

  if (!online) {
    return showLabel ? (
      <span className={`inline-flex items-center gap-1.5 text-[10px] text-muted-foreground ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        Offline
      </span>
    ) : null;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {showLabel && <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Live</span>}
    </span>
  );
}
