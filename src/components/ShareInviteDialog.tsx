import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Mail, MessageCircle, Send, Share2, Phone, Instagram, Twitter, Facebook } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Title shown in the dialog header */
  title?: string;
  /** Public URL the friend opens to accept the invite / view the tournament. */
  url: string;
  /** Short message/preview text used by share targets (Viber, WhatsApp, Email…). */
  message: string;
  /** Optional email subject */
  emailSubject?: string;
}

/**
 * Universal share dialog for inviting a friend to a tournament or 1-on-1 game
 * via Viber, WhatsApp, Telegram, Email, Instagram, X/Twitter, Facebook,
 * the device's native share sheet, or a plain copyable link.
 */
const ShareInviteDialog = ({
  open,
  onOpenChange,
  title = "Invite a friend",
  url,
  message,
  emailSubject = "Join me on MasterChess",
}: Props) => {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const fullText = `${message} ${url}`;

  const channels: { key: string; label: string; href: string; icon: any; color: string; external?: boolean }[] = [
    {
      key: "viber",
      label: "Viber",
      href: `viber://forward?text=${enc(fullText)}`,
      icon: Phone,
      color: "text-purple-400",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(fullText)}`,
      icon: MessageCircle,
      color: "text-green-400",
      external: true,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(message)}`,
      icon: Send,
      color: "text-sky-400",
      external: true,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${enc(emailSubject)}&body=${enc(fullText)}`,
      icon: Mail,
      color: "text-amber-400",
    },
    {
      key: "instagram",
      label: "Instagram DM",
      href: `https://www.instagram.com/direct/new/?text=${enc(fullText)}`,
      icon: Instagram,
      color: "text-pink-400",
      external: true,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(url)}`,
      icon: Twitter,
      color: "text-foreground",
      external: true,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(message)}`,
      icon: Facebook,
      color: "text-blue-400",
      external: true,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Paste it anywhere to share." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select the link and copy it manually.", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: emailSubject, text: message, url });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Send this link via your favorite app. Anyone with the link can join.
          </p>

          {/* Copyable link */}
          <div className="flex gap-2">
            <Input value={url} readOnly className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Channel grid */}
          <div className="grid grid-cols-4 gap-2">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.key}
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all"
                >
                  <Icon className={`h-5 w-5 ${c.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] text-foreground font-medium text-center leading-tight">{c.label}</span>
                </a>
              );
            })}
            <button
              onClick={handleNativeShare}
              className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all"
            >
              <Share2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-foreground font-medium text-center leading-tight">More…</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareInviteDialog;
