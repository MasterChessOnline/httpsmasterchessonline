import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  QrCode,
  Mail,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Instagram,
  MessageSquare,
  Smartphone,
  Check,
  Share2,
} from "lucide-react";

interface Props {
  url: string;
  title?: string;
  message?: string;
}

/**
 * Universal invite panel with 10 share channels — WhatsApp, Telegram,
 * Facebook, X, Instagram (copy), Discord (copy), Gmail, SMS, Copy Link,
 * QR Code. Uses the OS native share sheet on supported devices for an
 * extra "Share via…" button on mobile.
 */
export default function TournamentInvitePanel({ url, title = "DB Chess Cup", message = "Join me in the DB Chess Cup on MasterChess." }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const enc = encodeURIComponent;
  const text = `${message} ${url}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${enc(url)}`;

  const copy = async (val: string, label = "Link copied") => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const nativeShare = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title, text: message, url });
      } else {
        copy(url);
      }
    } catch { /* user cancelled */ }
  };

  const channels = [
    { label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-500", href: `https://wa.me/?text=${enc(text)}` },
    { label: "Telegram", icon: Send,          color: "bg-sky-500",     href: `https://t.me/share/url?url=${enc(url)}&text=${enc(message)}` },
    { label: "Facebook", icon: Facebook,      color: "bg-blue-600",    href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "X",        icon: Twitter,       color: "bg-black",       href: `https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(url)}` },
    { label: "Gmail",    icon: Mail,          color: "bg-rose-500",    href: `https://mail.google.com/mail/?view=cm&su=${enc(title)}&body=${enc(text)}` },
    { label: "SMS",      icon: Smartphone,    color: "bg-zinc-600",    href: `sms:?&body=${enc(text)}` },
  ];

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-black/40 backdrop-blur p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="h-4 w-4 text-amber-300" />
        <h3 className="font-display text-base font-bold text-amber-100">Invite players</h3>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
          >
            <span className={`h-9 w-9 rounded-full ${c.color} grid place-items-center text-white shadow`}>
              <c.icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] text-amber-100/90 font-medium">{c.label}</span>
          </a>
        ))}

        <button
          onClick={() => copy(url, "Instagram: link copied — paste into bio or DM")}
          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
        >
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 grid place-items-center text-white shadow">
            <Instagram className="h-4 w-4" />
          </span>
          <span className="text-[11px] text-amber-100/90 font-medium">Instagram</span>
        </button>

        <button
          onClick={() => copy(url, "Discord: link copied — paste in any channel")}
          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
        >
          <span className="h-9 w-9 rounded-full bg-indigo-500 grid place-items-center text-white shadow">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className="text-[11px] text-amber-100/90 font-medium">Discord</span>
        </button>

        <button
          onClick={() => copy(url)}
          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
        >
          <span className="h-9 w-9 rounded-full bg-amber-500 grid place-items-center text-black shadow">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </span>
          <span className="text-[11px] text-amber-100/90 font-medium">{copied ? "Copied" : "Copy Link"}</span>
        </button>

        <button
          onClick={() => setShowQR((v) => !v)}
          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
        >
          <span className="h-9 w-9 rounded-full bg-white grid place-items-center text-black shadow">
            <QrCode className="h-4 w-4" />
          </span>
          <span className="text-[11px] text-amber-100/90 font-medium">QR Code</span>
        </button>
      </div>

      {showQR && (
        <div className="mb-3 flex flex-col items-center rounded-xl border border-white/10 bg-white p-3">
          <img src={qrSrc} alt="Tournament invite QR" width={220} height={220} loading="lazy" />
          <p className="mt-2 text-[11px] text-zinc-700 font-medium text-center break-all px-2">{url}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="flex-1 min-w-0 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-amber-100 font-mono"
        />
        <button
          type="button"
          onClick={nativeShare}
          className="rounded-md bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
        >
          Share…
        </button>
      </div>
    </div>
  );
}
