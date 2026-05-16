import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "secondary";
  label?: string;
}

/**
 * Universal share button — copy link + X / Reddit / WhatsApp / Telegram.
 * Reusable across games, openings, mates, profiles, articles.
 */
export default function ShareButton({
  url,
  title,
  text,
  size = "sm",
  variant = "outline",
  label = "Share",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const shareText = text || title;

  const tryNativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ title, text: shareText, url: absoluteUrl });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const targets: { name: string; href: string }[] = [
    { name: "X / Twitter", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(absoluteUrl)}` },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${encodeURIComponent(absoluteUrl)}&title=${encodeURIComponent(title)}` },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${absoluteUrl}`)}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(shareText)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}` },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          onClick={async (e) => {
            // On mobile prefer native share sheet
            if (await tryNativeShare()) {
              e.preventDefault();
            }
          }}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={copyLink} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </DropdownMenuItem>
        {targets.map((t) => (
          <DropdownMenuItem key={t.name} asChild>
            <a href={t.href} target="_blank" rel="noopener noreferrer">
              Share on {t.name}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
