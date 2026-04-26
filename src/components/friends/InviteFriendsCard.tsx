import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Mail } from "lucide-react";
import { toast } from "sonner";

/**
 * Invite Friends card.
 *
 * Shows a personal referral link to https://masterchess.live and a row of
 * platform-specific share buttons (Viber, WhatsApp, Telegram, Facebook, X,
 * Instagram, Email, copy). Message is in English so it works across regions.
 */
interface InviteFriendsCardProps {
  /** Optional username — used to add ?ref=username to the link. */
  username?: string | null;
  /** Display name shown in the share copy. */
  displayName?: string | null;
  /**
   * "invite" → personal friend invite (default, used on /friends).
   * "share"  → generic site-wide share card (used on the homepage).
   */
  variant?: "invite" | "share";
}

const INVITE_DOMAIN = "https://masterchess.live";

// Brand colors for icon-buttons (kept locally to avoid touching design tokens).
const PLATFORM_BTN =
  "h-11 w-11 rounded-xl border border-border/50 bg-card hover:bg-primary/10 hover:border-primary/40 transition-all flex items-center justify-center";

export default function InviteFriendsCard({
  username,
  displayName,
  variant = "invite",
}: InviteFriendsCardProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = useMemo(() => {
    if (variant === "invite" && username) {
      return `${INVITE_DOMAIN}/?ref=${encodeURIComponent(username)}`;
    }
    return `${INVITE_DOMAIN}/`;
  }, [username, variant]);

  const inviter = displayName || username || "A friend";
  const message =
    variant === "share"
      ? `♟️ Play, learn and compete on MasterChess — opening trainer, live games, tournaments and bots from 400 to 3200 ELO. Join free: ${inviteUrl}`
      : `${inviter} invites you to play chess on MasterChess — train, learn openings, and play live games. Join now: ${inviteUrl}`;
  const shortMessage =
    variant === "share"
      ? `Play, learn and compete on MasterChess ♟️ ${inviteUrl}`
      : `Join me on MasterChess and let's play! ${inviteUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "MasterChess",
          text: shortMessage,
          url: inviteUrl,
        });
      } catch {
        /* user dismissed */
      }
    } else {
      copyLink();
    }
  };

  // Encoded payloads for share URLs
  const enc = encodeURIComponent(message);
  const encUrl = encodeURIComponent(inviteUrl);
  const encShort = encodeURIComponent(shortMessage);

  const platforms: Array<{
    key: string;
    label: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      key: "viber",
      label: "Viber",
      href: `viber://forward?text=${enc}`,
      color: "#7360F2",
      icon: <ViberIcon />,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc}`,
      color: "#25D366",
      icon: <WhatsAppIcon />,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encUrl}&text=${encShort}`,
      color: "#229ED9",
      icon: <TelegramIcon />,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encShort}`,
      color: "#1877F2",
      icon: <FacebookIcon />,
    },
    {
      key: "x",
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encShort}`,
      color: "#0f0f0f",
      icon: <XIcon />,
    },
    {
      key: "instagram",
      label: "Instagram (copy + open)",
      onClick: async () => {
        await navigator.clipboard.writeText(message).catch(() => {});
        toast.success("Message copied — paste it in Instagram DM");
        window.open("https://www.instagram.com/direct/inbox/", "_blank");
      },
      color: "#E4405F",
      icon: <InstagramIcon />,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(
        "Play chess with me on MasterChess",
      )}&body=${enc}`,
      color: "hsl(var(--primary))",
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-bold text-foreground">
            {variant === "share"
              ? "Share MasterChess"
              : "Invite friends to MasterChess"}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {variant === "share"
            ? "Spread the word — send the link to anyone who loves chess. They'll land straight on the homepage."
            : "Share your personal invite link. When friends join, you'll be able to challenge them right away."}
        </p>

        {/* Link + copy */}
        <div className="flex items-center gap-2 mb-4">
          <Input
            readOnly
            value={inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="font-mono text-xs bg-background/60"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={copyLink}
            className="shrink-0 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </Button>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Share via
          </p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) =>
              p.href ? (
                <a
                  key={p.key}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.label}
                  aria-label={`Share on ${p.label}`}
                  className={PLATFORM_BTN}
                  style={{ color: p.color }}
                >
                  {p.icon}
                </a>
              ) : (
                <button
                  key={p.key}
                  type="button"
                  onClick={p.onClick}
                  title={p.label}
                  aria-label={`Share on ${p.label}`}
                  className={PLATFORM_BTN}
                  style={{ color: p.color }}
                >
                  {p.icon}
                </button>
              ),
            )}
            {/* Native share fallback (mobile) */}
            <button
              type="button"
              onClick={nativeShare}
              title="More…"
              aria-label="More share options"
              className={PLATFORM_BTN + " text-primary"}
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview message */}
        <div className="mt-4 rounded-lg border border-border/40 bg-background/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Preview
          </p>
          <p className="text-xs text-foreground/90 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Inline brand icons (no extra deps) ---------------- */

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .02 5.35.02 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.2-1.62a11.97 11.97 0 005.8 1.48h.01c6.62 0 11.97-5.35 11.98-11.97 0-3.2-1.25-6.21-3.47-8.41zM12 21.84h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.68.96.98-3.59-.24-.37A9.86 9.86 0 012.14 12C2.14 6.6 6.6 2.14 12 2.14c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.9 6.94c-.01 5.4-4.47 9.86-9.89 9.86zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 00-.8.37c-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M11.4.07C9.05.21 5.92.78 3.85 2.74 2.32 4.27 1.55 6.4 1.46 9.05c-.09 2.65-.2 7.62 4.6 8.97v2.06c0 .59.71.88 1.13.46l2.11-2.13c3.27.18 5.78-.45 6.06-.55 1.66-.55 11.05-1.74 7.6-13.3C22.21 1.7 16.79-.45 11.4.07zm6.18 14.48c-.79.43-1.66.36-2.6-.05-.94-.41-1.84-.96-2.65-1.62-.81-.66-1.55-1.4-2.21-2.21-.66-.81-1.21-1.71-1.62-2.65-.41-.94-.48-1.81-.05-2.6.27-.5.65-.91 1.13-1.16.21-.11.46-.04.6.16l1.07 1.51c.13.18.1.43-.05.59l-.5.5a.4.4 0 00-.08.45c.27.55.66 1.03 1.13 1.5.47.47.95.86 1.5 1.13a.4.4 0 00.45-.08l.5-.5a.43.43 0 01.59-.05l1.51 1.07c.2.14.27.39.16.6-.25.48-.66.86-1.16 1.13zM12 4.39a.4.4 0 010-.8c2.42 0 4.4 1.97 4.4 4.4a.4.4 0 01-.8 0c0-2-1.6-3.6-3.6-3.6zm0 1.7a.4.4 0 010-.8c1.49 0 2.7 1.21 2.7 2.7a.4.4 0 01-.8 0c0-1.05-.85-1.9-1.9-1.9zm0 1.7a.4.4 0 010-.8c.55 0 1 .45 1 1a.4.4 0 01-.8 0c0-.11-.09-.2-.2-.2z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M21.86 4.04L18.7 19.43c-.24 1.05-.86 1.31-1.74.82l-4.81-3.55-2.32 2.24c-.26.26-.47.47-.96.47l.34-4.86 8.84-7.99c.39-.34-.08-.53-.6-.19L6.51 13.34l-4.7-1.47c-1.02-.32-1.04-1.02.21-1.51L20.6 2.66c.85-.32 1.6.19 1.26 1.38z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.91h-2.33V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.5 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 00-2.13 1.39A5.9 5.9 0 00.62 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.39 2.13.67.66 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.73 2.13-1.39.66-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 00-1.39-2.13A5.9 5.9 0 0019.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
  );
}
